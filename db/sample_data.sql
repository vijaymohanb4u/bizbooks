USE bizbooks;

-- Drop all tables except users
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS bill_items;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS transaction_tags;
DROP TABLE IF EXISTS invoice_tags;
DROP TABLE IF EXISTS bill_tags;
DROP TABLE IF EXISTS attachments;
DROP TABLE IF EXISTS transactions;
SET FOREIGN_KEY_CHECKS=1;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    description TEXT NULL,
    color VARCHAR(7) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('cash', 'bank', 'credit_card', 'investment', 'other') NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    initial_balance DECIMAL(15, 2) DEFAULT 0.00,
    current_balance DECIMAL(15, 2) DEFAULT 0.00,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    tax_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    tax_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
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

-- Create invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id INT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('draft', 'received', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'draft',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT
);

-- Create bill items table
CREATE TABLE IF NOT EXISTS bill_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bill_id INT NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Categories for both income and expenses
INSERT INTO categories (name, type, description, color) VALUES
-- Income Categories
('T-Shirts', 'income', 'Revenue from T-shirt sales', '#FF5733'),
('Jeans', 'income', 'Revenue from Jeans sales', '#33FF57'),
('Dresses', 'income', 'Revenue from Dress sales', '#3357FF'),
('Custom Orders', 'income', 'Revenue from custom clothing orders', '#FF33F5'),
('Wholesale', 'income', 'Wholesale clothing orders', '#33FFF5'),
('Uniforms', 'income', 'Corporate uniform orders', '#FF9933'),
('Accessories', 'income', 'Fashion accessories revenue', '#33FF99'),
('Alterations', 'income', 'Clothing alteration services', '#9933FF'),
-- Expense Categories
('Raw Materials', 'expense', 'Fabric and material costs', '#FF8C33'),
('Labor', 'expense', 'Production staff wages', '#33FF8C'),
('Equipment', 'expense', 'Machinery and tools', '#8C33FF'),
('Utilities', 'expense', 'Electricity, water, etc.', '#FF338C'),
('Marketing', 'expense', 'Advertising and promotions', '#338CFF'),
('Maintenance', 'expense', 'Equipment maintenance', '#FF3366'),
('Shipping', 'expense', 'Delivery and logistics', '#66FF33'),
('Insurance', 'expense', 'Business insurance costs', '#3366FF');

-- Sample Accounts
INSERT INTO accounts (name, type, currency, initial_balance, current_balance, description) VALUES
('Main Operating Account', 'bank', 'USD', 150000.00, 175000.00, 'Primary business checking account'),
('Payroll Account', 'bank', 'USD', 75000.00, 65000.00, 'Account for employee payroll'),
('Business Credit Card', 'credit_card', 'USD', 0.00, -22000.00, 'Company credit card for expenses'),
('Petty Cash', 'cash', 'USD', 3000.00, 2500.00, 'Cash on hand for small expenses'),
('Investment Account', 'investment', 'USD', 300000.00, 325000.00, 'Business savings and investments'),
('Equipment Fund', 'bank', 'USD', 100000.00, 85000.00, 'Reserved for equipment purchases'),
('Marketing Budget', 'bank', 'USD', 50000.00, 42000.00, 'Marketing and advertising funds');

-- Sample Customers (Retailers and Wholesalers) - 15 entries
INSERT INTO customers (name, email, phone, address, tax_number) VALUES
('Fashion Retail Co', 'orders@fashionretail.com', '555-0101', '123 Fashion Ave, NY', 'TAX123456'),
('StyleMart Chain', 'purchasing@stylemart.com', '555-0102', '456 Style Blvd, LA', 'TAX234567'),
('Boutique Elegance', 'hello@boutiqueelegance.com', '555-0103', '789 Elegant St, Chicago', 'TAX345678'),
('Department Store Inc', 'buyers@depstore.com', '555-0104', '321 Retail Row, Miami', 'TAX456789'),
('Fashion Forward Ltd', 'orders@fashionforward.com', '555-0105', '654 Trend Ave, Dallas', 'TAX567890'),
('Clothing Wholesale Co', 'sales@clothingwholesale.com', '555-0106', '987 Bulk Rd, Houston', 'TAX678901'),
('Apparel Distributors', 'info@appareldist.com', '555-0107', '147 Distribution Ln, Seattle', 'TAX789012'),
('Fashion Boutique', 'contact@fashionboutique.com', '555-0108', '258 Boutique Way, Boston', 'TAX890123'),
('Retail Giants', 'purchase@retailgiants.com', '555-0109', '369 Giant Blvd, Phoenix', 'TAX901234'),
('Style Shop', 'orders@styleshop.com', '555-0110', '741 Shop St, Denver', 'TAX012345'),
('Urban Fashion', 'sales@urbanfashion.com', '555-0111', '852 Urban St, Portland', 'TAX123789'),
('Trendy Stores', 'buy@trendystores.com', '555-0112', '963 Trend Lane, Austin', 'TAX234890'),
('Fashion Express', 'orders@fashionexpress.com', '555-0113', '159 Express Way, San Francisco', 'TAX345901'),
('Clothing Empire', 'sales@clothingempire.com', '555-0114', '753 Empire Blvd, Atlanta', 'TAX456012'),
('Style Universe', 'contact@styleuniverse.com', '555-0115', '951 Universe Ave, Las Vegas', 'TAX567123');

