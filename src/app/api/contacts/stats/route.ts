import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [customerStats, vendorStats] = await Promise.all([
      executeQuery<RowDataPacket[]>(`
        SELECT 
          COUNT(DISTINCT c.id) as total_customers,
          COUNT(DISTINCT CASE WHEN i.id IS NOT NULL THEN c.id END) as active_customers,
          CAST(COALESCE(SUM(CASE WHEN i.status NOT IN ('paid', 'cancelled') THEN i.total ELSE 0 END), 0) AS DECIMAL(10,2)) as total_outstanding
        FROM customers c
        LEFT JOIN invoices i ON c.id = i.customer_id
      `),
      executeQuery<RowDataPacket[]>(`
        SELECT 
          COUNT(DISTINCT v.id) as total_vendors,
          COUNT(DISTINCT CASE WHEN b.id IS NOT NULL THEN v.id END) as active_vendors,
          CAST(COALESCE(SUM(CASE WHEN b.status NOT IN ('paid', 'cancelled') THEN b.total ELSE 0 END), 0) AS DECIMAL(10,2)) as total_payable
        FROM vendors v
        LEFT JOIN bills b ON v.id = b.vendor_id
      `)
    ]);

    if (!customerStats[0] || !vendorStats[0]) {
      return NextResponse.json({
        total_customers: 0,
        active_customers: 0,
        total_outstanding: 0,
        total_vendors: 0,
        active_vendors: 0,
        total_payable: 0
      });
    }

    // Ensure numeric values
    const stats = {
      ...customerStats[0],
      ...vendorStats[0],
      total_outstanding: Number(customerStats[0].total_outstanding),
      total_payable: Number(vendorStats[0].total_payable)
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact stats' },
      { status: 500 }
    );
  }
} 