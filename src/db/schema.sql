-- PCS-B-LTD Complete Database Schema
-- PostgreSQL Database Schema for Comprehensive Business Management Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE SYSTEM TABLES
-- ============================================================================

-- Users table with enhanced fields
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_picture VARCHAR(500),
    date_of_birth DATE,
    gender VARCHAR(10),
    national_id VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Rwanda',
    postal_code VARCHAR(20),
    preferred_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Africa/Kigali',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    phone_verified_at TIMESTAMP,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions junction table
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- User roles junction table
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- Organizations/Companies table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    registration_number VARCHAR(100),
    tax_number VARCHAR(100),
    industry VARCHAR(100),
    business_type VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    logo VARCHAR(500),
    description TEXT,
    established_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User organization memberships
CREATE TABLE user_organizations (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role_in_org VARCHAR(100),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    PRIMARY KEY (user_id, organization_id)
);

-- ============================================================================
-- PROJECT MANAGEMENT TABLES
-- ============================================================================

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'planning',
    priority VARCHAR(20) DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    estimated_budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2) DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0,
    client_id UUID REFERENCES users(id),
    project_manager_id UUID REFERENCES users(id),
    location TEXT,
    coordinates POINT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES tasks(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to UUID REFERENCES users(id),
    assigned_by UUID REFERENCES users(id),
    estimated_hours INTEGER,
    actual_hours INTEGER DEFAULT 0,
    due_date TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    location TEXT,
    coordinates POINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task dependencies
CREATE TABLE task_dependencies (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'finish_to_start',
    PRIMARY KEY (task_id, depends_on_task_id)
);

-- Task attachments
CREATE TABLE task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INVENTORY MANAGEMENT TABLES
-- ============================================================================

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products/Items table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    category_id UUID REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    unit_of_measure VARCHAR(50),
    cost_price DECIMAL(15,2),
    selling_price DECIMAL(15,2),
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER,
    reorder_level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_service BOOLEAN DEFAULT false,
    weight DECIMAL(10,3),
    dimensions VARCHAR(100),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    product_id UUID REFERENCES products(id),
    location VARCHAR(100),
    quantity_available INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    quantity_ordered INTEGER DEFAULT 0,
    last_restocked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, location)
);

-- Inventory movements
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    product_id UUID REFERENCES products(id),
    movement_type VARCHAR(50) NOT NULL, -- 'in', 'out', 'transfer', 'adjustment'
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(15,2),
    reference_type VARCHAR(50), -- 'purchase', 'sale', 'transfer', 'adjustment'
    reference_id UUID,
    from_location VARCHAR(100),
    to_location VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SUPPLIER AND VENDOR MANAGEMENT
-- ============================================================================

-- Suppliers table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_number VARCHAR(100),
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(15,2),
    rating INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase orders
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    supplier_id UUID REFERENCES suppliers(id),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    total_amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase order items
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FINANCIAL MANAGEMENT TABLES
-- ============================================================================

-- Accounts table (Chart of Accounts)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'asset', 'liability', 'equity', 'revenue', 'expense'
    parent_account_id UUID REFERENCES accounts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table (General Ledger)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    transaction_number VARCHAR(100) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'income', 'expense', 'transfer', 'adjustment'
    reference_type VARCHAR(50), -- 'invoice', 'payment', 'purchase', 'loan', etc.
    reference_id UUID,
    description TEXT,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction entries (Double-entry bookkeeping)
CREATE TABLE transaction_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CUSTOMER AND CLIENT MANAGEMENT
-- ============================================================================

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    customer_number VARCHAR(100) UNIQUE,
    customer_type VARCHAR(50) DEFAULT 'individual', -- 'individual', 'business'
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_number VARCHAR(100),
    credit_limit DECIMAL(15,2) DEFAULT 0,
    payment_terms VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    customer_id UUID REFERENCES customers(id),
    project_id UUID REFERENCES projects(id),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    balance_due DECIMAL(15,2) NOT NULL,
    notes TEXT,
    terms_conditions TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PAYMENT MANAGEMENT TABLES
-- ============================================================================

-- Payment methods table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'cash', 'bank', 'mobile_money', 'card', 'digital_wallet'
    provider VARCHAR(100), -- 'M-Pesa', 'Airtel Money', 'MTN Mobile Money', etc.
    account_number VARCHAR(100),
    account_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    payment_number VARCHAR(100) UNIQUE NOT NULL,
    payment_date DATE NOT NULL,
    payment_type VARCHAR(50) NOT NULL, -- 'received', 'sent'
    payment_method_id UUID REFERENCES payment_methods(id),
    reference_type VARCHAR(50), -- 'invoice', 'loan', 'expense', 'salary'
    reference_id UUID,
    payer_id UUID, -- Can reference customers, suppliers, or users
    payer_type VARCHAR(50), -- 'customer', 'supplier', 'employee'
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RWF',
    exchange_rate DECIMAL(10,4) DEFAULT 1.0,
    amount_in_base_currency DECIMAL(15,2) NOT NULL,
    transaction_fee DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    external_transaction_id VARCHAR(255),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment allocations (for partial payments)
