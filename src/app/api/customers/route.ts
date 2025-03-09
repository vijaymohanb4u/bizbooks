import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { RowDataPacket, OkPacket } from 'mysql2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/customers - List customers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = `
      SELECT 
        c.*,
        COUNT(i.id) as invoice_count,
        CAST(COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END), 0) AS DECIMAL(10,2)) as total_paid,
        CAST(COALESCE(SUM(CASE WHEN i.status != 'paid' AND i.status != 'cancelled' THEN i.total ELSE 0 END), 0) AS DECIMAL(10,2)) as total_outstanding
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
    `;
    const params: any[] = [];

    if (search) {
      query += ' WHERE c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' GROUP BY c.id ORDER BY c.name';

    const rows = await executeQuery<RowDataPacket[]>(query, params);

    // Ensure numeric values are properly converted
    const customers = rows.map(customer => ({
      ...customer,
      invoice_count: Number(customer.invoice_count),
      total_paid: Number(customer.total_paid),
      total_outstanding: Number(customer.total_outstanding)
    }));

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create customer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, tax_number } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if email is unique if provided
    if (email) {
      const existing = await executeQuery<RowDataPacket[]>(
        'SELECT id FROM customers WHERE email = ?',
        [email]
      );

      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    const result = await executeQuery<OkPacket>(
      `INSERT INTO customers (name, email, phone, address, tax_number)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, address, tax_number]
    );

    return NextResponse.json(
      { message: 'Customer created successfully', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
} 