'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Customer {
  id: number;
  name: string;
  email: string;
  address: string;
  tax_number: string;
}

interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface InvoiceFormData {
  customer_id: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  tax_rate: number;
  notes: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState<InvoiceFormData>({
    customer_id: '',
    issue_date: '',
    due_date: '',
    items: [],
    tax_rate: 0,
    notes: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchInvoice();
    fetchCustomers();
  }, []);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch invoice');
      const invoice = await response.json();
      
      setFormData({
        customer_id: invoice.customer_id.toString(),
        issue_date: invoice.issue_date.split('T')[0],
        due_date: invoice.due_date.split('T')[0],
        items: invoice.items.map((item: any) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount
        })),
        tax_rate: invoice.tax_rate,
        notes: invoice.notes || '',
        status: invoice.status
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoice');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update invoice');
      }

      router.push('/dashboard/invoices');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0, amount: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
        amount: field === 'quantity' || field === 'unit_price'
          ? Number(value) * (field === 'quantity' ? newItems[index].unit_price : newItems[index].quantity)
          : newItems[index].amount,
      };
      return { ...prev, items: newItems };
    });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * formData.tax_rate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Invoice</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                id="customer_id"
                name="customer_id"
                required
                value={formData.customer_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700">
                Tax Rate (%)
              </label>
              <input
                type="number"
                id="tax_rate"
                name="tax_rate"
                min="0"
                max="100"
                step="0.01"
                value={formData.tax_rate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="issue_date"
                name="issue_date"
                required
                value={formData.issue_date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                required
                value={formData.due_date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-900"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Item
              </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="block w-full border-0 p-0 focus:ring-0 text-sm"
                          placeholder="Item description"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="block w-24 border-0 p-0 focus:ring-0 text-sm"
                          aria-label={`Quantity for item ${index + 1}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                          className="block w-32 border-0 p-0 focus:ring-0 text-sm"
                          aria-label={`Unit price for item ${index + 1}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-900"
                          disabled={formData.items.length === 1}
                          aria-label={`Remove item ${index + 1}`}
                          title={`Remove item ${index + 1}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      Subtotal
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      ${calculateSubtotal().toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      Tax ({formData.tax_rate}%)
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      ${calculateTax().toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                  <tr className="font-semibold">
                    <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      ${calculateTotal().toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Additional notes or terms..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 