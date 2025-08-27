-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert default admin company with explicit UUID
DO $$
DECLARE
    admin_company_id TEXT := gen_random_uuid()::TEXT;
    admin_branch_id TEXT := gen_random_uuid()::TEXT;
    admin_user_id TEXT := gen_random_uuid()::TEXT;
BEGIN
    -- Insert company
    INSERT INTO companies (
        id, name, slug, status, subscription_plan, updated_at
    ) VALUES (
        admin_company_id,
        'Restaurant Platform Admin',
        'admin-platform',
        'active',
        'enterprise',
        CURRENT_TIMESTAMP
    );
    
    -- Insert branch
    INSERT INTO branches (
        id, company_id, name, is_default, is_active, updated_at
    ) VALUES (
        admin_branch_id,
        admin_company_id,
        'Main Office',
        TRUE,
        TRUE,
        CURRENT_TIMESTAMP
    );
    
    -- Create super admin user (password: admin123)
    INSERT INTO users (
        id, name, email, password_hash, role, status, company_id, branch_id, 
        email_verified_at, must_change_password, updated_at
    ) VALUES (
        admin_user_id,
        'System Administrator',
        'admin@restaurantplatform.com',
        '$2a$12$LQv3c1yqBCFcXz7kSrHdKON8nKVBZ8VUGsP3T3Q7UKr5HkCl3j3aK',
        'super_admin',
        'active',
        admin_company_id,
        admin_branch_id,
        CURRENT_TIMESTAMP,
        TRUE,
        CURRENT_TIMESTAMP
    );
END $$;