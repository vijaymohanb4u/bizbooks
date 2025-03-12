import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { RowDataPacket, OkPacket } from 'mysql2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/invoices/[id] - Get single invoice
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Await the params object before accessing its properties
    const params = await context.params;
    const id = params.id;

    // Get invoice with customer details
    const [invoices] = await pool.query<RowDataPacket[]>(
      `SELECT 
        i.*,
        c.name as customer_name,
        c.email as customer_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ?`,
      [id]
    );

    if (!invoices.length) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Get invoice items
    const [items] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM invoice_items WHERE invoice_id = ?',
      [id]
    );

    // Ensure numeric values are properly converted
    const invoice = {
      ...invoices[0],
      subtotal: Number(invoices[0].subtotal),
      tax_rate: Number(invoices[0].tax_rate),
      tax_amount: Number(invoices[0].tax_amount),
      total: Number(invoices[0].total),
      items: items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        amount: Number(item.amount)
      }))
    };

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - Update invoice
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Await the params object before accessing its properties
    const params = await context.params;
    const id = params.id;
    
    const body = await request.json();
    const {
      customer_id,
      issue_date,
      due_date,
      status,
      items,
      tax_rate,
      notes,
    } = body;

    // Validate required fields
    if (!customer_id || !issue_date || !due_date || !items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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
      // Update invoice
      const [result] = await connection.query<OkPacket>(
        `UPDATE invoices SET
          customer_id = ?,
          issue_date = ?,
          due_date = ?,
          status = ?,
          subtotal = ?,
          tax_rate = ?,
          tax_amount = ?,
          total = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          customer_id,
          issue_date,
          due_date,
          status,
          subtotal,
          tax_rate,
          tax_amount,
          total,
          notes,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }

      // Delete existing items
      await connection.query(
        'DELETE FROM invoice_items WHERE invoice_id = ?',
        [id]
      );

      // Insert new items
      for (const item of items) {
        await connection.query(
          `INSERT INTO invoice_items (
            invoice_id, description, quantity, unit_price, amount
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            item.description,
            item.quantity,
            item.unit_price,
            item.quantity * item.unit_price,
          ]
        );
      }

      await connection.commit();

      return NextResponse.json({ message: 'Invoice updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Await the params object before accessing its properties
    const params = await context.params;
    const id = params.id;

    // Check if invoice exists and is not paid
    const [invoices] = await pool.query<RowDataPacket[]>(
      'SELECT status FROM invoices WHERE id = ?',
      [id]
    );

    if (!invoices.length) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (invoices[0].status === 'paid') {
      return NextResponse.json(
        { error: 'Cannot delete paid invoice' },
        { status: 400 }
      );
    }

    // Delete invoice (invoice_items will be deleted automatically due to CASCADE)
    const [result] = await pool.query<OkPacket>(
      'DELETE FROM invoices WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Failed to delete invoice' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
} 