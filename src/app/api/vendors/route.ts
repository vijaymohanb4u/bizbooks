import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { RowDataPacket, OkPacket } from 'mysql2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/vendors - List vendors
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = `
      SELECT 
        v.*,
        COUNT(b.id) as bill_count,
        CAST(COALESCE(SUM(CASE WHEN b.status = 'paid' THEN b.total ELSE 0 END), 0) AS DECIMAL(10,2)) as total_paid,
        CAST(COALESCE(SUM(CASE WHEN b.status NOT IN ('paid', 'cancelled') THEN b.total ELSE 0 END), 0) AS DECIMAL(10,2)) as total_outstanding
      FROM vendors v
      LEFT JOIN bills b ON v.id = b.vendor_id
    `;
    const params: any[] = [];

    if (search) {
      query += ' WHERE v.name LIKE ? OR v.email LIKE ? OR v.phone LIKE ?';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' GROUP BY v.id ORDER BY v.name';

    const rows = await executeQuery<RowDataPacket[]>(query, params);

    // Ensure numeric values are properly converted
    const vendors = rows.map(vendor => ({
      ...vendor,
      bill_count: Number(vendor.bill_count),
      total_paid: Number(vendor.total_paid),
      total_outstanding: Number(vendor.total_outstanding)
    }));

    return NextResponse.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

// POST /api/vendors - Create vendor
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
        'SELECT id FROM vendors WHERE email = ?',
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
      `INSERT INTO vendors (name, email, phone, address, tax_number)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, address, tax_number]
    );

    return NextResponse.json(
      { message: 'Vendor created successfully', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
} 