-- Sample Vendors (Suppliers and Service Providers) - 12 entries
INSERT INTO vendors (name, email, phone, address, tax_number) VALUES
('Fabric Suppliers Co', 'sales@fabricsuppliers.com', '555-0201', '123 Textile Rd, NY', 'VTAX123456'),
('Thread & Trim Inc', 'orders@threadtrim.com', '555-0202', '456 Supply Ave, LA', 'VTAX234567'),
('Machine Parts Ltd', 'parts@machineparts.com', '555-0203', '789 Industrial Blvd, Chicago', 'VTAX345678'),
('Packaging Solutions', 'sales@packaging.com', '555-0204', '321 Box St, Miami', 'VTAX456789'),
('Equipment Repairs Co', 'service@equiprepairs.com', '555-0205', '654 Fix Ave, Dallas', 'VTAX567890'),
('Textile Importers', 'import@textiles.com', '555-0206', '987 Port Rd, Houston', 'VTAX678901'),
('Button & Zipper Co', 'orders@buttonzipper.com', '555-0207', '147 Fastener Ln, Seattle', 'VTAX789012'),
('Dye Suppliers Inc', 'dyes@suppliers.com', '555-0208', '258 Color Way, Boston', 'VTAX890123'),
('Label Makers', 'info@labelmakers.com', '555-0209', '369 Tag Blvd, Phoenix', 'VTAX901234'),
('Shipping Partners', 'shipping@partners.com', '555-0210', '741 Delivery St, Denver', 'VTAX012345'),
('Premium Fabrics Ltd', 'sales@premiumfabrics.com', '555-0211', '852 Quality Rd, San Diego', 'VTAX123789'),
('Global Textile Trading', 'trade@globaltextile.com', '555-0212', '963 Trade Center, NYC', 'VTAX234890');

