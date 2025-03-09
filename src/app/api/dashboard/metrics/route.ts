import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

interface MetricResult extends RowDataPacket {
  value: number;
}

interface MonthlyData extends RowDataPacket {
  month: string;
  total: number;
}

export async function GET(request: Request) {
  try {
    const currentDate = new Date();
    const startOfCurrentMonth = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const endOfCurrentMonth = format(endOfMonth(currentDate), 'yyyy-MM-dd');
    const startOfSixMonthsAgo = format(startOfMonth(subMonths(currentDate, 5)), 'yyyy-MM-dd');

    console.log('Date range:', { startOfCurrentMonth, endOfCurrentMonth });

    // Total Revenue (from invoices)
    const revenueResult = await executeQuery<MetricResult[]>(
      `SELECT COALESCE(SUM(total), 0) as value
       FROM invoices
       WHERE status = 'PAID'`
    );
    const totalRevenue = Number(revenueResult[0]?.value || 0);

    // Monthly Revenue
    const monthlyRevenueResult = await executeQuery<MetricResult[]>(
      `SELECT COALESCE(SUM(total), 0) as value
       FROM invoices
       WHERE status IN ('SENT', 'PAID', 'DRAFT')
       AND DATE(issue_date) BETWEEN ? AND ?`,
      [startOfCurrentMonth, endOfCurrentMonth]
    );
    const monthlyRevenue = Number(monthlyRevenueResult[0]?.value || 0);
    console.log('Monthly revenue query result:', monthlyRevenueResult[0]);

    // Total Expenses (from bills)
    const expensesResult = await executeQuery<MetricResult[]>(
      `SELECT COALESCE(SUM(total), 0) as value
       FROM bills`
    );
    const totalExpenses = Number(expensesResult[0]?.value || 0);

    // Monthly Expenses
    const monthlyExpensesResult = await executeQuery<MetricResult[]>(
      `SELECT COALESCE(SUM(total), 0) as value
       FROM bills
       WHERE issue_date BETWEEN ? AND ?`,
      [startOfCurrentMonth, endOfCurrentMonth]
    );
    const monthlyExpenses = Number(monthlyExpensesResult[0]?.value || 0);

    // Accounts Receivable (unpaid invoices)
    const receivablesResult = await executeQuery<MetricResult[]>(
      `SELECT COALESCE(SUM(total), 0) as value
       FROM invoices
       WHERE status = 'SENT'`
    );
    const accountsReceivable = Number(receivablesResult[0]?.value || 0);

    // Accounts Payable (unpaid bills)
    const payablesResult = await executeQuery<MetricResult[]>(
      `SELECT COALESCE(SUM(total), 0) as value
       FROM bills
       WHERE status = 'received'`
    );
    const accountsPayable = Number(payablesResult[0]?.value || 0);

    // Customer Count
    const customerCountResult = await executeQuery<MetricResult[]>(
      `SELECT COUNT(*) as value FROM customers`
    );
    const customerCount = Number(customerCountResult[0]?.value || 0);

    // Vendor Count
    const vendorCountResult = await executeQuery<MetricResult[]>(
      `SELECT COUNT(*) as value FROM vendors`
    );
    const vendorCount = Number(vendorCountResult[0]?.value || 0);

    // Overdue Invoices
    const overdueInvoicesResult = await executeQuery<MetricResult[]>(
      `SELECT COUNT(*) as value
       FROM invoices
       WHERE due_date < CURDATE()
       AND status = 'SENT'`
    );
    const overdueInvoices = Number(overdueInvoicesResult[0]?.value || 0);

    // Overdue Bills
    const overdueBillsResult = await executeQuery<MetricResult[]>(
      `SELECT COUNT(*) as value
       FROM bills
       WHERE due_date < CURDATE()
       AND status = 'PENDING'`
    );
    const overdueBills = Number(overdueBillsResult[0]?.value || 0);

    // Calculate net income and profit margin
    const netIncome = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    // Revenue by Month (Last 6 months)
    const revenueByMonthResult = await executeQuery<MonthlyData[]>(
      `SELECT 
        DATE_FORMAT(issue_date, '%Y-%m') as month,
        COALESCE(SUM(total), 0) as total
       FROM invoices
       WHERE status = 'PAID'
       AND issue_date >= ?
       GROUP BY DATE_FORMAT(issue_date, '%Y-%m')
       ORDER BY month ASC`,
      [startOfSixMonthsAgo]
    );

    // Expenses by Month (Last 6 months)
    const expensesByMonthResult = await executeQuery<MonthlyData[]>(
      `SELECT 
        DATE_FORMAT(issue_date, '%Y-%m') as month,
        COALESCE(SUM(total), 0) as total
       FROM bills
       WHERE issue_date >= ?
       GROUP BY DATE_FORMAT(issue_date, '%Y-%m')
       ORDER BY month ASC`,
      [startOfSixMonthsAgo]
    );

    // Top 5 Customers by Revenue
    const topCustomersResult = await executeQuery<any[]>(
      `SELECT 
        c.name,
        COALESCE(SUM(i.total), 0) as total
       FROM customers c
       LEFT JOIN invoices i ON c.id = i.customer_id
       WHERE i.status = 'PAID'
       GROUP BY c.id, c.name
       ORDER BY total DESC
       LIMIT 5`
    );

    // Receivables Aging
    const agingResult = await executeQuery<any[]>(
      `SELECT 
        CASE 
          WHEN DATEDIFF(CURDATE(), due_date) <= 0 THEN 'Current'
          WHEN DATEDIFF(CURDATE(), due_date) <= 30 THEN '1-30 days'
          WHEN DATEDIFF(CURDATE(), due_date) <= 60 THEN '31-60 days'
          WHEN DATEDIFF(CURDATE(), due_date) <= 90 THEN '61-90 days'
          ELSE 'Over 90 days'
        END as aging_period,
        COALESCE(SUM(total), 0) as total
       FROM invoices
       WHERE status = 'SENT'
       GROUP BY aging_period
       ORDER BY 
        CASE aging_period
          WHEN 'Current' THEN 1
          WHEN '1-30 days' THEN 2
          WHEN '31-60 days' THEN 3
          WHEN '61-90 days' THEN 4
          ELSE 5
        END`
    );

    return NextResponse.json({
      overview: {
        totalRevenue,
        monthlyRevenue,
        totalExpenses,
        monthlyExpenses,
        netIncome,
        profitMargin
      },
      receivables: {
        total: accountsReceivable,
        overdueCount: overdueInvoices
      },
      payables: {
        total: accountsPayable,
        overdueCount: overdueBills
      },
      customers: {
        total: customerCount,
        active: customerCount // All customers are considered active for now
      },
      vendors: {
        total: vendorCount,
        active: vendorCount // All vendors are considered active for now
      },
      monthlyComparison: {
        revenue: monthlyRevenue,
        expenses: monthlyExpenses,
        profit: monthlyRevenue - monthlyExpenses
      },
      charts: {
        revenueByMonth: revenueByMonthResult.map(r => ({
          month: format(new Date(r.month + '-01'), 'MMM yyyy'),
          amount: Number(r.total)
        })),
        expensesByMonth: expensesByMonthResult.map(r => ({
          month: format(new Date(r.month + '-01'), 'MMM yyyy'),
          amount: Number(r.total)
        })),
        topCustomers: topCustomersResult.map(c => ({
          name: c.name,
          revenue: Number(c.total)
        })),
        receivablesAging: agingResult.map(a => ({
          period: a.aging_period,
          amount: Number(a.total)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
} 