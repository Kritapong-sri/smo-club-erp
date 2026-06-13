import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

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