-- Sample Invoices - 20 entries with varied amounts and dates
INSERT INTO invoices (invoice_number, customer_id, issue_date, due_date, status, subtotal, tax_rate, tax_amount, total, notes) VALUES
('INV-2024-001', 1, '2024-09-15', '2024-10-14', 'paid', 15000.00, 8.50, 1275.00, 16275.00, 'Bulk T-shirt order'),
('INV-2024-002', 2, '2024-09-25', '2024-10-24', 'paid', 25000.00, 8.50, 2125.00, 27125.00, 'Spring collection'),
('INV-2024-003', 3, '2024-10-05', '2024-11-04', 'paid', 8500.00, 8.50, 722.50, 9222.50, 'Designer dresses'),
('INV-2024-004', 4, '2024-10-15', '2024-11-14', 'paid', 32000.00, 8.50, 2720.00, 34720.00, 'Winter collection'),
('INV-2024-005', 5, '2024-10-25', '2024-11-24', 'paid', 18500.00, 8.50, 1572.50, 20072.50, 'Jeans order'),
('INV-2024-006', 6, '2024-11-05', '2024-12-04', 'paid', 27500.00, 8.50, 2337.50, 29837.50, 'Spring dresses'),
('INV-2024-007', 7, '2024-11-15', '2024-12-14', 'paid', 21000.00, 8.50, 1785.00, 22785.00, 'Mixed apparel order'),
('INV-2024-008', 8, '2024-11-25', '2024-12-24', 'paid', 13500.00, 8.50, 1147.50, 14647.50, 'Custom order'),
('INV-2024-009', 9, '2024-12-05', '2025-01-04', 'paid', 42000.00, 8.50, 3570.00, 45570.00, 'Wholesale order'),
('INV-2024-010', 10, '2024-12-15', '2025-01-14', 'paid', 16500.00, 8.50, 1402.50, 17902.50, 'Seasonal collection'),
('INV-2025-001', 11, '2025-01-05', '2025-02-04', 'paid', 28500.00, 8.50, 2422.50, 30922.50, 'Summer preview'),
('INV-2025-002', 12, '2025-01-15', '2025-02-14', 'paid', 33000.00, 8.50, 2805.00, 35805.00, 'Premium collection'),
('INV-2025-003', 13, '2025-01-25', '2025-02-24', 'sent', 19500.00, 8.50, 1657.50, 21157.50, 'Urban collection'),
('INV-2025-004', 14, '2025-02-05', '2025-03-07', 'sent', 45000.00, 8.50, 3825.00, 48825.00, 'Wholesale bulk'),
('INV-2025-005', 15, '2025-02-15', '2025-03-17', 'sent', 22000.00, 8.50, 1870.00, 23870.00, 'Spring essentials'),
('INV-2025-006', 1, '2025-02-20', '2025-03-22', 'sent', 17500.00, 8.50, 1487.50, 18987.50, 'Summer basics'),
('INV-2025-007', 2, '2025-02-25', '2025-03-27', 'sent', 31000.00, 8.50, 2635.00, 33635.00, 'Designer collection'),
('INV-2025-008', 3, '2025-03-01', '2025-03-31', 'draft', 26500.00, 8.50, 2252.50, 28752.50, 'Premium dresses'),
('INV-2025-009', 4, '2025-03-05', '2025-04-04', 'draft', 38000.00, 8.50, 3230.00, 41230.00, 'Summer collection'),
('INV-2025-010', 5, '2025-03-08', '2025-04-07', 'draft', 23500.00, 8.50, 1997.50, 25497.50, 'Fashion basics');

-- Sample Invoice Items - Multiple items per invoice
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount) VALUES
(1, 'Basic Cotton T-Shirts', 500, 20.00, 10000.00),
(1, 'Premium T-Shirts', 200, 25.00, 5000.00),
(2, 'Designer Jeans', 250, 100.00, 25000.00),
(3, 'Evening Dresses', 50, 170.00, 8500.00),
(4, 'Winter Jackets', 200, 160.00, 32000.00),
(5, 'Casual Jeans', 370, 50.00, 18500.00),
(6, 'Spring Dresses', 250, 110.00, 27500.00),
(7, 'Mixed Apparel Bundle', 300, 70.00, 21000.00),
(8, 'Custom Design Pieces', 90, 150.00, 13500.00),
(9, 'Wholesale Mixed Lot', 600, 70.00, 42000.00),
(10, 'Seasonal Collection', 150, 110.00, 16500.00),
(11, 'Summer Dresses', 190, 150.00, 28500.00),
(12, 'Premium Jeans Collection', 220, 150.00, 33000.00),
(13, 'Urban Streetwear', 300, 65.00, 19500.00),
(14, 'Wholesale Fashion Bundle', 900, 50.00, 45000.00),
(15, 'Spring Collection Mix', 200, 110.00, 22000.00),
(16, 'Summer T-Shirt Bundle', 350, 50.00, 17500.00),
(17, 'Designer Summer Line', 155, 200.00, 31000.00),
(18, 'Premium Evening Wear', 106, 250.00, 26500.00),
(19, 'Summer Fashion Set', 380, 100.00, 38000.00),
(20, 'Basic Fashion Bundle', 470, 50.00, 23500.00),
-- Additional items for existing invoices
(1, 'Graphic T-Shirts', 300, 22.00, 6600.00),
(2, 'Slim Fit Jeans', 180, 95.00, 17100.00),
(3, 'Cocktail Dresses', 40, 160.00, 6400.00),
(4, 'Winter Accessories', 400, 25.00, 10000.00),
(5, 'Designer Jeans', 150, 120.00, 18000.00);

