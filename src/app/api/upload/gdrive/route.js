import { NextResponse } from 'next/server';
import { uploadToGoogleDrive } from '@/lib/gdrive';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'ไม่พบไฟล์ที่เลือก' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = file.name || 'document.pdf';
    const mimeType = file.type || 'application/pdf';

    const hasGDriveConfig =
      (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) ||
      (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);

    // บน Vercel ระบบไฟล์เป็น read-only จึงบันทึกไฟล์ลงเครื่องไม่ได้ ต้องใช้ Google Drive เท่านั้น
    const isServerless = !!process.env.VERCEL;
    let gdriveError = null;

    if (hasGDriveConfig) {
      try {
        const driveResult = await uploadToGoogleDrive({ buffer, fileName, mimeType });
        return NextResponse.json({
          success: true,
          url: driveResult.webViewLink,
          fileName: driveResult.fileName,
          fileId: driveResult.fileId,
          source: 'google_drive'
        });
      } catch (gdriveErr) {
        console.error('Google Drive Upload Error:', gdriveErr);
        gdriveError = gdriveErr;
      }
    }

    if (isServerless) {
      const reason = !hasGDriveConfig
        ? 'ยังไม่ได้ตั้งค่า Google Drive บน Vercel'
        : gdriveError?.message === 'invalid_grant'
          ? 'Google Drive token หมดอายุ (invalid_grant) — ต้องสร้าง GOOGLE_REFRESH_TOKEN ใหม่'
          : `Google Drive: ${gdriveError?.message}`;
      return NextResponse.json(
        { error: `อัปโหลดไม่สำเร็จ: ${reason} — ระหว่างนี้ใช้โหมด "วางลิงก์" แทนได้` },
        { status: 502 }
      );
    }

    // Fallback (เฉพาะตอนรันในเครื่อง): บันทึกไฟล์ไว้ที่ public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, safeName);
    await writeFile(filePath, buffer);

    const localUrl = `/uploads/${safeName}`;

    return NextResponse.json({
      success: true,
      url: localUrl,
      fileName,
      source: 'local_fallback',
      warning: hasGDriveConfig ? undefined : 'ยังไม่ได้ระบุ Google Drive Service Account ใน .env ระบบบันทึกไฟล์ชั่วคราวไว้ที่เครื่อง'
    });

  } catch (error) {
    console.error('Upload Route Error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ' + error.message }, { status: 500 });
  }
}
