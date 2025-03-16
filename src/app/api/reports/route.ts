import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Get income data
    const [incomeData] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(i.issue_date, '%Y-%m-01') as month,
        'Sales' as category,
        SUM(i.total) as total
      FROM invoices i
      WHERE i.issue_date BETWEEN ? AND ?
        AND i.status != 'cancelled'
      GROUP BY DATE_FORMAT(i.issue_date, '%Y-%m-01')`,
      [start_date, end_date]
    );

    // Get expense data
    const [expenseData] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(b.issue_date, '%Y-%m-01') as month,
        'Purchases' as category,
        SUM(b.total) as total
      FROM bills b
      WHERE b.issue_date BETWEEN ? AND ?
        AND b.status != 'cancelled'
      GROUP BY DATE_FORMAT(b.issue_date, '%Y-%m-01')`,
      [start_date, end_date]
    );

    // Get receivables data
    const [receivablesData] = await pool.query<RowDataPacket[]>(
      `SELECT 
        SUM(CASE WHEN CURDATE() <= due_date THEN total ELSE 0 END) as current,
        SUM(CASE WHEN CURDATE() > due_date THEN total ELSE 0 END) as overdue,
        customer_id,
        c.name as customer_name,
        SUM(total) as total
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.status NOT IN ('paid', 'cancelled')
      GROUP BY customer_id, c.name`,
      []
    );

    // Get payables data
    const [payablesData] = await pool.query<RowDataPacket[]>(
      `SELECT 
        SUM(CASE WHEN CURDATE() <= due_date THEN total ELSE 0 END) as current,
        SUM(CASE WHEN CURDATE() > due_date THEN total ELSE 0 END) as overdue,
        vendor_id,
        v.name as vendor_name,
        SUM(total) as total
      FROM bills b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE b.status NOT IN ('paid', 'cancelled')
      GROUP BY vendor_id, v.name`,
      []
    );

    // Process income data
    const incomeByMonth: { [key: string]: number } = {};
    const incomeByCategory: { [key: string]: number } = {};
    let totalIncome = 0;

    incomeData.forEach((row: any) => {
      incomeByMonth[row.month] = (incomeByMonth[row.month] || 0) + Number(row.total);
      incomeByCategory[row.category] = (incomeByCategory[row.category] || 0) + Number(row.total);
      totalIncome += Number(row.total);
    });

    // Process expense data
    const expensesByMonth: { [key: string]: number } = {};
    const expensesByCategory: { [key: string]: number } = {};
    let totalExpenses = 0;

    expenseData.forEach((row: any) => {
      expensesByMonth[row.month] = (expensesByMonth[row.month] || 0) + Number(row.total);
      expensesByCategory[row.category] = (expensesByCategory[row.category] || 0) + Number(row.total);
      totalExpenses += Number(row.total);
    });

    // Process receivables data
    const receivablesByCustomer: { [key: string]: number } = {};
    let totalReceivables = 0;
    let currentReceivables = 0;
    let overdueReceivables = 0;

    receivablesData.forEach((row: any) => {
      receivablesByCustomer[row.customer_name] = Number(row.total);
      totalReceivables += Number(row.total);
      currentReceivables += Number(row.current);
      overdueReceivables += Number(row.overdue);
    });

    // Process payables data
    const payablesByVendor: { [key: string]: number } = {};
    let totalPayables = 0;
    let currentPayables = 0;
    let overduePayables = 0;

    payablesData.forEach((row: any) => {
      payablesByVendor[row.vendor_name] = Number(row.total);
      totalPayables += Number(row.total);
      currentPayables += Number(row.current);
      overduePayables += Number(row.overdue);
    });

    return NextResponse.json({
      income: {
        total: totalIncome,
        byMonth: incomeByMonth,
        byCategory: incomeByCategory,
      },
      expenses: {
        total: totalExpenses,
        byMonth: expensesByMonth,
        byCategory: expensesByCategory,
      },
      receivables: {
        total: totalReceivables,
        current: currentReceivables,
        overdue: overdueReceivables,
        byCustomer: receivablesByCustomer,
      },
      payables: {
        total: totalPayables,
        current: currentPayables,
        overdue: overduePayables,
        byVendor: payablesByVendor,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate reports' },
      { status: 500 }
    );
  }
} 