-- Sample Bills - 15 entries
INSERT INTO bills (bill_number, vendor_id, issue_date, due_date, status, subtotal, tax_rate, tax_amount, total, notes) VALUES
('BILL-2024-001', 1, '2024-09-10', '2024-10-09', 'paid', 12000.00, 8.50, 1020.00, 13020.00, 'Fabric order'),
('BILL-2024-002', 2, '2024-09-20', '2024-10-19', 'paid', 5000.00, 8.50, 425.00, 5425.00, 'Threads and trims'),
('BILL-2024-003', 3, '2024-10-01', '2024-10-31', 'paid', 8000.00, 8.50, 680.00, 8680.00, 'Machine parts'),
('BILL-2024-004', 4, '2024-10-15', '2024-11-14', 'paid', 3500.00, 8.50, 297.50, 3797.50, 'Packaging materials'),
('BILL-2024-005', 5, '2024-10-25', '2024-11-24', 'paid', 2500.00, 8.50, 212.50, 2712.50, 'Equipment repair'),
('BILL-2024-006', 6, '2024-11-05', '2024-12-04', 'paid', 15000.00, 8.50, 1275.00, 16275.00, 'Imported textiles'),
('BILL-2024-007', 7, '2024-11-15', '2024-12-14', 'paid', 4000.00, 8.50, 340.00, 4340.00, 'Buttons and zippers'),
('BILL-2024-008', 8, '2024-11-25', '2024-12-24', 'paid', 6000.00, 8.50, 510.00, 6510.00, 'Dye materials'),
('BILL-2024-009', 9, '2024-12-05', '2025-01-04', 'paid', 2000.00, 8.50, 170.00, 2170.00, 'Labels and tags'),
('BILL-2024-010', 10, '2024-12-15', '2025-01-14', 'paid', 3500.00, 8.50, 297.50, 3797.50, 'Shipping costs'),
('BILL-2025-001', 11, '2025-01-05', '2025-02-04', 'paid', 18000.00, 8.50, 1530.00, 19530.00, 'Premium fabrics'),
('BILL-2025-002', 12, '2025-01-15', '2025-02-14', 'paid', 9500.00, 8.50, 807.50, 10307.50, 'Imported materials'),
('BILL-2025-003', 1, '2025-01-25', '2025-02-24', 'received', 14500.00, 8.50, 1232.50, 15732.50, 'Spring fabric order'),
('BILL-2025-004', 2, '2025-02-05', '2025-03-07', 'received', 7500.00, 8.50, 637.50, 8137.50, 'Premium threads'),
('BILL-2025-005', 3, '2025-02-15', '2025-03-17', 'received', 11000.00, 8.50, 935.00, 11935.00, 'Equipment upgrade'),
('BILL-2025-006', 1, '2025-02-20', '2025-03-22', 'received', 22000.00, 8.50, 1870.00, 23870.00, 'Summer fabric stock'),
('BILL-2025-007', 6, '2025-02-25', '2025-03-27', 'received', 18500.00, 8.50, 1572.50, 20072.50, 'Premium imported textiles'),
('BILL-2025-008', 11, '2025-03-01', '2025-03-31', 'received', 25000.00, 8.50, 2125.00, 27125.00, 'Designer fabric collection'),
('BILL-2025-009', 8, '2025-03-05', '2025-04-04', 'draft', 12500.00, 8.50, 1062.50, 13562.50, 'Specialty dyes and chemicals'),
('BILL-2025-010', 3, '2025-03-08', '2025-04-07', 'draft', 31000.00, 8.50, 2635.00, 33635.00, 'Production equipment upgrade');

