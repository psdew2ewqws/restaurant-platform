--
-- PostgreSQL database dump
-- Restaurant Platform Schema - Updated: 2025-09-03
-- Database: postgres
-- Dumped from database version 17.6 (Ubuntu 17.6-1.pgdg24.04+1)
-- Dumped by pg_dump version 17.6 (Ubuntu 17.6-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

-- =============================================
-- ENUMS
-- =============================================

--
-- Name: company_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.company_status AS ENUM (
    'active',
    'inactive',
    'suspended',
    'trial'
);

--
-- Name: license_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.license_status AS ENUM (
    'active',
    'expired',
    'suspended',
    'cancelled'
);

--
-- Name: modifier_selection_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.modifier_selection_type AS ENUM (
    'single',
    'multiple',
    'counter'
);

--
-- Name: order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'ready_for_pickup',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'refunded'
);

--
-- Name: order_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_type AS ENUM (
    'delivery',
    'pickup',
    'dine_in'
);

--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'cash',
    'card',
    'online',
    'wallet'
);

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);

--
-- Name: print_job_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.print_job_status AS ENUM (
    'pending',
    'printing',
    'completed',
    'failed'
);

--
-- Name: print_job_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.print_job_type AS ENUM (
    'receipt',
    'kitchen_order',
    'label',
    'test'
);

--
-- Name: printer_assignment; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.printer_assignment AS ENUM (
    'kitchen',
    'cashier',
    'bar',
    'all'
);

--
-- Name: printer_connection; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.printer_connection AS ENUM (
    'network',
    'usb',
    'bluetooth'
);

--
-- Name: printer_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.printer_status AS ENUM (
    'online',
    'offline',
    'error',
    'unknown'
);

--
-- Name: printer_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.printer_type AS ENUM (
    'thermal',
    'receipt',
    'kitchen',
    'label'
);

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'super_admin',
    'company_owner',
    'branch_manager',
    'cashier',
    'call_center'
);

--
-- Name: user_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_status AS ENUM (
    'active',
    'inactive',
    'suspended',
    'pending'
);

-- =============================================
-- FUNCTIONS
-- =============================================

