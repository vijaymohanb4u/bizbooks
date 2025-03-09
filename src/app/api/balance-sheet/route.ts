import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const as_of_date = searchParams.get('as_of_date') || new Date().toISOString().split('T')[0];

    // Get accounts receivable (current assets)
    const [receivables] = await pool.query<RowDataPacket[]>(
      `SELECT 
        SUM(total) as total_receivables
      FROM invoices 
      WHERE status NOT IN ('paid', 'cancelled')
        AND issue_date <= ?`,
      [as_of_date]
    );

    // Get accounts payable (current liabilities)
    const [payables] = await pool.query<RowDataPacket[]>(
      `SELECT 
        SUM(total) as total_payables
      FROM bills
      WHERE status NOT IN ('paid', 'cancelled')
        AND issue_date <= ?`,
      [as_of_date]
    );

    // Get total paid invoices (accumulated income)
    const [paidInvoices] = await pool.query<RowDataPacket[]>(
      `SELECT 
        SUM(total) as total_paid_invoices
      FROM invoices
      WHERE status = 'paid'
        AND issue_date <= ?`,
      [as_of_date]
    );

    // Get total paid bills (accumulated expenses)
    const [paidBills] = await pool.query<RowDataPacket[]>(
      `SELECT 
        SUM(total) as total_paid_bills
      FROM bills
      WHERE status = 'paid'
        AND issue_date <= ?`,
      [as_of_date]
    );

    // Calculate totals
    const totalReceivables = Number(receivables[0]?.total_receivables || 0);
    const totalPayables = Number(payables[0]?.total_payables || 0);
    const totalPaidInvoices = Number(paidInvoices[0]?.total_paid_invoices || 0);
    const totalPaidBills = Number(paidBills[0]?.total_paid_bills || 0);

    // Calculate retained earnings
    const retainedEarnings = totalPaidInvoices - totalPaidBills;

    // Structure the balance sheet data
    const balanceSheet = {
      assets: {
        currentAssets: {
          accountsReceivable: totalReceivables,
          // Add other current assets here (cash, inventory, etc.) when implemented
        },
        totalCurrentAssets: totalReceivables,
        // Add fixed assets here when implemented
        totalAssets: totalReceivables,
      },
      liabilities: {
        currentLiabilities: {
          accountsPayable: totalPayables,
          // Add other current liabilities here when implemented
        },
        totalCurrentLiabilities: totalPayables,
        // Add long-term liabilities here when implemented
        totalLiabilities: totalPayables,
      },
      equity: {
        retainedEarnings: retainedEarnings,
        // Add other equity items here when implemented
        totalEquity: retainedEarnings,
      },
      totalLiabilitiesAndEquity: totalPayables + retainedEarnings,
    };

    return NextResponse.json(balanceSheet);
  } catch (error) {
    console.error('Error generating balance sheet:', error);
    return NextResponse.json(
      { error: 'Failed to generate balance sheet' },
      { status: 500 }
    );
  }
} 