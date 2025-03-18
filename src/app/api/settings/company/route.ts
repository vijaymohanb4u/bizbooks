import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { RowDataPacket, OkPacket } from 'mysql2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CompanyProfile extends RowDataPacket {
  id: number;
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
  created_at: Date;
  updated_at: Date;
}

// GET company profile
export async function GET() {
  try {
    // Check if company profile exists
    const [companies] = await pool.query<CompanyProfile[]>(
      'SELECT * FROM company_profile LIMIT 1'
    );

    // If no company profile exists, return default values
    if (companies.length === 0) {
      return NextResponse.json({
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
    }

    return NextResponse.json(companies[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch company profile' },
      { status: 500 }
    );
  }
}

// Update company profile
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Check if company profile exists
    const [companies] = await pool.query<CompanyProfile[]>(
      'SELECT id FROM company_profile LIMIT 1'
    );

    let result;
    
    if (companies.length === 0) {
      // Insert new company profile
      [result] = await pool.query<OkPacket>(
        `INSERT INTO company_profile (
          name, legal_name, tax_id, email, phone, website,
          address_line1, address_line2, city, state, postal_code, country,
          logo_url, currency, fiscal_year_start
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.legal_name || null,
          data.tax_id || null,
          data.email || null,
          data.phone || null,
          data.website || null,
          data.address_line1 || null,
          data.address_line2 || null,
          data.city || null,
          data.state || null,
          data.postal_code || null,
          data.country || null,
          data.logo_url || null,
          data.currency || 'USD',
          data.fiscal_year_start || '01-01',
        ]
      );
    } else {
      // Update existing company profile
      [result] = await pool.query<OkPacket>(
        `UPDATE company_profile SET
          name = ?,
          legal_name = ?,
          tax_id = ?,
          email = ?,
          phone = ?,
          website = ?,
          address_line1 = ?,
          address_line2 = ?,
          city = ?,
          state = ?,
          postal_code = ?,
          country = ?,
          logo_url = ?,
          currency = ?,
          fiscal_year_start = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          data.name,
          data.legal_name || null,
          data.tax_id || null,
          data.email || null,
          data.phone || null,
          data.website || null,
          data.address_line1 || null,
          data.address_line2 || null,
          data.city || null,
          data.state || null,
          data.postal_code || null,
          data.country || null,
          data.logo_url || null,
          data.currency || 'USD',
          data.fiscal_year_start || '01-01',
          companies[0].id
        ]
      );
    }

    // Fetch the updated company profile
    const [updatedCompanies] = await pool.query<CompanyProfile[]>(
      'SELECT * FROM company_profile LIMIT 1'
    );

    return NextResponse.json(updatedCompanies[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update company profile' },
      { status: 500 }
    );
  }
} 