CREATE TABLE payment_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    reference_type VARCHAR(50) NOT NULL, -- 'invoice', 'loan_installment'
    reference_id UUID NOT NULL,
    allocated_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- LENDING AND CREDIT MANAGEMENT
-- ============================================================================

-- Loan types
CREATE TABLE loan_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    interest_rate DECIMAL(5,2) NOT NULL,
    interest_type VARCHAR(20) DEFAULT 'fixed', -- 'fixed', 'variable'
    calculation_method VARCHAR(20) DEFAULT 'simple', -- 'simple', 'compound'
    max_amount DECIMAL(15,2),
    min_amount DECIMAL(15,2),
    max_term_months INTEGER,
    min_term_months INTEGER,
    processing_fee_rate DECIMAL(5,2) DEFAULT 0,
    late_payment_fee_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans table
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    loan_number VARCHAR(100) UNIQUE NOT NULL,
    loan_type_id UUID REFERENCES loan_types(id),
    borrower_id UUID REFERENCES customers(id),
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    interest_type VARCHAR(20) DEFAULT 'fixed',
    term_months INTEGER NOT NULL,
    monthly_payment DECIMAL(15,2) NOT NULL,
    processing_fee DECIMAL(15,2) DEFAULT 0,
    loan_date DATE NOT NULL,
    first_payment_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    purpose TEXT,
    collateral_description TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    disbursed_by UUID REFERENCES users(id),
    disbursed_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan installments
CREATE TABLE loan_installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_amount DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    balance_due DECIMAL(15,2) NOT NULL,
    late_fee DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    paid_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan payments (links to payments table)
CREATE TABLE loan_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    installment_id UUID REFERENCES loan_installments(id),
    payment_type VARCHAR(50) DEFAULT 'regular', -- 'regular', 'partial', 'advance', 'full'
    principal_paid DECIMAL(15,2) DEFAULT 0,
    interest_paid DECIMAL(15,2) DEFAULT 0,
    late_fee_paid DECIMAL(15,2) DEFAULT 0,
    total_paid DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EMPLOYEE AND PAYROLL MANAGEMENT
-- ============================================================================

-- Employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    employee_number VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    employment_type VARCHAR(50) DEFAULT 'full_time',
    hire_date DATE NOT NULL,
    termination_date DATE,
    salary DECIMAL(15,2),
    hourly_rate DECIMAL(10,2),
    bank_account_number VARCHAR(100),
    bank_name VARCHAR(100),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payroll table
CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    employee_id UUID REFERENCES employees(id),
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    basic_salary DECIMAL(15,2) NOT NULL,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    overtime_rate DECIMAL(10,2) DEFAULT 0,
    overtime_pay DECIMAL(15,2) DEFAULT 0,
    allowances DECIMAL(15,2) DEFAULT 0,
    deductions DECIMAL(15,2) DEFAULT 0,
    tax_deduction DECIMAL(15,2) DEFAULT 0,
    net_pay DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUDIT AND COMPLIANCE TABLES
-- ============================================================================

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System logs table
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL, -- 'info', 'warning', 'error', 'debug'
    message TEXT NOT NULL,
    context JSONB,
    module VARCHAR(100),
    user_id UUID REFERENCES users(id),
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ESG AND SUSTAINABILITY TABLES
-- ============================================================================

-- ESG metrics table
CREATE TABLE esg_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    metric_type VARCHAR(50) NOT NULL, -- 'environmental', 'social', 'governance'
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    unit_of_measure VARCHAR(50),
    measurement_date DATE NOT NULL,
    project_id UUID REFERENCES projects(id),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- COMMUNICATION AND COLLABORATION TABLES
