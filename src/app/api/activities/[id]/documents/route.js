import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { deleteFromGoogleDrive } from '@/lib/gdrive';
import { unlink } from 'fs/promises';
import path from 'path';

export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { fileName, fileUrl, fileType } = await request.json();

    if (!fileName || !fileUrl) {
      return NextResponse.json({ error: 'Missing fileName or fileUrl' }, { status: 400 });
    }

    const document = await prisma.activityDocument.create({
      data: {
        fileName,
        fileUrl,
        fileType: fileType || 'other',
        activityId: id,
        uploadedById: session.userId,
      },
      include: {
        uploadedBy: true,
      }
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Failed to upload document:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'Missing documentId' }, { status: 400 });
    }

    const existingDoc = await prisma.activityDocument.findUnique({
      where: { id: documentId }
    });

    if (!existingDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Permission check: uploader or admin/board/head
    const canDelete = existingDoc.uploadedById === session.userId || 
      ['admin', 'board', 'head'].includes(session.role);

    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Delete from Google Drive if it's a Google Drive URL
    const gdriveMatch = existingDoc.fileUrl?.match(/\/d\/([a-zA-Z0-9_-]+)/) || existingDoc.fileUrl?.match(/id=([a-zA-Z0-9_-]+)/);
    if (gdriveMatch && gdriveMatch[1]) {
      const driveFileId = gdriveMatch[1];
      console.log(`[Delete Document] Deleting file from Google Drive (ID: ${driveFileId})`);
      await deleteFromGoogleDrive(driveFileId);
    }

    // 2. Delete local file if it's a local fallback upload (/uploads/xxx)
    if (existingDoc.fileUrl?.startsWith('/uploads/')) {
      try {
        const localPath = path.join(process.cwd(), 'public', existingDoc.fileUrl);
        await unlink(localPath);
        console.log(`[Delete Document] Deleting local file: ${localPath}`);
      } catch (fsErr) {
        console.warn('Could not delete local file:', fsErr.message);
      }
    }

    // 3. Delete record from Supabase database
    await prisma.activityDocument.delete({
      where: { id: documentId }
    });

    return NextResponse.json({ success: true, message: 'Document deleted from database and storage' });
  } catch (error) {
    console.error('Failed to delete document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
