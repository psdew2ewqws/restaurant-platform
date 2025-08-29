-- ==================================================
-- RESTAURANT PLATFORM LICENSE SYSTEM - CORRECTED
-- PostgreSQL-Centric Implementation (Compatible with existing schema)
-- ==================================================

-- Enable required extensions (skip cron for now)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==================================================
-- ENHANCED TABLES (Compatible with text IDs)
-- ==================================================

-- License audit trail for compliance
CREATE TABLE IF NOT EXISTS license_audit_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id text NOT NULL,
    license_id text NOT NULL,
    action varchar(50) NOT NULL, -- 'created', 'renewed', 'suspended', 'feature_changed', 'expired'
    old_data jsonb,
    new_data jsonb,
    performed_by text, -- user who made the change
    ip_address inet,
    user_agent text,
    created_at timestamp DEFAULT now(),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE
);

-- License usage tracking for analytics
CREATE TABLE IF NOT EXISTS license_usage_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id text NOT NULL,
    license_id text NOT NULL,
    feature_name varchar(100) NOT NULL,
    usage_count integer DEFAULT 1,
    usage_date date DEFAULT CURRENT_DATE,
    metadata jsonb DEFAULT '{}',
    created_at timestamp DEFAULT now(),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE
);

-- License notifications system
CREATE TABLE IF NOT EXISTS license_notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id text NOT NULL,
    license_id text NOT NULL,
    type varchar(50) NOT NULL, -- 'expiry_warning', 'usage_limit', 'renewal_reminder', 'suspended'
    title varchar(255) NOT NULL,
    message text NOT NULL,
    severity varchar(20) DEFAULT 'info', -- 'info', 'warning', 'critical'
    is_read boolean DEFAULT false,
    is_dismissed boolean DEFAULT false,
    expires_at timestamp,
    metadata jsonb DEFAULT '{}',
    created_at timestamp DEFAULT now(),
    read_at timestamp,
    dismissed_at timestamp,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE
);

