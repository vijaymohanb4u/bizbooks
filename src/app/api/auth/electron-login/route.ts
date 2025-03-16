import { NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { pool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// Configure the route as dynamic
export const dynamic = 'force-dynamic';

interface User extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}

export async function POST(request: Request) {
  try {
    // Check if request is from Electron
    const isElectron = request.headers.get('x-electron-app') === 'true';
    
    if (!isElectron) {
      // Silent warning
    }
    
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const [users] = await pool.query<User[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { error: 'No user found with this email' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Return user without password
    return NextResponse.json({
      user: {
        id: user.id.toString(),
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 