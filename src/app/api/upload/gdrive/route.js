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

    const hasGDriveConfig = process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY;

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
        // Fallback to Local Upload if GDrive upload fails
      }
    }

    // Fallback: Local Upload Proxy
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
