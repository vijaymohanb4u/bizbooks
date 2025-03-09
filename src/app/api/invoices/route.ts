import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { RowDataPacket, OkPacket } from 'mysql2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/invoices - List invoices
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const customer_id = searchParams.get('customer_id');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        i.*,
        c.name as customer_name,
        c.email as customer_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    if (customer_id) {
      query += ' AND i.customer_id = ?';
      params.push(customer_id);
    }

    query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    // Get total count for pagination
    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM invoices',
      []
    );
    const total = countResult[0].total;

    // Ensure numeric values are properly converted
    const data = rows.map(row => ({
      ...row,
      total: Number(row.total)
    }));

    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create invoice
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_id,
      issue_date,
      due_date,
      items,
      tax_rate = 0,
      notes,
    } = body;

    // Validate required fields
    if (!customer_id || !issue_date || !due_date || !items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate invoice number (format: INV-YYYYMMDD-XXX)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const [lastInvoice] = await pool.query<RowDataPacket[]>(
      'SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY invoice_number DESC LIMIT 1',
      [`INV-${dateStr}%`]
    );
    
    let sequence = 1;
    if (lastInvoice.length > 0) {
      sequence = parseInt(lastInvoice[0].invoice_number.split('-')[2]) + 1;
    }
    const invoice_number = `INV-${dateStr}-${sequence.toString().padStart(3, '0')}`;

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unit_price,
      0
    );
    const tax_amount = (subtotal * tax_rate) / 100;
    const total = subtotal + tax_amount;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert invoice
      const [invoiceResult] = await connection.query<OkPacket>(
        `INSERT INTO invoices (
          invoice_number, customer_id, issue_date, due_date,
          subtotal, tax_rate, tax_amount, total, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoice_number,
          customer_id,
          issue_date,
          due_date,
          subtotal,
          tax_rate,
          tax_amount,
          total,
          notes,
        ]
      );

      // Insert invoice items
      for (const item of items) {
        await connection.query(
          `INSERT INTO invoice_items (
            invoice_id, description, quantity, unit_price, amount
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            invoiceResult.insertId,
            item.description,
            item.quantity,
            item.unit_price,
            item.quantity * item.unit_price,
          ]
        );
      }

      await connection.commit();

      return NextResponse.json(
        { message: 'Invoice created successfully', id: invoiceResult.insertId },
        { status: 201 }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
} 