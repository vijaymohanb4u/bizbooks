import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { RowDataPacket, OkPacket } from 'mysql2';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Params {
  id: string;
}

// GET /api/customers/[id] - Get single customer
export async function GET(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    // Await the params object before accessing its properties
    const awaitedParams = await params;
    const id = awaitedParams.id;

    // Get customer details with invoice summary
    const customers = await executeQuery<RowDataPacket[]>(
      `SELECT 
        c.*,
        COUNT(i.id) as invoice_count,
        CAST(COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END), 0) AS DECIMAL(10,2)) as total_paid,
        CAST(COALESCE(SUM(CASE WHEN i.status != 'paid' AND i.status != 'cancelled' THEN i.total ELSE 0 END), 0) AS DECIMAL(10,2)) as total_outstanding
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
      WHERE c.id = ?
      GROUP BY c.id`,
      [id]
    );

    if (!customers.length) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get recent invoices
    const invoices = await executeQuery<RowDataPacket[]>(
      `SELECT id, invoice_number, issue_date, due_date, status, total
       FROM invoices 
       WHERE customer_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [id]
    );

    // Ensure numeric values are properly converted
    const customer = {
      ...customers[0],
      invoice_count: Number(customers[0].invoice_count),
      total_paid: Number(customers[0].total_paid),
      total_outstanding: Number(customers[0].total_outstanding),
      recent_invoices: invoices.map(invoice => ({
        ...invoice,
        total: Number(invoice.total)
      }))
    };

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    // Await the params object before accessing its properties
    const awaitedParams = await params;
    const id = awaitedParams.id;
    
    const body = await request.json();
    const { name, email, phone, address, tax_number } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if email is unique if changed
    if (email) {
      const existing = await executeQuery<RowDataPacket[]>(
        'SELECT id FROM customers WHERE email = ? AND id != ?',
        [email, id]
      );

      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    const result = await executeQuery<OkPacket>(
      `UPDATE customers 
       SET name = ?, email = ?, phone = ?, address = ?, tax_number = ?
       WHERE id = ?`,
      [name, email, phone, address, tax_number, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    // Await the params object before accessing its properties
    const awaitedParams = await params;
    const id = awaitedParams.id;

    // Check if customer has any invoices
    const invoices = await executeQuery<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM invoices WHERE customer_id = ?',
      [id]
    );

    if (invoices[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with invoices' },
        { status: 400 }
      );
    }

    const result = await executeQuery<OkPacket>(
      'DELETE FROM customers WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
} 