'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline';

interface BusinessHours {
  id?: number;
  monday_open: string;
  monday_close: string;
  monday_closed: boolean;
  tuesday_open: string;
  tuesday_close: string;
  tuesday_closed: boolean;
  wednesday_open: string;
  wednesday_close: string;
  wednesday_closed: boolean;
  thursday_open: string;
  thursday_close: string;
  thursday_closed: boolean;
  friday_open: string;
  friday_close: string;
  friday_closed: boolean;
  saturday_open: string;
  saturday_close: string;
  saturday_closed: boolean;
  sunday_open: string;
  sunday_close: string;
  sunday_closed: boolean;
  timezone: string;
  special_hours_enabled: boolean;
  notes: string;
}

const DEFAULT_OPEN_TIME = '09:00';
const DEFAULT_CLOSE_TIME = '17:00';

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland'
];

export default function BusinessHoursPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday_open: DEFAULT_OPEN_TIME,
    monday_close: DEFAULT_CLOSE_TIME,
    monday_closed: false,
    tuesday_open: DEFAULT_OPEN_TIME,
    tuesday_close: DEFAULT_CLOSE_TIME,
    tuesday_closed: false,
    wednesday_open: DEFAULT_OPEN_TIME,
    wednesday_close: DEFAULT_CLOSE_TIME,
    wednesday_closed: false,
    thursday_open: DEFAULT_OPEN_TIME,
    thursday_close: DEFAULT_CLOSE_TIME,
    thursday_closed: false,
    friday_open: DEFAULT_OPEN_TIME,
    friday_close: DEFAULT_CLOSE_TIME,
    friday_closed: false,
    saturday_open: DEFAULT_OPEN_TIME,
    saturday_close: DEFAULT_CLOSE_TIME,
    saturday_closed: true,
    sunday_open: DEFAULT_OPEN_TIME,
    sunday_close: DEFAULT_CLOSE_TIME,
    sunday_closed: true,
    timezone: 'UTC',
    special_hours_enabled: false,
    notes: ''
  });

  // Fetch business hours on component mount
  useEffect(() => {
    fetchBusinessHours();
  }, []);

  const fetchBusinessHours = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/hours');
      
      if (!response.ok) {
        if (response.status === 404) {
          // If no hours are set yet, use defaults
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch business hours');
      }
      
      const data = await response.json();
      setBusinessHours(data);
      setError(null);
    } catch (err) {
      setError('Error loading business hours');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBusinessHours(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setBusinessHours(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/settings/hours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-electron-app': 'true'
        },
        body: JSON.stringify(businessHours)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update business hours');
      }
      
      const updatedHours = await response.json();
      setBusinessHours(updatedHours);
      setSuccess('Business hours updated successfully');
      
      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Scroll to top to show error message
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/settings"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Settings
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Business Hours</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <ClockIcon className="h-6 w-6 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Operating Hours</h2>
          </div>

          {/* Timezone Selection */}
          <div className="mb-6">
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              value={businessHours.timezone}
              onChange={handleInputChange}
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIMEZONES.map(timezone => (
                <option key={timezone} value={timezone}>
                  {timezone}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              All business hours are displayed in this timezone
            </p>
          </div>

          {/* Weekly Hours */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-700">Weekly Hours</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Open
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Close
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Closed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {DAYS_OF_WEEK.map((day) => (
                    <tr key={day}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                        {day}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="time"
                          id={`${day}_open`}
                          name={`${day}_open`}
                          value={businessHours[`${day}_open` as keyof BusinessHours] as string}
                          onChange={handleInputChange}
                          disabled={businessHours[`${day}_closed` as keyof BusinessHours] as boolean}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="time"
                          id={`${day}_close`}
                          name={`${day}_close`}
                          value={businessHours[`${day}_close` as keyof BusinessHours] as string}
                          onChange={handleInputChange}
                          disabled={businessHours[`${day}_closed` as keyof BusinessHours] as boolean}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`${day}_closed`}
                            name={`${day}_closed`}
                            checked={businessHours[`${day}_closed` as keyof BusinessHours] as boolean}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`${day}_closed`} className="ml-2 block text-sm text-gray-900">
                            Closed
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Special Hours Toggle */}
          <div className="mt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="special_hours_enabled"
                name="special_hours_enabled"
                checked={businessHours.special_hours_enabled}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="special_hours_enabled" className="ml-2 block text-sm text-gray-900">
                Enable special hours for holidays and events
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Special hours can be configured separately for holidays, events, or seasonal changes
            </p>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={businessHours.notes}
              onChange={handleInputChange}
              placeholder="Add any additional information about your business hours"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  window.history.back();
                }}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 