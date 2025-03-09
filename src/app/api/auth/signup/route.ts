import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { pool } from '@/lib/db';
import { RowDataPacket, OkPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, company, password } = await request.json();

    // Validate input
    if (!firstName || !lastName || !email || !company || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Insert user into database
    const [result] = await pool.query<OkPacket>(
      'INSERT INTO users (first_name, last_name, email, company, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, company, hashedPassword, 'user']
    );

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: result.insertId,
        firstName,
        lastName,
        email,
        company,
        role: 'user'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
} 