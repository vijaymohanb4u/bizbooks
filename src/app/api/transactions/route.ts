import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import type { RowDataPacket, OkPacket } from 'mysql2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Transaction extends RowDataPacket {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  category_name: string;
  payment_method: string;
  reference_number: string;
}

export async function GET() {
  try {
    const [rows] = await pool.query<Transaction[]>(`
      SELECT t.*, c.name as category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.date DESC, t.created_at DESC
    `);
    
    return NextResponse.json(rows);
  } catch (error) {
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed', details: error.message },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['date', 'description', 'amount', 'type', 'category_id'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate amount
    if (isNaN(data.amount) || data.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['income', 'expense'].includes(data.type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    // Verify category exists and matches transaction type
    const [categories] = await pool.query<RowDataPacket[]>(
      'SELECT type FROM categories WHERE id = ?',
      [data.category_id]
    );

    if (categories.length === 0) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    if (categories[0].type !== data.type) {
      return NextResponse.json(
        { error: 'Category type does not match transaction type' },
        { status: 400 }
      );
    }

    // Insert transaction
    const [result] = await pool.query<OkPacket>(
      `INSERT INTO transactions (
        date, description, amount, type, category_id,
        payment_method, reference_number, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.date,
        data.description,
        data.amount,
        data.type,
        data.category_id,
        data.payment_method || null,
        data.reference_number || null,
        data.notes || null,
      ]
    );

    // Fetch the created transaction with category name
    const [transactions] = await pool.query<Transaction[]>(
      `SELECT t.*, c.name as category_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [result.insertId]
    );

    return NextResponse.json(transactions[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
} 