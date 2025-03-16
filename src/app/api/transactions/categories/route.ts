import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { RowDataPacket, OkPacket } from 'mysql2';

// Configure the route as dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Category extends RowDataPacket {
  id: number;
  name: string;
  type: 'income' | 'expense';
  description: string | null;
  color: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function GET() {
  try {
    const [categories] = await pool.query<Category[]>(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    
    return NextResponse.json({
      data: categories,
      total: categories.length
    });
  } catch (error) {
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed', details: error.message },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, type, description, color } = await request.json();

    // Validation
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either income or expense' },
        { status: 400 }
      );
    }

    // Insert category
    const [result] = await pool.query<OkPacket>(
      'INSERT INTO categories (name, type, description, color) VALUES (?, ?, ?, ?)',
      [name, type, description || null, color || null]
    );

    // Fetch the created category
    const [categories] = await pool.query<Category[]>(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(categories[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
} 