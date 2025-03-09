'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface BalanceSheet {
  assets: {
    currentAssets: {
      accountsReceivable: number;
    };
    totalCurrentAssets: number;
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: {
      accountsPayable: number;
    };
    totalCurrentLiabilities: number;
    totalLiabilities: number;
  };
  equity: {
    retainedEarnings: number;
    totalEquity: number;
  };
  totalLiabilitiesAndEquity: number;
}

export default function BalanceSheetPage() {
  const [asOfDate, setAsOfDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);

  useEffect(() => {
    fetchBalanceSheet();
  }, [asOfDate]);

  const fetchBalanceSheet = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/balance-sheet?as_of_date=${asOfDate}`);
      if (!response.ok) throw new Error('Failed to fetch balance sheet data');
      const data = await response.json();
      setBalanceSheet(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load balance sheet');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Balance Sheet</h1>
        <div>
          <label htmlFor="as_of_date" className="block text-sm font-medium text-gray-700">
            As of Date
          </label>
          <input
            type="date"
            id="as_of_date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {balanceSheet && (
        <div className="grid grid-cols-1 gap-6">
          {/* Assets */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Assets</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Current Assets</h3>
                  <div className="pl-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Accounts Receivable</span>
                      <span className="text-gray-900">
                        {formatCurrency(balanceSheet.assets.currentAssets.accountsReceivable)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-sm font-medium">
                    <span className="text-gray-700">Total Current Assets</span>
                    <span className="text-gray-900">
                      {formatCurrency(balanceSheet.assets.totalCurrentAssets)}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-semibold">
                  <span className="text-gray-900">Total Assets</span>
                  <span className="text-gray-900">
                    {formatCurrency(balanceSheet.assets.totalAssets)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Liabilities and Equity */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Liabilities and Equity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Liabilities */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Current Liabilities</h3>
                  <div className="pl-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Accounts Payable</span>
                      <span className="text-gray-900">
                        {formatCurrency(balanceSheet.liabilities.currentLiabilities.accountsPayable)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-sm font-medium">
                    <span className="text-gray-700">Total Current Liabilities</span>
                    <span className="text-gray-900">
                      {formatCurrency(balanceSheet.liabilities.totalCurrentLiabilities)}
                    </span>
                  </div>
                </div>

                {/* Total Liabilities */}
                <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-medium">
                  <span className="text-gray-900">Total Liabilities</span>
                  <span className="text-gray-900">
                    {formatCurrency(balanceSheet.liabilities.totalLiabilities)}
                  </span>
                </div>

                {/* Equity */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Equity</h3>
                  <div className="pl-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Retained Earnings</span>
                      <span className="text-gray-900">
                        {formatCurrency(balanceSheet.equity.retainedEarnings)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-sm font-medium">
                    <span className="text-gray-700">Total Equity</span>
                    <span className="text-gray-900">
                      {formatCurrency(balanceSheet.equity.totalEquity)}
                    </span>
                  </div>
                </div>

                {/* Total Liabilities and Equity */}
                <div className="pt-2 border-t-2 border-gray-200 flex justify-between text-base font-semibold">
                  <span className="text-gray-900">Total Liabilities and Equity</span>
                  <span className="text-gray-900">
                    {formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 