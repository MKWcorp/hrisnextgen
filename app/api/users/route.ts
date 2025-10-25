import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      select: {
        user_id: true,
        name: true,
        roles: {
          select: {
            role_name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    // Return empty array instead of error object to prevent frontend crashes
    return NextResponse.json([]);
  }
}