-- ============================================================================

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    sender_id UUID REFERENCES users(id),
    recipient_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'file', 'image', 'video'
    attachment_path VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    parent_message_id UUID REFERENCES messages(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'info', 'warning', 'error', 'success'
    reference_type VARCHAR(50),
    reference_id UUID,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MOBILE MONEY AND INTEGRATION TABLES
-- ============================================================================

-- Mobile money providers
CREATE TABLE mobile_money_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    country VARCHAR(100) NOT NULL,
    api_endpoint VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mobile money accounts
CREATE TABLE mobile_money_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    provider_id UUID REFERENCES mobile_money_providers(id),
    account_number VARCHAR(100) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mobile money transactions
CREATE TABLE mobile_money_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    payment_id UUID REFERENCES payments(id),
    provider_id UUID REFERENCES mobile_money_providers(id),
    transaction_id VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RWF',
    transaction_type VARCHAR(50) NOT NULL, -- 'send', 'receive', 'withdraw', 'deposit'
    status VARCHAR(50) DEFAULT 'pending',
    provider_response JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- REPORTS AND ANALYTICS TABLES
-- ============================================================================

-- Report templates
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL,
    template_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated reports
CREATE TABLE generated_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    template_id UUID REFERENCES report_templates(id),
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    parameters JSONB,
    status VARCHAR(50) DEFAULT 'generating',
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_active ON users(is_active);

-- Organization indexes
CREATE INDEX idx_organizations_active ON organizations(is_active);

-- Project indexes
CREATE INDEX idx_projects_organization ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- Task indexes
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Inventory indexes
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location);
CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(created_at);

