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

// Define the function with destructured params
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  // Await the entire params object first
  const params = await context.params;
  const id = params.id;
  
  try {
    const [categories] = await pool.query<Category[]>(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    if (!categories[0]) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(categories[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// Define the function with destructured params
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  // Await the entire params object first
  const params = await context.params;
  const id = params.id;
  
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

    // Update category
    const [result] = await pool.query<OkPacket>(
      'UPDATE categories SET name = ?, type = ?, description = ?, color = ? WHERE id = ?',
      [name, type, description || null, color || null, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Fetch updated category
    const [categories] = await pool.query<Category[]>(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    return NextResponse.json(categories[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// Define the function with destructured params
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  // Await the entire params object first
  const params = await context.params;
  const id = params.id;
  
  try {
    // Check if category is being used in transactions
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
      [id]
    );

    if (rows[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is being used in transactions' },
        { status: 400 }
      );
    }

    // Delete category
    const [result] = await pool.query<OkPacket>(
      'DELETE FROM categories WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
} 