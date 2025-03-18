import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { RowDataPacket, OkPacket } from 'mysql2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Interface for business hours
interface BusinessHours extends RowDataPacket {
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

// Default business hours
const DEFAULT_BUSINESS_HOURS = {
  monday_open: '09:00',
  monday_close: '17:00',
  monday_closed: false,
  tuesday_open: '09:00',
  tuesday_close: '17:00',
  tuesday_closed: false,
  wednesday_open: '09:00',
  wednesday_close: '17:00',
  wednesday_closed: false,
  thursday_open: '09:00',
  thursday_close: '17:00',
  thursday_closed: false,
  friday_open: '09:00',
  friday_close: '17:00',
  friday_closed: false,
  saturday_open: '09:00',
  saturday_close: '17:00',
  saturday_closed: true,
  sunday_open: '09:00',
  sunday_close: '17:00',
  sunday_closed: true,
  timezone: 'UTC',
  special_hours_enabled: false,
  notes: ''
};

// GET handler to fetch business hours
export async function GET(req: NextRequest) {
  try {
    // Query the database for business hours
    const [rows] = await pool.query<BusinessHours[]>('SELECT * FROM business_hours LIMIT 1');
    
    // If no business hours found, return default values
    if (!rows || rows.length === 0) {
      return NextResponse.json(DEFAULT_BUSINESS_HOURS);
    }
    
    // Return the business hours
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching business hours:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business hours' },
      { status: 500 }
    );
  }
}

// PUT handler to update business hours
export async function PUT(req: NextRequest) {
  try {
    // Parse request body
    const data = await req.json();
    
    // Validate required fields
    if (!data.timezone) {
      return NextResponse.json(
        { error: 'Timezone is required' },
        { status: 400 }
      );
    }
    
    // Check if business hours already exist
    const [existingRows] = await pool.query<BusinessHours[]>('SELECT id FROM business_hours LIMIT 1');
    
    if (existingRows.length === 0) {
      // Insert new business hours
      const insertQuery = `
        INSERT INTO business_hours (
          monday_open, monday_close, monday_closed,
          tuesday_open, tuesday_close, tuesday_closed,
          wednesday_open, wednesday_close, wednesday_closed,
          thursday_open, thursday_close, thursday_closed,
          friday_open, friday_close, friday_closed,
          saturday_open, saturday_close, saturday_closed,
          sunday_open, sunday_close, sunday_closed,
          timezone, special_hours_enabled, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        data.monday_open, data.monday_close, data.monday_closed ? 1 : 0,
        data.tuesday_open, data.tuesday_close, data.tuesday_closed ? 1 : 0,
        data.wednesday_open, data.wednesday_close, data.wednesday_closed ? 1 : 0,
        data.thursday_open, data.thursday_close, data.thursday_closed ? 1 : 0,
        data.friday_open, data.friday_close, data.friday_closed ? 1 : 0,
        data.saturday_open, data.saturday_close, data.saturday_closed ? 1 : 0,
        data.sunday_open, data.sunday_close, data.sunday_closed ? 1 : 0,
        data.timezone, data.special_hours_enabled ? 1 : 0, data.notes
      ];
      
      const [result] = await pool.query<OkPacket>(insertQuery, params);
      data.id = result.insertId;
    } else {
      // Update existing business hours
      const id = existingRows[0].id;
      
      const updateQuery = `
        UPDATE business_hours SET
          monday_open = ?, monday_close = ?, monday_closed = ?,
          tuesday_open = ?, tuesday_close = ?, tuesday_closed = ?,
          wednesday_open = ?, wednesday_close = ?, wednesday_closed = ?,
          thursday_open = ?, thursday_close = ?, thursday_closed = ?,
          friday_open = ?, friday_close = ?, friday_closed = ?,
          saturday_open = ?, saturday_close = ?, saturday_closed = ?,
          sunday_open = ?, sunday_close = ?, sunday_closed = ?,
          timezone = ?, special_hours_enabled = ?, notes = ?
        WHERE id = ?
      `;
      
      const params = [
        data.monday_open, data.monday_close, data.monday_closed ? 1 : 0,
        data.tuesday_open, data.tuesday_close, data.tuesday_closed ? 1 : 0,
        data.wednesday_open, data.wednesday_close, data.wednesday_closed ? 1 : 0,
        data.thursday_open, data.thursday_close, data.thursday_closed ? 1 : 0,
        data.friday_open, data.friday_close, data.friday_closed ? 1 : 0,
        data.saturday_open, data.saturday_close, data.saturday_closed ? 1 : 0,
        data.sunday_open, data.sunday_close, data.sunday_closed ? 1 : 0,
        data.timezone, data.special_hours_enabled ? 1 : 0, data.notes,
        id
      ];
      
      await pool.query(updateQuery, params);
      data.id = id;
    }
    
    // Return the updated business hours
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating business hours:', error);
    return NextResponse.json(
      { error: 'Failed to update business hours' },
      { status: 500 }
    );
  }
} 