-- Financial indexes
CREATE INDEX idx_transactions_organization ON transactions(organization_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Payment indexes
CREATE INDEX idx_payments_organization ON payments(organization_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_reference ON payments(reference_type, reference_id);

-- Loan indexes
CREATE INDEX idx_loans_borrower ON loans(borrower_id);
CREATE INDEX idx_loans_organization ON loans(organization_id);
CREATE INDEX idx_loans_type ON loans(loan_type_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_dates ON loans(loan_date, maturity_date);

-- Loan installments
CREATE INDEX idx_loan_installments_loan ON loan_installments(loan_id);
CREATE INDEX idx_loan_installments_due_date ON loan_installments(due_date);
CREATE INDEX idx_loan_installments_status ON loan_installments(status);

-- Employees
CREATE INDEX idx_employees_organization ON employees(organization_id);
CREATE INDEX idx_employees_number ON employees(employee_number);
CREATE INDEX idx_employees_status ON employees(is_active);

-- Payroll
CREATE INDEX idx_payroll_employee ON payroll(employee_id);
CREATE INDEX idx_payroll_period ON payroll(pay_period_start, pay_period_end);
CREATE INDEX idx_payroll_status ON payroll(status);

-- Audit logs
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);

-- System logs
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_module ON system_logs(module);
CREATE INDEX idx_system_logs_date ON system_logs(created_at);

-- ESG metrics
CREATE INDEX idx_esg_metrics_org ON esg_metrics(organization_id);
CREATE INDEX idx_esg_metrics_project ON esg_metrics(project_id);
CREATE INDEX idx_esg_metrics_type ON esg_metrics(metric_type);
CREATE INDEX idx_esg_metrics_date ON esg_metrics(measurement_date);

-- Messages
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_project ON messages(project_id);
CREATE INDEX idx_messages_read ON messages(is_read);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Mobile money transactions
CREATE INDEX idx_mobile_money_transactions_org ON mobile_money_transactions(organization_id);
CREATE INDEX idx_mobile_money_transactions_provider ON mobile_money_transactions(provider_id);
CREATE INDEX idx_mobile_money_transactions_status ON mobile_money_transactions(status);
CREATE INDEX idx_mobile_money_transactions_date ON mobile_money_transactions(created_at);

-- Reports
CREATE INDEX idx_report_templates_org ON report_templates(organization_id);
CREATE INDEX idx_generated_reports_org ON generated_reports(organization_id);
CREATE INDEX idx_generated_reports_template ON generated_reports(template_id);
CREATE INDEX idx_generated_reports_status ON generated_reports(status);

-- =============================================
-- HarvestLink Marketplace Tables
-- =============================================

-- Cooperatives
CREATE TABLE IF NOT EXISTS cooperatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    registration_number VARCHAR(100),
    district VARCHAR(100),
    sector VARCHAR(100),
    cell VARCHAR(100),
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    member_count INTEGER DEFAULT 0,
    total_land_hectares DECIMAL(10, 2),
    primary_crops JSONB,
    mobile_money_account VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produce Listings
CREATE TABLE IF NOT EXISTS produce_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id UUID NOT NULL REFERENCES cooperatives(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    grade VARCHAR(50),
    quantity_kg DECIMAL(12, 2) NOT NULL,
    available_kg DECIMAL(12, 2) NOT NULL,
    price_per_kg DECIMAL(10, 2) NOT NULL,
    min_price_per_kg DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'RWF',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','active','bidding','sold','expired','cancelled')),
    listing_type VARCHAR(20) DEFAULT 'instant' CHECK (listing_type IN ('instant','auction','contract')),
    description TEXT,
    location VARCHAR(255),
    district VARCHAR(100),
    harvest_date DATE,
    expiry_date TIMESTAMPTZ,
    images JSONB,
    quality_certificate VARCHAR(255),
    is_organic BOOLEAN DEFAULT FALSE,
    moisture_content DECIMAL(5, 2),
    created_by UUID NOT NULL REFERENCES users(id),
    weighing_record_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bids
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES produce_listings(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES users(id),
    bidder_name VARCHAR(255),
    bid_price_per_kg DECIMAL(10, 2) NOT NULL,
    quantity_kg DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(14, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RWF',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','withdrawn','countered','expired')),
    message TEXT,
    counter_price DECIMAL(10, 2),
    counter_message TEXT,
    expires_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    payment_method VARCHAR(50),
    escrow_reference VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weighing Records (IoT + Manual)
CREATE TABLE IF NOT EXISTS weighing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL,
    device_name VARCHAR(100),
    cooperative_id UUID REFERENCES cooperatives(id),
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    gross_weight_kg DECIMAL(12, 3) NOT NULL,
    tare_weight_kg DECIMAL(12, 3) DEFAULT 0,
    net_weight_kg DECIMAL(12, 3) NOT NULL,
    moisture_content DECIMAL(5, 2),
    quality_grade VARCHAR(20),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending','completed','error','calibrating')),
    location VARCHAR(255),
    farmer_name VARCHAR(255),
    farmer_id UUID,
    operator_id UUID REFERENCES users(id),
    ticket_number VARCHAR(100) UNIQUE,
    iot_raw_data JSONB,
    listing_id UUID REFERENCES produce_listings(id),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mobile Money Transactions (HarvestLink-specific, marketplace payments)
CREATE TABLE IF NOT EXISTS hl_mobile_money_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('MTN','Airtel','Tigo','Orange')),
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('payment','payout','escrow','refund','escrow_release')),
    sender_phone VARCHAR(20) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    sender_name VARCHAR(255),
    receiver_name VARCHAR(255),
    amount DECIMAL(14, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RWF',
    fee_amount DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(14, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','reversed','escrowed','released')),
    external_reference VARCHAR(100),
    internal_reference VARCHAR(100) UNIQUE NOT NULL,
    bid_id UUID REFERENCES bids(id),
    listing_id UUID REFERENCES produce_listings(id),
    escrow_released_at TIMESTAMPTZ,
    failure_reason TEXT,
    initiated_by UUID REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price Floors (Government-set minimum prices)
CREATE TABLE IF NOT EXISTS price_floors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    grade VARCHAR(50),
    min_price_per_kg DECIMAL(10, 2) NOT NULL,
    max_price_per_kg DECIMAL(10, 2),
    reference_price_per_kg DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'RWF',
    district VARCHAR(100),
    region VARCHAR(100),
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    set_by UUID NOT NULL REFERENCES users(id),
    authority VARCHAR(50),
    notes TEXT,
    source_document VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for HarvestLink tables
CREATE INDEX idx_cooperatives_district ON cooperatives(district);
CREATE INDEX idx_cooperatives_active ON cooperatives(is_active);

CREATE INDEX idx_produce_listings_coop ON produce_listings(cooperative_id);
CREATE INDEX idx_produce_listings_crop ON produce_listings(crop_name);
CREATE INDEX idx_produce_listings_status ON produce_listings(status);
CREATE INDEX idx_produce_listings_district ON produce_listings(district);
CREATE INDEX idx_produce_listings_created ON produce_listings(created_at DESC);

CREATE INDEX idx_bids_listing ON bids(listing_id);
CREATE INDEX idx_bids_bidder ON bids(bidder_id);
CREATE INDEX idx_bids_status ON bids(status);

CREATE INDEX idx_weighing_records_device ON weighing_records(device_id);
CREATE INDEX idx_weighing_records_coop ON weighing_records(cooperative_id);
CREATE INDEX idx_weighing_records_crop ON weighing_records(crop_name);
CREATE INDEX idx_weighing_records_created ON weighing_records(created_at DESC);

CREATE INDEX idx_hl_mobile_money_status ON hl_mobile_money_transactions(status);
CREATE INDEX idx_hl_mobile_money_initiated_by ON hl_mobile_money_transactions(initiated_by);
CREATE INDEX idx_hl_mobile_money_reference ON hl_mobile_money_transactions(internal_reference);

CREATE INDEX idx_price_floors_crop ON price_floors(crop_name);
CREATE INDEX idx_price_floors_active ON price_floors(is_active);
CREATE INDEX idx_price_floors_effective ON price_floors(effective_from, effective_to);
