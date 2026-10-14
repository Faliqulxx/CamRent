import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('logo') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file logo yang diunggah.' }, { status: 400 });
    }

    // Validate mime type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Harap unggah file PNG, JPG, WebP, atau SVG.' },
        { status: 400 }
      );
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal ukuran file logo adalah 5MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extension
    let ext = '.png';
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') ext = '.jpg';
    else if (file.type === 'image/webp') ext = '.webp';
    else if (file.type === 'image/svg+xml') ext = '.svg';

    const filename = `logo-${Date.now()}${ext}`;

    // Try saving to public/assets directory
    const targetDir = path.join(process.cwd(), 'public', 'assets');
    let publicUrl = `/assets/${filename}`;

    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const targetPath = path.join(targetDir, filename);
      fs.writeFileSync(targetPath, buffer);
    } catch (fsErr) {
      console.warn('Filesystem read-only or error, falling back to base64 Data URL:', fsErr);
      // Fallback for ephemeral / serverless read-only disk
      const base64 = buffer.toString('base64');
      publicUrl = `data:${file.type};base64,${base64}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: file.name,
      size: file.size,
    });
  } catch (err: any) {
    console.error('Error uploading logo:', err);
    return NextResponse.json(
      { error: err.message || 'Gagal mengunggah file logo.' },
      { status: 500 }
    );
  }
}
