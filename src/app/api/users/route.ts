import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export async function GET() {
  try {
    const users = await query({
      query: 'SELECT id, first_name, last_name, email, company, role, created_at, updated_at FROM users',
      values: [],
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { first_name, last_name, email, company, role, password } = await request.json();

    const result = await query({
      query: `
        INSERT INTO users (first_name, last_name, email, company, role, password)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      values: [first_name, last_name, email, company, role, password], // Note: In production, password should be hashed
    });

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, first_name, last_name, email, company, role } = await request.json();

    await query({
      query: `
        UPDATE users
        SET first_name = ?, last_name = ?, email = ?, company = ?, role = ?
        WHERE id = ?
      `,
      values: [first_name, last_name, email, company, role, id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await query({
      query: 'DELETE FROM users WHERE id = ?',
      values: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
