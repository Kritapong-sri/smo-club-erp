import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // --- LOCAL STORAGE FALLBACK ---
    // เนื่องจาก Imgur บล็อกการอัปโหลดจาก API สาธารณะ (Forbidden 400)
    // เราจะใช้การเซฟลงในโฟลเดอร์ public/uploads แทนชั่วคราวสำหรับการทดสอบ
    // เมื่อพร้อมใช้งานจริง แนะนำให้ตั้งค่า Cloudinary ใน .env
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.]/g, '');
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    // Save to disk
    await writeFile(filepath, buffer);

    // Return the local URL
    return NextResponse.json({ url: `/uploads/${filename}` });

  } catch (error) {
    console.error('Upload proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
