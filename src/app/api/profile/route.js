import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function PATCH(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Extract only fields we allow the user to update themselves
    const { 
      nickname, phone, lineId, instagram, address, 
      shirtSize, bloodGroup, allergies, medicalCondition, 
      mbti, eColor, avatarUrl 
    } = data;

    const updateData = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (phone !== undefined) updateData.phone = phone;
    if (lineId !== undefined) updateData.lineId = lineId;
    if (instagram !== undefined) updateData.instagram = instagram;
    if (address !== undefined) updateData.address = address;
    if (shirtSize !== undefined) updateData.shirtSize = shirtSize;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (allergies !== undefined) updateData.allergies = allergies;
    if (medicalCondition !== undefined) updateData.medicalCondition = medicalCondition;
    if (mbti !== undefined) updateData.mbti = mbti;
    if (eColor !== undefined) updateData.eColor = eColor;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const updatedUser = await prisma.member.update({
      where: { id: session.userId },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
