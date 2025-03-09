# Invoices

## Database Schema

```sql
CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'draft',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

CREATE TABLE invoice_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    tax_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Endpoints

### Invoices

```typescript
// GET /api/invoices
// List all invoices with pagination and filters
GET /api/invoices?page=1&limit=10&status=draft&customer_id=1

// GET /api/invoices/:id
// Get single invoice with items and customer details
GET /api/invoices/1

// POST /api/invoices
// Create new invoice
POST /api/invoices
{
  "customer_id": 1,
  "issue_date": "2024-03-15",
  "due_date": "2024-04-14",
  "items": [
    {
      "description": "Web Development Services",
      "quantity": 1,
      "unit_price": 1000.00
    }
  ],
  "tax_rate": 10,
  "notes": "Payment due within 30 days"
}

// PUT /api/invoices/:id
// Update invoice
PUT /api/invoices/1
{
  "status": "sent",
  "due_date": "2024-04-30"
}

// DELETE /api/invoices/:id
// Delete invoice
DELETE /api/invoices/1
```

### Customers

```typescript
// GET /api/customers
// List all customers
GET /api/customers

// GET /api/customers/:id
// Get single customer with their invoices
GET /api/customers/1

// POST /api/customers
// Create new customer
POST /api/customers
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, Country",
  "tax_number": "TAX123456"
}

// PUT /api/customers/:id
// Update customer
PUT /api/customers/1
{
  "phone": "+1987654321"
}

// DELETE /api/customers/:id
// Delete customer (only if no invoices are linked)
DELETE /api/customers/1
```

## Features

### Invoice Management
- Create, edit, and delete invoices
- Auto-generate invoice numbers
- Calculate subtotal, tax, and total amounts
- Track invoice status (draft, sent, paid, overdue, cancelled)
- Add multiple items to each invoice
- Preview invoice before sending
- Generate PDF invoices
- Email invoices to customers

### Customer Management
- Maintain customer database
- Track customer contact information
- View customer invoice history
- Search and filter customers

### Reports
- Outstanding invoices report
- Payment collection report
- Customer statement
- Revenue by customer
- Monthly/yearly invoice summary

## UI Components

### Invoice List Page
- Table view of all invoices
- Status indicators
- Quick actions (view, edit, delete)
- Filters by status, date range, and customer
- Search functionality

### Invoice Form
- Customer selection
- Date pickers for issue and due dates
- Dynamic item rows
- Automatic calculations
- Status selection
- Notes/terms section
- Preview option

### Customer List Page
- Table view of all customers
- Contact information display
- Invoice count and total amount
- Quick actions (view, edit, delete)
- Search functionality

### Customer Form
- Basic information fields
- Address fields
- Tax information
- Contact details

### Invoice Preview/PDF
- Professional layout
- Company branding
- Customer details
- Item details with calculations
- Payment terms and notes
- Total amount with tax breakdown

## Workflow

1. Create/Select Customer
   - Add new customer or select existing one
   - Verify contact details

2. Create Invoice
   - Select customer
   - Add invoice items
   - Set dates and terms
   - Calculate totals
   - Preview and adjust

3. Process Invoice
   - Save as draft
   - Generate PDF
   - Send to customer
   - Track status

4. Payment Processing
   - Record payments
   - Update status
   - Send receipts

5. Reporting
   - Generate reports
   - Track outstanding payments
   - Analyze revenue 