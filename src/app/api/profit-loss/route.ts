import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { format } from 'date-fns';
import { RowDataPacket } from 'mysql2';

interface ExpenseBreakdown {
  purchases: number;
  salaries: number;
  utilities: number;
  rent: number;
  other: number;
}

interface SalesResult extends RowDataPacket {
  sales: number;
}

interface CogsResult extends RowDataPacket {
  cogs: number;
}

interface ExpensesResult extends RowDataPacket {
  purchases: number;
  salaries: number;
  utilities: number;
  rent: number;
  other: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Get total sales revenue from invoices
    const salesResult = await executeQuery<SalesResult[]>(
      `SELECT COALESCE(SUM(total), 0) as sales
       FROM invoices
       WHERE issue_date BETWEEN ? AND ?
       AND status != 'DRAFT'`,
      [startDate, endDate]
    );
    const sales = Number(salesResult[0]?.sales || 0);

    // Get total expenses from bills
    const expensesResult = await executeQuery<ExpensesResult[]>(
      `SELECT 
        COALESCE(SUM(total), 0) as total_expenses
       FROM bills
       WHERE issue_date BETWEEN ? AND ?
       AND status != 'DRAFT'`,
      [startDate, endDate]
    );
    
    const totalExpenses = Number(expensesResult[0]?.total_expenses || 0);

    // For now, we'll use simplified calculations
    const operatingExpenses: ExpenseBreakdown = {
      purchases: totalExpenses * 0.4, // 40% of expenses
      salaries: totalExpenses * 0.3,  // 30% of expenses
      utilities: totalExpenses * 0.1, // 10% of expenses
      rent: totalExpenses * 0.1,     // 10% of expenses
      other: totalExpenses * 0.1     // 10% of expenses
    };

    const totalOperatingExpenses = totalExpenses;
    const costOfGoodsSold = totalExpenses * 0.6; // Assume 60% of expenses are COGS

    // Calculate other metrics
    const totalRevenue = sales;
    const grossProfit = totalRevenue - costOfGoodsSold;
    const operatingIncome = grossProfit - totalOperatingExpenses;
    const netIncome = operatingIncome;

    return NextResponse.json({
      revenue: {
        sales,
        otherIncome: 0,
        totalRevenue
      },
      expenses: {
        costOfGoodsSold,
        operatingExpenses,
        totalOperatingExpenses,
        totalExpenses
      },
      grossProfit,
      operatingIncome,
      netIncome
    });
  } catch (error) {
    console.error('Error generating profit & loss statement:', error);
    return NextResponse.json(
      { error: 'Failed to generate profit & loss statement. Please check database connection.' },
      { status: 500 }
    );
  }
} 