-- License templates for easy management
CREATE TABLE IF NOT EXISTS license_templates (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name varchar(100) NOT NULL,
    description text,
    type license_type NOT NULL DEFAULT 'trial',
    duration_days integer NOT NULL DEFAULT 30,
    max_users integer DEFAULT 10,
    max_branches integer DEFAULT 1,
    features jsonb NOT NULL DEFAULT '[]',
    pricing jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- ==================================================
-- INDEXES FOR PERFORMANCE
-- ==================================================

-- License system indexes
CREATE INDEX IF NOT EXISTS idx_licenses_company_status ON licenses(company_id, status);
CREATE INDEX IF NOT EXISTS idx_licenses_expiry_active ON licenses(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_licenses_days_remaining ON licenses(days_remaining) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_licenses_type_status ON licenses(type, status);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_license_audit_company_date ON license_audit_logs(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_license_audit_license_action ON license_audit_logs(license_id, action);

-- Usage logs indexes
CREATE INDEX IF NOT EXISTS idx_license_usage_company_date ON license_usage_logs(company_id, usage_date DESC);
CREATE INDEX IF NOT EXISTS idx_license_usage_feature ON license_usage_logs(feature_name, usage_date DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_license_notifications_company_unread ON license_notifications(company_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_license_notifications_type_severity ON license_notifications(type, severity);

-- ==================================================
-- POSTGRESQL FUNCTIONS FOR LICENSE MANAGEMENT
-- ==================================================

-- Function to check and update expired licenses
CREATE OR REPLACE FUNCTION check_expired_licenses()
RETURNS TABLE(updated_count integer, expired_licenses jsonb) AS $$
DECLARE
    updated_count integer := 0;
    expired_licenses jsonb := '[]'::jsonb;
BEGIN
    -- Update expired licenses
    WITH expired_updates AS (
        UPDATE licenses 
        SET status = 'expired',
            days_remaining = 0,
            updated_at = now()
        WHERE expires_at < now() 
        AND status = 'active'
        RETURNING id, company_id, type, expires_at
    ),
    expired_data AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'license_id', id,
                'company_id', company_id,
                'type', type,
                'expired_at', expires_at
            )
        ) as licenses
        FROM expired_updates
    )
    SELECT 
        (SELECT count(*)::integer FROM expired_updates),
        COALESCE((SELECT licenses FROM expired_data), '[]'::jsonb)
    INTO updated_count, expired_licenses;

    -- Log expired licenses
    INSERT INTO license_audit_logs (license_id, company_id, action, new_data, created_at)
    SELECT 
        (value->>'license_id')::text,
        (value->>'company_id')::text,
        'expired',
        value,
        now()
    FROM jsonb_array_elements(expired_licenses);

    RETURN QUERY SELECT updated_count, expired_licenses;
END;
$$ LANGUAGE plpgsql;

-- Function to update days remaining for all active licenses
CREATE OR REPLACE FUNCTION update_license_days_remaining()
RETURNS integer AS $$
DECLARE
    updated_count integer := 0;
BEGIN
    WITH updates AS (
        UPDATE licenses 
        SET 
            days_remaining = GREATEST(0, EXTRACT(days FROM expires_at - now())::integer),
            last_checked = now(),
            updated_at = now()
        WHERE status = 'active'
        RETURNING id
    )
    SELECT count(*)::integer INTO updated_count FROM updates;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to create expiry warnings
CREATE OR REPLACE FUNCTION create_license_expiry_warnings(warning_days integer DEFAULT 30)
RETURNS integer AS $$
DECLARE
    created_count integer := 0;
BEGIN
    -- Create warnings for licenses expiring within warning_days
    WITH warning_licenses AS (
        SELECT 
            l.id as license_id,
            l.company_id,
            l.type,
            l.expires_at,
            l.days_remaining,
            c.name as company_name
        FROM licenses l
        JOIN companies c ON l.company_id = c.id
        WHERE l.status = 'active'
        AND l.days_remaining <= warning_days
        AND l.days_remaining > 0
        AND NOT EXISTS (
            SELECT 1 FROM license_notifications ln 
            WHERE ln.license_id = l.id 
            AND ln.type = 'expiry_warning'
            AND ln.created_at > now() - interval '24 hours'
        )
    ),
    new_notifications AS (
        INSERT INTO license_notifications (
            company_id, 
            license_id, 
            type, 
            title,
            message, 
            severity,
            metadata,
            created_at
        )
        SELECT 
            company_id,
            license_id,
            'expiry_warning',
            'License Expiring Soon',
            CASE 
                WHEN days_remaining <= 7 THEN 'URGENT: Your ' || type::text || ' license expires in ' || days_remaining || ' days!'
                WHEN days_remaining <= 14 THEN 'WARNING: Your ' || type::text || ' license expires in ' || days_remaining || ' days.'
                ELSE 'NOTICE: Your ' || type::text || ' license expires in ' || days_remaining || ' days.'
            END,
            CASE 
                WHEN days_remaining <= 7 THEN 'critical'
                WHEN days_remaining <= 14 THEN 'warning'
                ELSE 'info'
            END,
            jsonb_build_object(
                'days_remaining', days_remaining,
                'expires_at', expires_at,
                'license_type', type::text,
                'company_name', company_name
            ),
            now()
        FROM warning_licenses
        RETURNING id
    )
    SELECT count(*)::integer INTO created_count FROM new_notifications;
    
    RETURN created_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get license status for a company
CREATE OR REPLACE FUNCTION get_company_license_status(company_uuid text)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'license_id', l.id,
        'company_id', l.company_id,
        'type', l.type,
        'status', l.status,
        'days_remaining', l.days_remaining,
        'expires_at', l.expires_at,
        'is_expired', (l.status = 'expired' OR l.expires_at < now()),
        'is_near_expiry', (l.days_remaining <= 30 AND l.days_remaining > 0),
        'is_critical', (l.days_remaining <= 7 AND l.days_remaining > 0),
        'max_users', l.max_users,
        'max_branches', l.max_branches,
        'features', l.features,
        'warning_level', 
            CASE 
                WHEN l.status = 'expired' OR l.expires_at < now() THEN 'expired'
                WHEN l.days_remaining <= 7 THEN 'critical'
                WHEN l.days_remaining <= 14 THEN 'warning'
                WHEN l.days_remaining <= 30 THEN 'notice'
                ELSE 'active'
            END
    )
    INTO result
    FROM licenses l
    WHERE l.company_id = company_uuid
    AND l.status = 'active'
    ORDER BY l.created_at DESC
    LIMIT 1;
    
    -- Return default if no license found
    IF result IS NULL THEN
        result := jsonb_build_object(
            'license_id', null,
            'company_id', company_uuid,
            'type', 'trial',
            'status', 'expired',
            'days_remaining', 0,
            'expires_at', null,
            'is_expired', true,
            'is_near_expiry', false,
            'is_critical', false,
            'max_users', 5,
            'max_branches', 1,
            'features', '["basic"]'::jsonb,
            'warning_level', 'expired'
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to track feature usage
CREATE OR REPLACE FUNCTION track_license_usage(
    company_uuid text,
    feature_name_param varchar(100),
    usage_count_param integer DEFAULT 1,
    metadata_param jsonb DEFAULT '{}'
)
RETURNS boolean AS $$
DECLARE
    license_uuid text;
BEGIN
    -- Get active license
    SELECT id INTO license_uuid
    FROM licenses 
    WHERE company_id = company_uuid 
    AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF license_uuid IS NULL THEN
        RETURN false;
    END IF;
    
    -- Insert usage log
    INSERT INTO license_usage_logs (
        company_id, 
        license_id, 
        feature_name, 
        usage_count, 
        metadata,
        created_at
    ) VALUES (
        company_uuid,
        license_uuid,
        feature_name_param,
        usage_count_param,
        metadata_param,
        now()
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- TRIGGERS FOR AUTOMATIC AUDIT LOGGING
-- ==================================================

-- Trigger function for license audit logging
CREATE OR REPLACE FUNCTION trigger_license_audit_log()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO license_audit_logs (
            license_id, 
            company_id, 
            action, 
            new_data,
            created_at
        ) VALUES (
            NEW.id,
            NEW.company_id,
            'created',
            row_to_json(NEW)::jsonb,
            now()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO license_audit_logs (
            license_id,
            company_id,
            action,
            old_data,
            new_data,
            created_at
        ) VALUES (
            NEW.id,
            NEW.company_id,
            CASE 
                WHEN OLD.status != NEW.status THEN 'status_changed'
                WHEN OLD.expires_at != NEW.expires_at THEN 'renewed'
                ELSE 'updated'
            END,
            row_to_json(OLD)::jsonb,
            row_to_json(NEW)::jsonb,
            now()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for license audit logging
DROP TRIGGER IF EXISTS license_audit_trigger ON licenses;
CREATE TRIGGER license_audit_trigger
    AFTER INSERT OR UPDATE ON licenses
    FOR EACH ROW
    EXECUTE FUNCTION trigger_license_audit_log();

-- ==================================================
-- SAMPLE DATA (License Templates)
-- ==================================================

INSERT INTO license_templates (name, description, type, duration_days, max_users, max_branches, features, pricing) VALUES
('Trial Plan', '30-day trial with basic features', 'trial', 30, 5, 1, '["basic_pos", "basic_reports", "customer_management"]', '{"monthly": 0, "yearly": 0}'),
('Active Plan', 'Small restaurant package', 'active', 365, 10, 2, '["basic_pos", "advanced_reports", "customer_management", "inventory_basic"]', '{"monthly": 49, "yearly": 499}'),
('Premium Plan', 'Multi-location restaurant chain', 'premium', 365, 25, 5, '["advanced_pos", "advanced_reports", "customer_management", "inventory_advanced", "delivery_integration", "analytics"]', '{"monthly": 99, "yearly": 999}')
ON CONFLICT (id) DO NOTHING;

-- ==================================================
-- VIEWS FOR EASY REPORTING
-- ==================================================

-- View for license dashboard
CREATE OR REPLACE VIEW license_dashboard AS
SELECT 
    l.id,
    l.company_id,
    c.name as company_name,
    c.slug as company_slug,
    l.type,
    l.status,
    l.days_remaining,
    l.expires_at,
    l.max_users,
    l.max_branches,
    (l.status = 'expired' OR l.expires_at < now()) as is_expired,
    (l.days_remaining <= 30 AND l.days_remaining > 0) as is_near_expiry,
    (l.days_remaining <= 7 AND l.days_remaining > 0) as is_critical,
    CASE 
        WHEN l.status = 'expired' OR l.expires_at < now() THEN 'expired'
        WHEN l.days_remaining <= 7 THEN 'critical'
        WHEN l.days_remaining <= 14 THEN 'warning'
        WHEN l.days_remaining <= 30 THEN 'notice'
        ELSE 'active'
    END as warning_level,
    l.created_at,
    l.updated_at
FROM licenses l
JOIN companies c ON l.company_id = c.id
WHERE c.deleted_at IS NULL;

COMMENT ON VIEW license_dashboard IS 'Comprehensive license information for dashboard display';

-- Test the functions with sample data
DO $$
BEGIN
    RAISE NOTICE 'License system PostgreSQL functions installed successfully!';
    RAISE NOTICE 'Available functions:';
    RAISE NOTICE '  - check_expired_licenses()';
    RAISE NOTICE '  - update_license_days_remaining()';  
    RAISE NOTICE '  - create_license_expiry_warnings(days)';
    RAISE NOTICE '  - get_company_license_status(company_id)';
    RAISE NOTICE '  - track_license_usage(company_id, feature, count, metadata)';
END $$;