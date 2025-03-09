import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { RowDataPacket, OkPacket } from 'mysql2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/vendors/[id] - Get single vendor
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = await context.params.id;

    // Get vendor details with bill summary
    const vendors = await executeQuery<RowDataPacket[]>(
      `SELECT 
        v.*,
        COUNT(b.id) as bill_count,
        CAST(COALESCE(SUM(CASE WHEN b.status = 'paid' THEN b.total ELSE 0 END), 0) AS DECIMAL(10,2)) as total_paid,
        CAST(COALESCE(SUM(CASE WHEN b.status NOT IN ('paid', 'cancelled') THEN b.total ELSE 0 END), 0) AS DECIMAL(10,2)) as total_outstanding
      FROM vendors v
      LEFT JOIN bills b ON v.id = b.vendor_id
      WHERE v.id = ?
      GROUP BY v.id`,
      [id]
    );

    if (!vendors.length) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Get recent bills
    const bills = await executeQuery<RowDataPacket[]>(
      `SELECT id, bill_number, issue_date, due_date, status, total
       FROM bills 
       WHERE vendor_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [id]
    );

    // Ensure numeric values are properly converted
    const vendor = {
      ...vendors[0],
      bill_count: Number(vendors[0].bill_count),
      total_paid: Number(vendors[0].total_paid),
      total_outstanding: Number(vendors[0].total_outstanding),
      recent_bills: bills.map(bill => ({
        ...bill,
        total: Number(bill.total)
      }))
    };

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor' },
      { status: 500 }
    );
  }
}

// PUT /api/vendors/[id] - Update vendor
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = await context.params.id;
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
        'SELECT id FROM vendors WHERE email = ? AND id != ?',
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
      `UPDATE vendors 
       SET name = ?, email = ?, phone = ?, address = ?, tax_number = ?
       WHERE id = ?`,
      [name, email, phone, address, tax_number, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Vendor updated successfully' });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    );
  }
}

// DELETE /api/vendors/[id] - Delete vendor
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = await context.params.id;

    // Check if vendor has any bills
    const bills = await executeQuery<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM bills WHERE vendor_id = ?',
      [id]
    );

    if (bills[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete vendor with bills' },
        { status: 400 }
      );
    }

    const result = await executeQuery<OkPacket>(
      'DELETE FROM vendors WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    );
  }
} 