-- Sample Bill Items - Multiple items per bill
INSERT INTO bill_items (bill_id, description, quantity, unit_price, amount) VALUES
(1, 'Cotton Fabric Rolls', 400, 30.00, 12000.00),
(2, 'Thread Spools and Buttons', 1000, 5.00, 5000.00),
(3, 'Sewing Machine Parts', 20, 400.00, 8000.00),
(4, 'Packaging Boxes', 1000, 3.50, 3500.00),
(5, 'Equipment Maintenance', 5, 500.00, 2500.00),
(6, 'Imported Silk Fabric', 300, 50.00, 15000.00),
(7, 'Premium Zippers', 2000, 2.00, 4000.00),
(8, 'Fabric Dyes', 200, 30.00, 6000.00),
(9, 'Clothing Labels', 10000, 0.20, 2000.00),
(10, 'Shipping Services', 100, 35.00, 3500.00),
(11, 'Premium Cotton Fabric', 600, 30.00, 18000.00),
(12, 'Imported Wool Fabric', 190, 50.00, 9500.00),
(13, 'Spring Collection Fabric', 580, 25.00, 14500.00),
(14, 'Premium Thread Set', 1500, 5.00, 7500.00),
(15, 'Industrial Machine Parts', 22, 500.00, 11000.00),
-- Additional items for new accounts payable bills
(16, 'Summer Cotton Fabric', 800, 15.00, 12000.00),
(16, 'Linen Blend Material', 400, 25.00, 10000.00),
(17, 'Premium Silk', 250, 45.00, 11250.00),
(17, 'Designer Wool Blend', 200, 36.25, 7250.00),
(18, 'Luxury Cotton Blend', 500, 28.00, 14000.00),
(18, 'Designer Synthetic Fabric', 400, 27.50, 11000.00),
(19, 'Premium Dye Set', 150, 45.00, 6750.00),
(19, 'Specialty Chemicals', 230, 25.00, 5750.00),
(20, 'Automated Cutting Machine', 1, 20000.00, 20000.00),
(20, 'Installation Service', 1, 8000.00, 8000.00),
(20, 'Training Program', 1, 3000.00, 3000.00);

-- Sample Tags - 12 entries
INSERT INTO tags (name, color) VALUES
('Spring2024', '#FF9999'),
('Summer2024', '#99FF99'),
('Premium', '#9999FF'),
('Wholesale', '#FFFF99'),
('Rush Order', '#FF99FF'),
('Bulk Order', '#99FFFF'),
('Custom', '#FF99CC'),
('Seasonal', '#CC99FF'),
('Clearance', '#FFCC99'),
('Special Edition', '#99CCFF'),
('New Collection', '#FF9966'),
('Limited Edition', '#66FF99');

