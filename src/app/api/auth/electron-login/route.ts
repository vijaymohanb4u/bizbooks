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
  console.log('[ELECTRON_LOGIN_API] Received login request');
  
  try {
    // Check if request is from Electron
    const isElectron = request.headers.get('x-electron-app') === 'true';
    console.log(`[ELECTRON_LOGIN_API] Request from Electron: ${isElectron}`);
    
    if (!isElectron) {
      console.warn('[ELECTRON_LOGIN_API] Attempt to access Electron login API from non-Electron client');
    }
    
    const body = await request.json();
    console.log(`[ELECTRON_LOGIN_API] Login attempt for email: ${body.email}`);
    
    const { email, password } = body;

    if (!email || !password) {
      console.error('[ELECTRON_LOGIN_API] Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    console.log(`[ELECTRON_LOGIN_API] Looking up user with email: ${email}`);
    const [users] = await pool.query<User[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const user = users[0];

    if (!user) {
      console.error(`[ELECTRON_LOGIN_API] No user found with email: ${email}`);
      return NextResponse.json(
        { error: 'No user found with this email' },
        { status: 401 }
      );
    }

    // Verify password
    console.log('[ELECTRON_LOGIN_API] Verifying password');
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      console.error('[ELECTRON_LOGIN_API] Invalid password');
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Return user without password
    console.log(`[ELECTRON_LOGIN_API] Authentication successful for user: ${user.id}`);
    return NextResponse.json({
      user: {
        id: user.id.toString(),
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('[ELECTRON_LOGIN_API] Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 