--
-- Name: check_expired_licenses(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_expired_licenses() RETURNS TABLE(updated_count integer, expired_licenses jsonb)
    LANGUAGE plpgsql
    AS $$
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
$$;

--
-- Name: create_license_expiry_warnings(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_license_expiry_warnings(warning_days integer DEFAULT 30) RETURNS integer
    LANGUAGE plpgsql
    AS $$
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
$$;

--
-- Name: get_company_license_status(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_company_license_status(company_uuid text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
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
$$;

--
-- Name: track_license_usage(text, character varying, integer, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.track_license_usage(company_uuid text, feature_name_param character varying, usage_count_param integer DEFAULT 1, metadata_param jsonb DEFAULT '{}'::jsonb) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
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
$$;

--
-- Name: update_license_days_remaining(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_license_days_remaining() RETURNS integer
    LANGUAGE plpgsql
    AS $$
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
$$;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

SET default_tablespace = '';
SET default_table_access_method = heap;

-- =============================================
-- TABLES
-- =============================================

--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    business_type text DEFAULT 'restaurant'::character varying,
    timezone text DEFAULT 'Asia/Amman'::character varying NOT NULL,
    default_currency text DEFAULT 'JOD'::bpchar NOT NULL,
    status public.company_status DEFAULT 'trial'::public.company_status NOT NULL,
    subscription_plan text DEFAULT 'basic'::character varying,
    subscription_expires_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by text,
    updated_by text
);

--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    id text NOT NULL,
    company_id text NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    address text,
    city text,
    country text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    is_default boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    allows_online_orders boolean DEFAULT true NOT NULL,
    allows_delivery boolean DEFAULT true NOT NULL,
    allows_pickup boolean DEFAULT true NOT NULL,
    timezone text DEFAULT 'Asia/Amman'::character varying NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by text,
    updated_by text,
    name_ar text NOT NULL,
    open_time text,
    close_time text
);

--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    company_id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    role public.user_role DEFAULT 'cashier'::public.user_role NOT NULL,
    status public.user_status DEFAULT 'active'::public.user_status NOT NULL,
    last_login timestamp(3) without time zone,
    failed_login_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp(3) without time zone,
    password_reset_token text,
    password_reset_expires timestamp(3) without time zone,
    email_verified boolean DEFAULT false NOT NULL,
    email_verification_token text,
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by text,
    updated_by text
);

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id text NOT NULL,
    user_id text NOT NULL,
    company_id text NOT NULL,
    session_token text NOT NULL,
    ip_address text,
    user_agent text,
    is_active boolean DEFAULT true NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    last_activity timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: user_activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_activity_logs (
    id text NOT NULL,
    user_id text NOT NULL,
    company_id text NOT NULL,
    action text NOT NULL,
    description text,
    ip_address text,
    user_agent text,
    success boolean DEFAULT true NOT NULL,
    metadata jsonb,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: licenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.licenses (
    id text NOT NULL,
    company_id text NOT NULL,
    status public.license_status DEFAULT 'active'::public.license_status NOT NULL,
    start_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    days_remaining integer DEFAULT 30 NOT NULL,
    last_checked timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type character varying(50) DEFAULT 'trial'::character varying NOT NULL,
    max_users integer DEFAULT 5 NOT NULL,
    max_branches integer DEFAULT 1 NOT NULL,
    max_orders_per_day integer DEFAULT 50 NOT NULL,
    features jsonb DEFAULT '["basic"]'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);

--
-- Name: license_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.license_notifications (
    id integer NOT NULL,
    company_id text NOT NULL,
    license_id text NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    severity character varying(20) DEFAULT 'info'::character varying NOT NULL,
    metadata jsonb,
    read_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id text,
    acknowledged_at timestamp(6) without time zone
);

--
-- Name: license_usage_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.license_usage_logs (
    id integer NOT NULL,
    company_id text NOT NULL,
    license_id text NOT NULL,
    feature_name character varying(100) NOT NULL,
    usage_count integer DEFAULT 1 NOT NULL,
    metadata jsonb,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id text
);

--
-- Name: license_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.license_audit_logs (
    id integer NOT NULL,
    license_id text NOT NULL,
    action character varying(50) NOT NULL,
    old_data jsonb,
    new_data jsonb,
    user_id text,
    "timestamp" timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: global_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.global_locations (
    id text NOT NULL,
    country_name text NOT NULL,
    country_name_ar text NOT NULL,
    governorate text,
    city_name text NOT NULL,
    city_name_ar text NOT NULL,
    area_name text NOT NULL,
    area_name_ar text NOT NULL,
    sub_area_name text,
    sub_area_name_ar text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    search_text text,
    is_active boolean DEFAULT true NOT NULL,
    delivery_difficulty integer DEFAULT 2 NOT NULL,
    average_delivery_fee numeric(8,2) DEFAULT 3.00 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);

--
-- Name: jordan_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jordan_locations (
    id text NOT NULL,
    governorate text NOT NULL,
    city text NOT NULL,
    district text,
    area_name_en text NOT NULL,
    area_name_ar text NOT NULL,
    postal_code text,
    delivery_difficulty integer DEFAULT 2 NOT NULL,
    average_delivery_fee numeric(8,2) DEFAULT 3.00 NOT NULL,
    lat numeric(10,8),
    lng numeric(11,8),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);

--
-- Name: delivery_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_zones (
    id text NOT NULL,
    branch_id text NOT NULL,
    "zoneName" jsonb NOT NULL,
    zone_name_slug text,
    delivery_fee numeric(8,2),
    priority_level integer DEFAULT 2 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    polygon jsonb,
    center_lat numeric(10,8),
    center_lng numeric(11,8),
    radius numeric(8,2),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by text,
    updated_by text,
    global_location_id text,
    average_delivery_time_mins integer
);

--
-- Name: menu_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_categories (
    id text NOT NULL,
    company_id text NOT NULL,
    branch_id text NOT NULL,
    name jsonb NOT NULL,
    description jsonb,
    image_url text,
    icon text,
    color text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    parent_category_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by text,
    updated_by text
);

--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_items (
    id text NOT NULL,
    company_id text NOT NULL,
    category_id text NOT NULL,
    name jsonb NOT NULL,
    description jsonb,
    base_price numeric(8,2) NOT NULL,
    cost_price numeric(8,2),
    is_available boolean DEFAULT true NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    preparation_time_auto boolean DEFAULT true NOT NULL,
    preparation_time_minutes integer,
    priority integer DEFAULT 1 NOT NULL,
    tags text[] DEFAULT ARRAY[]::text[],
    allergens text[] DEFAULT ARRAY[]::text[],
    nutritional_info jsonb,
    channel_pricing jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by text,
    updated_by text,
    platform_pricing jsonb DEFAULT '{}'::jsonb
);

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id text NOT NULL,
    menu_item_id text NOT NULL,
    original_url text,
    optimized_url text,
    thumbnail_url text,
    webp_url text,
    file_size bigint,
    width integer,
    height integer,
    original_format text,
    is_primary boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    alt_text text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);

-- =============================================
-- SEQUENCES
-- =============================================

CREATE SEQUENCE public.license_audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.license_audit_logs_id_seq OWNED BY public.license_audit_logs.id;

CREATE SEQUENCE public.license_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.license_notifications_id_seq OWNED BY public.license_notifications.id;

CREATE SEQUENCE public.license_usage_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.license_usage_logs_id_seq OWNED BY public.license_usage_logs.id;

-- =============================================
-- DEFAULT VALUES
-- =============================================

ALTER TABLE ONLY public.license_audit_logs ALTER COLUMN id SET DEFAULT nextval('public.license_audit_logs_id_seq'::regclass);
ALTER TABLE ONLY public.license_notifications ALTER COLUMN id SET DEFAULT nextval('public.license_notifications_id_seq'::regclass);
ALTER TABLE ONLY public.license_usage_logs ALTER COLUMN id SET DEFAULT nextval('public.license_usage_logs_id_seq'::regclass);

-- =============================================
-- CONSTRAINTS
-- =============================================

ALTER TABLE ONLY public.companies ADD CONSTRAINT companies_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.companies ADD CONSTRAINT companies_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.branches ADD CONSTRAINT branches_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY public.user_sessions ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_sessions ADD CONSTRAINT user_sessions_session_token_key UNIQUE (session_token);

ALTER TABLE ONLY public.user_activity_logs ADD CONSTRAINT user_activity_logs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.licenses ADD CONSTRAINT licenses_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.license_notifications ADD CONSTRAINT license_notifications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.license_usage_logs ADD CONSTRAINT license_usage_logs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.license_audit_logs ADD CONSTRAINT license_audit_logs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.global_locations ADD CONSTRAINT global_locations_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.jordan_locations ADD CONSTRAINT jordan_locations_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.delivery_zones ADD CONSTRAINT delivery_zones_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.menu_categories ADD CONSTRAINT menu_categories_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.menu_items ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.product_images ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_companies_status ON public.companies USING btree (status);
CREATE INDEX idx_branches_company_active ON public.branches USING btree (company_id, is_active);
CREATE INDEX idx_users_company_id ON public.users USING btree (company_id);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_user_sessions_user_active ON public.user_sessions USING btree (user_id, is_active);
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs USING btree (user_id);
CREATE INDEX idx_licenses_company_id ON public.licenses USING btree (company_id);
CREATE INDEX idx_licenses_status ON public.licenses USING btree (status);
CREATE INDEX idx_licenses_expires_at ON public.licenses USING btree (expires_at);
CREATE INDEX idx_license_notifications_company_id ON public.license_notifications USING btree (company_id);
CREATE INDEX idx_license_notifications_license_id ON public.license_notifications USING btree (license_id);
CREATE INDEX idx_license_usage_logs_company_id ON public.license_usage_logs USING btree (company_id);
CREATE INDEX idx_license_audit_logs_company_id ON public.license_audit_logs USING btree (company_id);
CREATE INDEX global_locations_search_text_idx ON public.global_locations USING gin (search_text public.gin_trgm_ops);
CREATE INDEX jordan_locations_governorate_idx ON public.jordan_locations USING btree (governorate);
CREATE INDEX delivery_zones_branch_id_idx ON public.delivery_zones USING btree (branch_id);
CREATE INDEX idx_menu_categories_company_branch ON public.menu_categories USING btree (company_id, branch_id);
CREATE INDEX idx_menu_items_company ON public.menu_items USING btree (company_id);
CREATE INDEX idx_menu_items_category ON public.menu_items USING btree (category_id);
CREATE INDEX idx_product_images_menu_item ON public.product_images USING btree (menu_item_id);

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER tr_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_user_sessions_updated_at BEFORE UPDATE ON public.user_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_licenses_updated_at BEFORE UPDATE ON public.licenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_global_locations_updated_at BEFORE UPDATE ON public.global_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_jordan_locations_updated_at BEFORE UPDATE ON public.jordan_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_delivery_zones_updated_at BEFORE UPDATE ON public.delivery_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_menu_categories_updated_at BEFORE UPDATE ON public.menu_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_product_images_updated_at BEFORE UPDATE ON public.product_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FOREIGN KEYS
-- =============================================

ALTER TABLE ONLY public.branches ADD CONSTRAINT branches_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.users ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.user_sessions ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.user_sessions ADD CONSTRAINT user_sessions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.user_activity_logs ADD CONSTRAINT user_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.user_activity_logs ADD CONSTRAINT user_activity_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.licenses ADD CONSTRAINT licenses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.delivery_zones ADD CONSTRAINT delivery_zones_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.delivery_zones ADD CONSTRAINT delivery_zones_global_location_id_fkey FOREIGN KEY (global_location_id) REFERENCES public.global_locations(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public.menu_categories ADD CONSTRAINT menu_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.menu_categories ADD CONSTRAINT menu_categories_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.menu_categories ADD CONSTRAINT menu_categories_parent_category_id_fkey FOREIGN KEY (parent_category_id) REFERENCES public.menu_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public.menu_items ADD CONSTRAINT menu_items_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.menu_items ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.menu_categories(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.product_images ADD CONSTRAINT product_images_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- PostgreSQL database dump complete
--