-- Create invoice_tags table
CREATE TABLE IF NOT EXISTS invoice_tags (
    invoice_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (invoice_id, tag_id),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Create bill_tags table
CREATE TABLE IF NOT EXISTS bill_tags (
    bill_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (bill_id, tag_id),
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Sample Invoice Tags - Multiple tags per invoice
INSERT INTO invoice_tags (invoice_id, tag_id) VALUES
(1, 1), (1, 4), -- Spring2024, Wholesale
(2, 1), (2, 3), -- Spring2024, Premium
(3, 7), -- Custom
(4, 8), -- Seasonal
(5, 4), (5, 6), -- Wholesale, Bulk Order
(6, 1), -- Spring2024
(7, 5), -- Rush Order
(8, 7), -- Custom
(9, 4), (9, 6), -- Wholesale, Bulk Order
(10, 8), -- Seasonal
(11, 2), (11, 11), -- Summer2024, New Collection
(12, 3), (12, 12), -- Premium, Limited Edition
(13, 2), -- Summer2024
(14, 4), (14, 6), -- Wholesale, Bulk Order
(15, 1), (15, 11), -- Spring2024, New Collection
(16, 2), -- Summer2024
(17, 3), (17, 11), -- Premium, New Collection
(18, 3), (18, 12), -- Premium, Limited Edition
(19, 2), (19, 11), -- Summer2024, New Collection
(20, 9); -- Clearance

-- Sample Bill Tags - Multiple tags per bill
INSERT INTO bill_tags (bill_id, tag_id) VALUES
(1, 1), -- Spring2024
(2, 1), -- Spring2024
(3, 5), -- Rush Order
(4, 6), -- Bulk Order
(5, 8), -- Seasonal
(6, 3), -- Premium
(7, 5), -- Rush Order
(8, 8), -- Seasonal
(9, 6), -- Bulk Order
(10, 5), -- Rush Order
(11, 2), -- Summer2024
(12, 3), -- Premium
(13, 1), -- Spring2024
(14, 3), -- Premium
(15, 11), -- New Collection
(16, 2), -- Summer2024
(16, 6), -- Bulk Order
(17, 3), -- Premium
(17, 2), -- Summer2024
(18, 3), -- Premium
(18, 11), -- New Collection
(19, 3), -- Premium
(20, 11); -- New Collection

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    category_id INT NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Sample Transactions
INSERT INTO transactions (date, description, amount, type, category_id, payment_method, reference_number, notes) VALUES
-- Income transactions
('2024-09-15', 'T-shirt bulk order payment', 16275.00, 'income', 1, 'bank_transfer', 'INV-2024-001', 'Payment received for bulk T-shirt order'),
('2024-09-25', 'Spring collection advance', 27125.00, 'income', 2, 'bank_transfer', 'INV-2024-002', 'Advance payment for spring collection'),
('2024-10-05', 'Custom wedding dress order', 9222.50, 'income', 4, 'credit_card', 'INV-2024-003', 'Custom order payment'),
('2024-10-15', 'Winter collection payment', 34720.00, 'income', 5, 'bank_transfer', 'INV-2024-004', 'Winter collection wholesale payment'),
('2024-10-25', 'Uniform order - Corp client', 20072.50, 'income', 6, 'bank_transfer', 'INV-2024-005', 'Corporate uniform order payment'),

-- Expense transactions
('2024-09-10', 'Fabric purchase', 13020.00, 'expense', 9, 'bank_transfer', 'BILL-2024-001', 'Monthly fabric stock purchase'),
('2024-09-20', 'Production staff wages', 5425.00, 'expense', 10, 'bank_transfer', 'PAY-2024-001', 'September second week wages'),
('2024-10-01', 'Machine maintenance', 8680.00, 'expense', 11, 'credit_card', 'BILL-2024-003', 'Quarterly maintenance service'),
('2024-10-15', 'Electricity bill', 3797.50, 'expense', 12, 'bank_transfer', 'UTIL-2024-001', 'October utility bill'),
('2024-11-05', 'Marketing campaign', 2712.50, 'expense', 13, 'credit_card', 'MKT-2024-001', 'Social media advertising'),
('2024-11-15', 'Equipment repair', 16275.00, 'expense', 14, 'bank_transfer', 'BILL-2024-006', 'Emergency repair of main production line'),
('2024-12-05', 'Shipping costs', 4340.00, 'expense', 15, 'credit_card', 'BILL-2024-007', 'Monthly courier service payment'),
('2025-01-05', 'Insurance premium', 6510.00, 'expense', 16, 'bank_transfer', 'INS-2025-001', 'Quarterly insurance payment'),
('2025-02-20', 'Summer fabric purchase', 23870.00, 'expense', 9, 'bank_transfer', 'BILL-2025-006', 'Summer collection fabric stock'),
('2025-02-25', 'Premium textile import', 20072.50, 'expense', 9, 'bank_transfer', 'BILL-2025-007', 'Premium imported materials'),
('2025-03-01', 'Designer fabrics', 27125.00, 'expense', 9, 'bank_transfer', 'BILL-2025-008', 'High-end fabric collection'),
('2025-03-05', 'Dyes and chemicals', 13562.50, 'expense', 9, 'bank_transfer', 'BILL-2025-009', 'Specialty dye materials'),
('2025-03-08', 'Equipment upgrade', 33635.00, 'expense', 11, 'bank_transfer', 'BILL-2025-010', 'Production line upgrade');

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(100),
    file_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- Sample attachments
INSERT INTO attachments (transaction_id, file_name, file_path, file_type, file_size) VALUES
(1, 'invoice-2024-001.pdf', '/attachments/invoices/2024/01/invoice-2024-001.pdf', 'application/pdf', 245760),
(2, 'invoice-2024-002.pdf', '/attachments/invoices/2024/01/invoice-2024-002.pdf', 'application/pdf', 267288),
(6, 'bill-2024-001.pdf', '/attachments/bills/2024/01/bill-2024-001.pdf', 'application/pdf', 198450),
(8, 'maintenance-report.pdf', '/attachments/expenses/2024/01/maintenance-report.pdf', 'application/pdf', 356200),
(14, 'bill-2024-016.pdf', '/attachments/bills/2024/03/bill-2024-016.pdf', 'application/pdf', 287500),
(15, 'bill-2024-017.pdf', '/attachments/bills/2024/03/bill-2024-017.pdf', 'application/pdf', 265300),
(16, 'bill-2024-018.pdf', '/attachments/bills/2024/03/bill-2024-018.pdf', 'application/pdf', 312400),
(17, 'bill-2024-019.pdf', '/attachments/bills/2024/03/bill-2024-019.pdf', 'application/pdf', 245600),
(18, 'equipment-upgrade-quote.pdf', '/attachments/bills/2024/03/bill-2024-020.pdf', 'application/pdf', 425800); 