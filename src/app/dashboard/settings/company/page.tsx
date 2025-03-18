'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BuildingOfficeIcon, ArrowLeftIcon, ServerIcon } from '@heroicons/react/24/outline';

interface CompanyProfile {
  id: number | null;
  name: string;
  legal_name: string;
  tax_id: string;
  email: string;
  phone: string;
  website: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  logo_url: string;
  currency: string;
  fiscal_year_start: string;
}

export default function CompanyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    id: null,
    name: '',
    legal_name: '',
    tax_id: '',
    email: '',
    phone: '',
    website: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    logo_url: '',
    currency: 'USD',
    fiscal_year_start: '01-01',
  });

  // Fetch company profile on component mount
  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/company');
      
      if (!response.ok) {
        throw new Error('Failed to fetch company profile');
      }
      
      const data = await response.json();
      setCompanyProfile(data);
      setError(null);
    } catch (err) {
      setError('Error loading company profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/settings/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-electron-app': 'true'
        },
        body: JSON.stringify(companyProfile)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update company profile');
      }
      
      const updatedProfile = await response.json();
      setCompanyProfile(updatedProfile);
      setSuccess('Company profile updated successfully');
      
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

  const runMigrations = async () => {
    try {
      setMigrating(true);
      setError(null);
      
      const response = await fetch('/api/migrations', {
        headers: {
          'x-electron-app': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to run migrations');
      }
      
      await fetchCompanyProfile();
      setSuccess('Database migrations completed successfully');
      
      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred running migrations');
      // Scroll to top to show error message
      window.scrollTo(0, 0);
    } finally {
      setMigrating(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
        </div>
        
        <button
          type="button"
          onClick={runMigrations}
          disabled={migrating}
          className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
        >
          <ServerIcon className="h-4 w-4 mr-1.5" />
          {migrating ? 'Running...' : 'Run Migrations'}
        </button>
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
            <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={companyProfile.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="legal_name" className="block text-sm font-medium text-gray-700 mb-1">
                Legal Name
              </label>
              <input
                type="text"
                id="legal_name"
                name="legal_name"
                value={companyProfile.legal_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID / VAT Number
              </label>
              <input
                type="text"
                id="tax_id"
                name="tax_id"
                value={companyProfile.tax_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={companyProfile.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={companyProfile.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={companyProfile.website}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="mt-8">
            <h3 className="text-md font-medium text-gray-900 mb-4">Business Address</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  id="address_line1"
                  name="address_line1"
                  value={companyProfile.address_line1}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="address_line2"
                  name="address_line2"
                  value={companyProfile.address_line2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={companyProfile.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State / Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={companyProfile.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal / ZIP Code
                </label>
                <input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  value={companyProfile.postal_code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={companyProfile.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div className="mt-8">
            <h3 className="text-md font-medium text-gray-900 mb-4">Business Settings</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Default Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={companyProfile.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                </select>
              </div>

              <div>
                <label htmlFor="fiscal_year_start" className="block text-sm font-medium text-gray-700 mb-1">
                  Fiscal Year Start (MM-DD)
                </label>
                <input
                  type="text"
                  id="fiscal_year_start"
                  name="fiscal_year_start"
                  value={companyProfile.fiscal_year_start}
                  onChange={handleInputChange}
                  placeholder="01-01"
                  pattern="[0-1][0-9]-[0-3][0-9]"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">Format: MM-DD (e.g., 01-01 for January 1st)</p>
              </div>

              <div>
                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logo_url"
                  name="logo_url"
                  value={companyProfile.logo_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://"
                />
                <p className="mt-1 text-sm text-gray-500">Enter a URL to your company logo</p>
                
                {companyProfile.logo_url && (
                  <div className="mt-3 p-4 border border-gray-200 rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-2">Logo Preview:</p>
                    <div className="flex justify-center bg-gray-50 p-4 rounded">
                      <img 
                        src={companyProfile.logo_url} 
                        alt="Company Logo" 
                        className="max-h-24 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x100?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={() => router.push('/dashboard/settings')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-4 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 