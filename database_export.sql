--
-- PostgreSQL database dump
--

\restrict BSafA7c2zjgvwijGOJxuEE5LgDhSb5UWtaPkjvDTc7lAW6AsmJS3vythukWBuwQ

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

DROP DATABASE IF EXISTS postgres;
--
-- Name: postgres; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF-8';


ALTER DATABASE postgres OWNER TO postgres;

\unrestrict BSafA7c2zjgvwijGOJxuEE5LgDhSb5UWtaPkjvDTc7lAW6AsmJS3vythukWBuwQ
\connect postgres
\restrict BSafA7c2zjgvwijGOJxuEE5LgDhSb5UWtaPkjvDTc7lAW6AsmJS3vythukWBuwQ

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
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: company_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.company_status AS ENUM (
    'active',
    'inactive',
    'suspended',
    'trial'
);


ALTER TYPE public.company_status OWNER TO postgres;

--
-- Name: license_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.license_status AS ENUM (
    'active',
    'expired',
    'suspended',
    'cancelled'
);


ALTER TYPE public.license_status OWNER TO postgres;

--
-- Name: modifier_selection_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.modifier_selection_type AS ENUM (
    'single',
    'multiple',
    'counter'
);


ALTER TYPE public.modifier_selection_type OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'super_admin',
    'company_owner',
    'branch_manager',
    'cashier',
    'call_center'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: user_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_status AS ENUM (
    'active',
    'inactive',
    'suspended',
    'pending'
);


ALTER TYPE public.user_status OWNER TO postgres;

--
-- Name: check_expired_licenses(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.check_expired_licenses() OWNER TO postgres;

--
-- Name: create_license_expiry_warnings(integer); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.create_license_expiry_warnings(warning_days integer) OWNER TO postgres;

--
-- Name: generate_license_notifications(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_license_notifications() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Insert notifications for licenses expiring in 30, 14, 7, and 1 days
  INSERT INTO license_notifications (
    company_id, license_id, type, title, message, severity, metadata
  )
  SELECT 
    l.company_id,
    l.id,
    CASE 
      WHEN l.days_remaining <= 1 THEN 'license_expiring_critical'
      WHEN l.days_remaining <= 7 THEN 'license_expiring_urgent'
      WHEN l.days_remaining <= 14 THEN 'license_expiring_warning'
      WHEN l.days_remaining <= 30 THEN 'license_expiring_notice'
    END,
    CASE 
      WHEN l.days_remaining <= 1 THEN 'License Expires Tomorrow\!'
      WHEN l.days_remaining <= 7 THEN 'License Expires Soon'
      WHEN l.days_remaining <= 14 THEN 'License Renewal Reminder'
      WHEN l.days_remaining <= 30 THEN 'License Renewal Notice'
    END,
    CASE 
      WHEN l.days_remaining <= 1 THEN 'Your license expires in ' || l.days_remaining || ' day. Renew immediately to avoid service interruption.'
      WHEN l.days_remaining <= 7 THEN 'Your license expires in ' || l.days_remaining || ' days. Please renew soon to avoid service interruption.'
      WHEN l.days_remaining <= 14 THEN 'Your license expires in ' || l.days_remaining || ' days. Consider renewing to ensure uninterrupted service.'
      WHEN l.days_remaining <= 30 THEN 'Your license expires in ' || l.days_remaining || ' days. Plan your renewal to maintain access to all features.'
    END,
    CASE 
      WHEN l.days_remaining <= 1 THEN 'critical'
      WHEN l.days_remaining <= 7 THEN 'critical'
      WHEN l.days_remaining <= 14 THEN 'warning'
      WHEN l.days_remaining <= 30 THEN 'info'
    END::text,
    jsonb_build_object(
      'license_type', l.type,
      'days_remaining', l.days_remaining,
      'expires_at', l.expires_at,
      'renewal_url', '/subscription'
    )
  FROM licenses l
  WHERE l.status = 'active' 
    AND l.days_remaining <= 30 
    AND l.days_remaining > 0
    AND NOT EXISTS (
      SELECT 1 FROM license_notifications n 
      WHERE n.license_id = l.id 
        AND n.type = CASE 
          WHEN l.days_remaining <= 1 THEN 'license_expiring_critical'
          WHEN l.days_remaining <= 7 THEN 'license_expiring_urgent'
          WHEN l.days_remaining <= 14 THEN 'license_expiring_warning'
          WHEN l.days_remaining <= 30 THEN 'license_expiring_notice'
        END
        AND n.created_at::date = CURRENT_DATE
    );
END;
$$;


ALTER FUNCTION public.generate_license_notifications() OWNER TO postgres;

--
-- Name: get_company_license_status(text); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.get_company_license_status(company_uuid text) OWNER TO postgres;

--
-- Name: get_company_license_status(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_company_license_status(company_uuid uuid) RETURNS jsonb
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


ALTER FUNCTION public.get_company_license_status(company_uuid uuid) OWNER TO postgres;

--
-- Name: track_license_usage(text, character varying, integer, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.track_license_usage(company_uuid text, feature_name_param character varying, usage_count_param integer, metadata_param jsonb) OWNER TO postgres;

--
-- Name: track_license_usage(uuid, character varying, integer, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.track_license_usage(company_uuid uuid, feature_name_param character varying, usage_count_param integer DEFAULT 1, metadata_param jsonb DEFAULT '{}'::jsonb) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    license_uuid uuid;
    current_usage integer;
    max_allowed integer;
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


ALTER FUNCTION public.track_license_usage(company_uuid uuid, feature_name_param character varying, usage_count_param integer, metadata_param jsonb) OWNER TO postgres;

--
-- Name: trigger_license_audit_log(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_license_audit_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO license_audit_logs (license_id, action, new_data, timestamp)
    VALUES (NEW.id, 'INSERT', to_jsonb(NEW), NOW());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO license_audit_logs (license_id, action, old_data, new_data, timestamp)
    VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), NOW());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION public.trigger_license_audit_log() OWNER TO postgres;

--
-- Name: update_license_days_remaining(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.update_license_days_remaining() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: license_audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.license_audit_logs (
    id integer NOT NULL,
    license_id text NOT NULL,
    action character varying(50) NOT NULL,
    old_data jsonb,
    new_data jsonb,
    user_id text,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.license_audit_logs OWNER TO postgres;

--
-- Name: license_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.license_audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.license_audit_logs_id_seq OWNER TO postgres;

--
-- Name: license_audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.license_audit_logs_id_seq OWNED BY public.license_audit_logs.id;


--
-- Name: license_invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.license_invoices (
    id integer NOT NULL,
    license_id text NOT NULL,
    invoice_number character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'JOD'::character varying,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    due_date timestamp without time zone,
    paid_at timestamp without time zone,
    payment_method character varying(50),
    company_id text,
    duration_days integer,
    issued_at timestamp without time zone DEFAULT now(),
    due_at timestamp without time zone,
    metadata jsonb,
    created_by text
);


ALTER TABLE public.license_invoices OWNER TO postgres;

--
-- Name: license_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.license_invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.license_invoices_id_seq OWNER TO postgres;

--
-- Name: license_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.license_invoices_id_seq OWNED BY public.license_invoices.id;


--
-- Name: licenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.licenses (
    id text NOT NULL,
    company_id text NOT NULL,
    status public.license_status DEFAULT 'active'::public.license_status NOT NULL,
    start_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    features jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    days_remaining integer DEFAULT 0 NOT NULL,
    last_checked timestamp(3) without time zone,
    renewed_at timestamp(3) without time zone,
    total_days integer DEFAULT 30 NOT NULL
);


ALTER TABLE public.licenses OWNER TO postgres;

--
-- Name: menu_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_categories (
    id text NOT NULL,
    company_id text NOT NULL,
    name jsonb NOT NULL,
    description jsonb,
    image text,
    display_number integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by text,
    updated_by text
);


ALTER TABLE public.menu_categories OWNER TO postgres;

--
-- Name: menu_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_products (
    id text NOT NULL,
    company_id text NOT NULL,
    category_id text,
    name jsonb NOT NULL,
    description jsonb,
    image text,
    slug text,
    base_price numeric(10,2) NOT NULL,
    pricing jsonb DEFAULT '{}'::jsonb NOT NULL,
    cost numeric(10,2) DEFAULT 0 NOT NULL,
    status integer DEFAULT 1 NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    preparation_time integer DEFAULT 15 NOT NULL,
    pricing_method integer DEFAULT 1 NOT NULL,
    selling_method integer DEFAULT 1 NOT NULL,
    tags text[] DEFAULT ARRAY[]::text[],
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by text,
    updated_by text,
    images text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public.menu_products OWNER TO postgres;

--
-- Name: modifier_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modifier_categories (
    id text NOT NULL,
    company_id text NOT NULL,
    name jsonb NOT NULL,
    description jsonb,
    display_number integer DEFAULT 0 NOT NULL,
    image text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    is_required boolean DEFAULT false NOT NULL,
    max_selections integer DEFAULT 1 NOT NULL,
    min_selections integer DEFAULT 0 NOT NULL,
    selection_type public.modifier_selection_type DEFAULT 'single'::public.modifier_selection_type NOT NULL
);


ALTER TABLE public.modifier_categories OWNER TO postgres;

--
-- Name: modifiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modifiers (
    id text NOT NULL,
    modifier_category_id text NOT NULL,
    company_id text NOT NULL,
    name jsonb NOT NULL,
    description jsonb,
    base_price numeric(10,2) NOT NULL,
    pricing jsonb DEFAULT '{}'::jsonb NOT NULL,
    cost numeric(10,2) DEFAULT 0 NOT NULL,
    status integer DEFAULT 1 NOT NULL,
    display_number integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    image text,
    is_default boolean DEFAULT false NOT NULL
);


ALTER TABLE public.modifiers OWNER TO postgres;

--
-- Name: price_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_history (
    id text NOT NULL,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    promotion_id text,
    old_price numeric(10,2),
    new_price numeric(10,2),
    change_reason text,
    platform text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by text
);


ALTER TABLE public.price_history OWNER TO postgres;

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id text NOT NULL,
    product_id text,
    filename text NOT NULL,
    original_name text NOT NULL,
    url text NOT NULL,
    size integer NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    mime_type text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- Name: product_modifier_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_modifier_categories (
    id text NOT NULL,
    product_id text NOT NULL,
    modifier_category_id text NOT NULL,
    min_quantity integer DEFAULT 0 NOT NULL,
    max_quantity integer DEFAULT 1 NOT NULL,
    price_override numeric(10,2),
    is_required boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_modifier_categories OWNER TO postgres;

--
-- Name: promotion_modifier_markups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_modifier_markups (
    id text NOT NULL,
    promotion_id text NOT NULL,
    product_id text NOT NULL,
    modifier_id text NOT NULL,
    markup_percentage numeric(5,2) NOT NULL,
    original_price numeric(10,2) NOT NULL,
    marked_up_price numeric(10,2) NOT NULL,
    profit_margin numeric(5,2),
    business_reason text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.promotion_modifier_markups OWNER TO postgres;

--
-- Name: promotion_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_products (
    id text NOT NULL,
    promotion_id text NOT NULL,
    product_id text NOT NULL,
    base_discount_type text DEFAULT 'percentage'::text NOT NULL,
    base_discount_value numeric(10,2) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.promotion_products OWNER TO postgres;

--
-- Name: promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotions (
    id text NOT NULL,
    company_id text NOT NULL,
    name text NOT NULL,
    description text,
    promotion_type text DEFAULT 'selective_product'::text NOT NULL,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    auto_revert boolean DEFAULT true NOT NULL,
    platforms jsonb DEFAULT '["all"]'::jsonb NOT NULL,
    min_profit_margin numeric(5,2) DEFAULT 15.00 NOT NULL,
    original_pricing_snapshot jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text
);


ALTER TABLE public.promotions OWNER TO postgres;

--
-- Name: user_activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_activity_logs (
    id text NOT NULL,
    user_id text NOT NULL,
    action text NOT NULL,
    resource_type text,
    resource_id text,
    description text,
    ip_address text,
    user_agent text,
    success boolean DEFAULT true NOT NULL,
    error_message text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_activity_logs OWNER TO postgres;

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    id text NOT NULL,
    user_id text NOT NULL,
    token_hash text NOT NULL,
    refresh_token_hash text,
    expires_at timestamp(3) without time zone NOT NULL,
    refresh_expires_at timestamp(3) without time zone,
    ip_address text,
    user_agent text,
    device_type text,
    is_active boolean DEFAULT true NOT NULL,
    revoked_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_used_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    avatar_url text,
    password_hash text NOT NULL,
    pin text,
    email_verified_at timestamp(3) without time zone,
    role public.user_role NOT NULL,
    status public.user_status DEFAULT 'active'::public.user_status NOT NULL,
    company_id text NOT NULL,
    branch_id text,
    language text DEFAULT 'en'::bpchar NOT NULL,
    timezone text DEFAULT 'Asia/Amman'::character varying NOT NULL,
    last_login_at timestamp(3) without time zone,
    last_login_ip text,
    failed_login_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp(3) without time zone,
    must_change_password boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by text,
    updated_by text,
    first_name text,
    last_name text,
    username text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: license_audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_audit_logs ALTER COLUMN id SET DEFAULT nextval('public.license_audit_logs_id_seq'::regclass);


--
-- Name: license_invoices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_invoices ALTER COLUMN id SET DEFAULT nextval('public.license_invoices_id_seq'::regclass);


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, company_id, name, phone, email, address, city, country, latitude, longitude, is_default, is_active, allows_online_orders, allows_delivery, allows_pickup, timezone, created_at, updated_at, deleted_at, created_by, updated_by, name_ar, open_time, close_time) FROM stdin;
40f863e7-b719-4142-8e94-724572002d9b	dc3c6a10-96c6-4467-9778-313af66956af	Main Office	\N	\N	\N	\N	\N	\N	\N	t	t	t	t	t	Asia/Amman	2025-08-27 09:04:10.179	2025-08-27 09:04:10.179	\N	\N	\N	Main Office	\N	\N
b558e6c0-0866-4acd-9693-7c0a502e9df7	dc3c6a10-96c6-4467-9778-313af66956af	test	+962666666666	\N	wqejnwkp39	amma	Jordan	31.93055735	36.00758411	f	t	f	t	t	Asia/Amman	2025-08-28 21:15:30.596	2025-08-29 08:29:36.491	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	1ec02dec-9a81-473a-9cdf-31454e2e959a	test	22:00	22:09
f97ceb38-c797-4d1c-9ff4-89d9f8da5235	82b4039a-f9f3-4648-b3e1-23397d83af61	Company B Main Branch	\N	\N	\N	\N	\N	\N	\N	f	t	t	t	t	Asia/Amman	2025-08-29 08:32:37.531	2025-08-29 08:32:37.531	\N	\N	\N	الفرع الرئيسي ب	\N	\N
f3d4114a-0e39-43fd-aa98-01b57df7efd0	82b4039a-f9f3-4648-b3e1-23397d83af61	Company B Secondary	\N	\N	\N	\N	\N	\N	\N	f	t	t	t	t	Asia/Amman	2025-08-29 08:32:37.531	2025-08-29 08:32:37.531	\N	\N	\N	الفرع الثانوي ب	\N	\N
eb4d5daa-c58c-4369-a454-047db8ac3f50	dc3c6a10-96c6-4467-9778-313af66956af	Default Restaurant	+962444444441	\N	21313	amma	Jordan	31.94333322	35.91626025	f	t	t	t	t	Asia/Amman	2025-08-29 19:48:09.722	2025-08-29 19:48:09.722	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	الفرع الرئيسي	19:49	23:48
c91db38e-ef89-44c6-8f7d-57de5e91d903	dc3c6a10-96c6-4467-9778-313af66956af	ss	+962444444444	\N	wqejnwkp39	amma	Jordan	32.01672005	35.85926868	f	t	t	t	t	Asia/Amman	2025-08-30 18:24:57.476	2025-08-30 18:24:57.476	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	ss	20:24	12:24
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, name, slug, logo, business_type, timezone, default_currency, status, subscription_plan, subscription_expires_at, created_at, updated_at, deleted_at, created_by, updated_by) FROM stdin;
a13343e5-3109-4dc7-8f75-77982f0cfc7a	Main Officewqdascdscwsdcsc	main-officewqdascdscwsdcsc	\N	restaurant	Asia/Amman	JOD	trial	basic	\N	2025-08-30 18:41:53.167	2025-08-30 18:41:56.151	2025-08-30 18:41:56.151	\N	\N
bef6f0cf-40b3-491e-915c-40e4b0d9fed7	edsa	edsa	\N	restaurant	Asia/Amman	JOD	active	basic	\N	2025-08-30 18:50:18.368	2025-08-30 19:50:14.738	\N	\N	\N
82b4039a-f9f3-4648-b3e1-23397d83af61	Test Company B	test-company-b	\N	restaurant	Asia/Amman	JOD	active	basic	\N	2025-08-29 08:32:09.73	2025-08-29 19:06:57.417	2025-08-29 19:06:57.417	\N	\N
ee1b200f-bd2b-4d23-a3ff-1ce80ef90a0a	Main Office	main-office	\N	restaurant	Asia/Amman	JOD	trial	basic	\N	2025-08-29 19:07:13.194	2025-08-29 19:07:20.805	2025-08-29 19:07:20.805	\N	\N
5b7c4bdc-5649-49bd-9f6e-3a87a583d750	Main Office	2s	\N	restaurant	Asia/Amman	JOD	active	basic	\N	2025-08-29 19:25:04.682	2025-08-30 19:50:20.221	2025-08-30 19:50:20.221	\N	\N
dc3c6a10-96c6-4467-9778-313af66956af	Default Restaurant	default-restaurant	\N	restaurant	Asia/Amman	JOD	trial	basic	\N	2025-08-28 13:41:43.688	2025-08-29 19:12:22.896	\N	\N	\N
c382fdd5-1a60-4481-ad5f-65b575729b2c	Main Office	main-office1	\N	restaurant	Asia/Amman	JOD	active	basic	\N	2025-08-29 19:08:57.1	2025-08-29 19:24:07.381	\N	\N	\N
b4830b4e-be20-4bba-8b3e-a0f0d2213749	112	112	\N	restaurant	Asia/Amman	JOD	trial	basic	\N	2025-08-30 18:41:30.02	2025-08-30 18:41:34.449	2025-08-30 18:41:34.449	\N	\N
\.


--
-- Data for Name: license_audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.license_audit_logs (id, license_id, action, old_data, new_data, user_id, "timestamp") FROM stdin;
1	a91c9849-509f-4213-aef4-907bd1b2d050	UPDATE	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2025-09-29T18:50:18.37", "renewed_at": null, "start_date": "2025-08-30T18:50:18.37", "total_days": 30, "updated_at": "2025-08-30T18:50:18.372", "updated_by": null, "last_checked": "2025-08-30T18:50:18.37", "days_remaining": 30}	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2025-10-29T18:50:18.37", "renewed_at": "2025-08-30T19:16:46.267", "start_date": "2025-08-30T18:50:18.37", "total_days": 60, "updated_at": "2025-08-30T19:16:46.269", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:16:46.267", "days_remaining": 60}	\N	2025-08-30 19:16:46.269025
2	a91c9849-509f-4213-aef4-907bd1b2d050	UPDATE	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2025-10-29T18:50:18.37", "renewed_at": "2025-08-30T19:16:46.267", "start_date": "2025-08-30T18:50:18.37", "total_days": 60, "updated_at": "2025-08-30T19:16:46.269", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:16:46.267", "days_remaining": 60}	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2025-11-28T18:50:18.37", "renewed_at": "2025-08-30T19:16:56.078", "start_date": "2025-08-30T18:50:18.37", "total_days": 90, "updated_at": "2025-08-30T19:16:56.08", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:16:56.078", "days_remaining": 90}	\N	2025-08-30 19:16:56.080285
3	38da34d2-3e21-4e14-a8c5-6b39c4cdde31	UPDATE	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2025-09-28T19:08:57.106", "renewed_at": null, "start_date": "2025-08-29T19:08:57.106", "total_days": 30, "updated_at": "2025-08-29T19:24:07.397", "updated_by": null, "last_checked": "2025-08-29T19:08:57.106", "days_remaining": 30}	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2025-10-28T19:08:57.106", "renewed_at": "2025-08-30T19:17:02.924", "start_date": "2025-08-29T19:08:57.106", "total_days": 60, "updated_at": "2025-08-30T19:17:02.926", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:17:02.924", "days_remaining": 59}	\N	2025-08-30 19:17:02.926598
4	38da34d2-3e21-4e14-a8c5-6b39c4cdde31	UPDATE	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2025-10-28T19:08:57.106", "renewed_at": "2025-08-30T19:17:02.924", "start_date": "2025-08-29T19:08:57.106", "total_days": 60, "updated_at": "2025-08-30T19:17:02.926", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:17:02.924", "days_remaining": 59}	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2025-11-27T19:08:57.106", "renewed_at": "2025-08-30T19:17:19.636", "start_date": "2025-08-29T19:08:57.106", "total_days": 90, "updated_at": "2025-08-30T19:17:19.638", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:17:19.636", "days_remaining": 89}	\N	2025-08-30 19:17:19.638004
5	38da34d2-3e21-4e14-a8c5-6b39c4cdde31	UPDATE	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2025-11-27T19:08:57.106", "renewed_at": "2025-08-30T19:17:19.636", "start_date": "2025-08-29T19:08:57.106", "total_days": 90, "updated_at": "2025-08-30T19:17:19.638", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:17:19.636", "days_remaining": 89}	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2025-12-27T19:08:57.106", "renewed_at": "2025-08-30T19:18:06.118", "start_date": "2025-08-29T19:08:57.106", "total_days": 120, "updated_at": "2025-08-30T19:18:06.121", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:18:06.118", "days_remaining": 119}	\N	2025-08-30 19:18:06.121098
6	38da34d2-3e21-4e14-a8c5-6b39c4cdde31	UPDATE	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2025-12-27T19:08:57.106", "renewed_at": "2025-08-30T19:18:06.118", "start_date": "2025-08-29T19:08:57.106", "total_days": 120, "updated_at": "2025-08-30T19:18:06.121", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:18:06.118", "days_remaining": 119}	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-01-26T19:08:57.106", "renewed_at": "2025-08-30T19:18:06.775", "start_date": "2025-08-29T19:08:57.106", "total_days": 150, "updated_at": "2025-08-30T19:18:06.777", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:18:06.775", "days_remaining": 149}	\N	2025-08-30 19:18:06.77834
7	38da34d2-3e21-4e14-a8c5-6b39c4cdde31	UPDATE	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-01-26T19:08:57.106", "renewed_at": "2025-08-30T19:18:06.775", "start_date": "2025-08-29T19:08:57.106", "total_days": 150, "updated_at": "2025-08-30T19:18:06.777", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:18:06.775", "days_remaining": 149}	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-02-25T19:08:57.106", "renewed_at": "2025-08-30T19:23:40.998", "start_date": "2025-08-29T19:08:57.106", "total_days": 180, "updated_at": "2025-08-30T19:23:41", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:23:40.998", "days_remaining": 179}	\N	2025-08-30 19:23:41.000509
8	4452ed54-28a6-446e-9281-651e6b5b0ec2	UPDATE	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2025-11-07T13:54:01.426", "renewed_at": "2025-08-29T19:05:53.298", "start_date": "2025-08-09T13:54:01.426", "total_days": 90, "updated_at": "2025-08-29T19:12:22.91", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-29T19:05:53.298", "days_remaining": 70}	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2025-12-07T13:54:01.426", "renewed_at": "2025-08-30T19:23:50.52", "start_date": "2025-08-09T13:54:01.426", "total_days": 120, "updated_at": "2025-08-30T19:23:50.521", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:23:50.52", "days_remaining": 99}	\N	2025-08-30 19:23:50.52172
9	4452ed54-28a6-446e-9281-651e6b5b0ec2	UPDATE	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2025-12-07T13:54:01.426", "renewed_at": "2025-08-30T19:23:50.52", "start_date": "2025-08-09T13:54:01.426", "total_days": 120, "updated_at": "2025-08-30T19:23:50.521", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:23:50.52", "days_remaining": 99}	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-01-06T13:54:01.426", "renewed_at": "2025-08-30T19:24:33.104", "start_date": "2025-08-09T13:54:01.426", "total_days": 150, "updated_at": "2025-08-30T19:24:33.105", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:24:33.104", "days_remaining": 129}	\N	2025-08-30 19:24:33.105964
10	a91c9849-509f-4213-aef4-907bd1b2d050	UPDATE	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2025-11-28T18:50:18.37", "renewed_at": "2025-08-30T19:16:56.078", "start_date": "2025-08-30T18:50:18.37", "total_days": 90, "updated_at": "2025-08-30T19:16:56.08", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:16:56.078", "days_remaining": 90}	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2025-12-28T18:50:18.37", "renewed_at": "2025-08-30T19:46:30.526", "start_date": "2025-08-30T18:50:18.37", "total_days": 120, "updated_at": "2025-08-30T19:46:30.528", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:46:30.526", "days_remaining": 120}	\N	2025-08-30 19:46:30.528699
11	a91c9849-509f-4213-aef4-907bd1b2d050	UPDATE	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2025-12-28T18:50:18.37", "renewed_at": "2025-08-30T19:46:30.526", "start_date": "2025-08-30T18:50:18.37", "total_days": 120, "updated_at": "2025-08-30T19:46:30.528", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:46:30.526", "days_remaining": 120}	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2026-12-28T18:50:18.37", "renewed_at": "2025-08-30T19:50:10.093", "start_date": "2025-08-30T18:50:18.37", "total_days": 485, "updated_at": "2025-08-30T19:50:10.095", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:50:10.093", "days_remaining": 485}	\N	2025-08-30 19:50:10.095596
12	a91c9849-509f-4213-aef4-907bd1b2d050	UPDATE	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2026-12-28T18:50:18.37", "renewed_at": "2025-08-30T19:50:10.093", "start_date": "2025-08-30T18:50:18.37", "total_days": 485, "updated_at": "2025-08-30T19:50:10.095", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:50:10.093", "days_remaining": 485}	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["analytics", "multi_location"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2026-12-28T18:50:18.37", "renewed_at": "2025-08-30T19:50:10.093", "start_date": "2025-08-30T18:50:18.37", "total_days": 485, "updated_at": "2025-08-30T19:50:14.747", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:50:10.093", "days_remaining": 485}	\N	2025-08-30 19:50:14.736312
13	a91c9849-509f-4213-aef4-907bd1b2d050	UPDATE	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["analytics", "multi_location"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2026-12-28T18:50:18.37", "renewed_at": "2025-08-30T19:50:10.093", "start_date": "2025-08-30T18:50:18.37", "total_days": 485, "updated_at": "2025-08-30T19:50:14.747", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:50:10.093", "days_remaining": 485}	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["analytics", "multi_location"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2027-01-27T18:50:18.37", "renewed_at": "2025-08-30T21:25:38.802", "start_date": "2025-08-30T18:50:18.37", "total_days": 515, "updated_at": "2025-08-30T21:25:38.805", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T21:25:38.802", "days_remaining": 515}	\N	2025-08-30 21:25:38.805141
14	38da34d2-3e21-4e14-a8c5-6b39c4cdde31	UPDATE	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-02-25T19:08:57.106", "renewed_at": "2025-08-30T19:23:40.998", "start_date": "2025-08-29T19:08:57.106", "total_days": 180, "updated_at": "2025-08-30T19:23:41", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:23:40.998", "days_remaining": 179}	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-03-27T19:08:57.106", "renewed_at": "2025-08-30T21:25:42.664", "start_date": "2025-08-29T19:08:57.106", "total_days": 210, "updated_at": "2025-08-30T21:25:42.666", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T21:25:42.664", "days_remaining": 209}	\N	2025-08-30 21:25:42.666677
15	4452ed54-28a6-446e-9281-651e6b5b0ec2	UPDATE	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-01-06T13:54:01.426", "renewed_at": "2025-08-30T19:24:33.104", "start_date": "2025-08-09T13:54:01.426", "total_days": 150, "updated_at": "2025-08-30T19:24:33.105", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:24:33.104", "days_remaining": 129}	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-02-05T13:54:01.426", "renewed_at": "2025-08-30T21:25:46.155", "start_date": "2025-08-09T13:54:01.426", "total_days": 180, "updated_at": "2025-08-30T21:25:46.163", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T21:25:46.155", "days_remaining": 159}	\N	2025-08-30 21:25:46.164013
\.


--
-- Data for Name: license_invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.license_invoices (id, license_id, invoice_number, amount, currency, status, created_at, due_date, paid_at, payment_method, company_id, duration_days, issued_at, due_at, metadata, created_by) FROM stdin;
1	a91c9849-509f-4213-aef4-907bd1b2d050	INV-202508-0001	99.00	USD	paid	2025-08-30 19:46:30.549101	\N	\N	\N	bef6f0cf-40b3-491e-915c-40e4b0d9fed7	30	2025-08-30 19:46:30.526	2025-09-29 19:46:30.526	{"renewalType": "extension", "newExpiryDate": "2025-12-28T18:50:18.370Z", "originalExpiryDate": "2025-11-28T18:50:18.370Z"}	1ec02dec-9a81-473a-9cdf-31454e2e959a
2	a91c9849-509f-4213-aef4-907bd1b2d050	INV-202508-0002	1204.50	USD	paid	2025-08-30 19:50:10.105866	\N	\N	\N	bef6f0cf-40b3-491e-915c-40e4b0d9fed7	365	2025-08-30 19:50:10.093	2025-09-29 19:50:10.093	{"renewalType": "extension", "newExpiryDate": "2026-12-28T18:50:18.370Z", "originalExpiryDate": "2025-12-28T18:50:18.370Z"}	1ec02dec-9a81-473a-9cdf-31454e2e959a
3	a91c9849-509f-4213-aef4-907bd1b2d050	INV-202508-0003	99.00	USD	paid	2025-08-30 21:25:38.82335	\N	\N	\N	bef6f0cf-40b3-491e-915c-40e4b0d9fed7	30	2025-08-30 21:25:38.802	2025-09-29 21:25:38.802	{"renewalType": "extension", "newExpiryDate": "2027-01-27T18:50:18.370Z", "originalExpiryDate": "2026-12-28T18:50:18.370Z"}	1ec02dec-9a81-473a-9cdf-31454e2e959a
4	38da34d2-3e21-4e14-a8c5-6b39c4cdde31	INV-202508-0004	99.00	USD	paid	2025-08-30 21:25:42.676009	\N	\N	\N	c382fdd5-1a60-4481-ad5f-65b575729b2c	30	2025-08-30 21:25:42.664	2025-09-29 21:25:42.664	{"renewalType": "extension", "newExpiryDate": "2026-03-27T19:08:57.106Z", "originalExpiryDate": "2026-02-25T19:08:57.106Z"}	1ec02dec-9a81-473a-9cdf-31454e2e959a
5	4452ed54-28a6-446e-9281-651e6b5b0ec2	INV-202508-0005	99.00	USD	paid	2025-08-30 21:25:46.176888	\N	\N	\N	dc3c6a10-96c6-4467-9778-313af66956af	30	2025-08-30 21:25:46.155	2025-09-29 21:25:46.155	{"renewalType": "extension", "newExpiryDate": "2026-02-05T13:54:01.426Z", "originalExpiryDate": "2026-01-06T13:54:01.426Z"}	1ec02dec-9a81-473a-9cdf-31454e2e959a
\.


--
-- Data for Name: licenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.licenses (id, company_id, status, start_date, expires_at, features, created_at, updated_at, created_by, updated_by, days_remaining, last_checked, renewed_at, total_days) FROM stdin;
b037f11f-b98e-4dd2-a5e6-b8cc37cf58b7	5b7c4bdc-5649-49bd-9f6e-3a87a583d750	active	2025-08-29 19:25:04.684	2026-12-27 19:25:04.684	["analytics", "multi_location"]	2025-08-29 19:25:04.687	2025-08-29 19:25:23.167	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	485	2025-08-29 19:25:23.164	2025-08-29 19:25:23.164	485
d6a803ce-c7a3-496c-b460-c26fcd8e59be	b4830b4e-be20-4bba-8b3e-a0f0d2213749	active	2025-08-30 18:41:30.02	2025-09-29 18:41:30.02	["basic"]	2025-08-30 18:41:30.022	2025-08-30 18:41:30.022	\N	\N	30	2025-08-30 18:41:30.02	\N	30
eef7b459-8a50-41b9-85f9-824b7c276ea6	a13343e5-3109-4dc7-8f75-77982f0cfc7a	active	2025-08-30 18:41:53.167	2025-09-29 18:41:53.167	["basic"]	2025-08-30 18:41:53.168	2025-08-30 18:41:53.168	\N	\N	30	2025-08-30 18:41:53.167	\N	30
lic_sample_001	dc3c6a10-96c6-4467-9778-313af66956af	active	2024-09-13 17:15:55.124	2026-10-23 17:15:55.124	["pos_integration", "analytics", "multi_branch"]	2024-09-13 17:15:55.124	2025-08-29 18:24:23.817	1ec02dec-9a81-473a-9cdf-31454e2e959a	1ec02dec-9a81-473a-9cdf-31454e2e959a	420	2025-08-29 18:24:23.816	2025-08-29 18:24:23.816	770
adaaf5c8-28f7-402f-843a-029e1e297f45	ee1b200f-bd2b-4d23-a3ff-1ce80ef90a0a	active	2025-08-29 19:07:13.198	2025-09-28 19:07:13.198	["basic"]	2025-08-29 19:07:13.199	2025-08-29 19:07:13.199	\N	\N	30	2025-08-29 19:07:13.198	\N	30
a91c9849-509f-4213-aef4-907bd1b2d050	bef6f0cf-40b3-491e-915c-40e4b0d9fed7	active	2025-08-30 18:50:18.37	2027-01-27 18:50:18.37	["analytics", "multi_location"]	2025-08-30 18:50:18.372	2025-08-30 21:25:38.805	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	515	2025-08-30 21:25:38.802	2025-08-30 21:25:38.802	515
38da34d2-3e21-4e14-a8c5-6b39c4cdde31	c382fdd5-1a60-4481-ad5f-65b575729b2c	active	2025-08-29 19:08:57.106	2026-03-27 19:08:57.106	["analytics", "multi_location"]	2025-08-29 19:08:57.109	2025-08-30 21:25:42.666	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	209	2025-08-30 21:25:42.664	2025-08-30 21:25:42.664	210
4452ed54-28a6-446e-9281-651e6b5b0ec2	dc3c6a10-96c6-4467-9778-313af66956af	active	2025-08-09 13:54:01.426	2026-02-05 13:54:01.426	["analytics", "multi_location"]	2025-08-09 13:54:01.426	2025-08-30 21:25:46.163	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	159	2025-08-30 21:25:46.155	2025-08-30 21:25:46.155	180
\.


--
-- Data for Name: menu_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_categories (id, company_id, name, description, image, display_number, is_active, created_at, updated_at, deleted_at, created_by, updated_by) FROM stdin;
0d819024-b6c2-47ac-aa0f-177f020665cc	dc3c6a10-96c6-4467-9778-313af66956af	{"ar": "المقبلات", "en": "Appetizers"}	{"ar": "مقبلات لذيذة", "en": "Delicious starters"}	\N	1	t	2025-08-30 05:24:22.847	2025-08-30 18:21:41.575	\N	\N	\N
f11f4a8e-1797-40c7-8a97-86e2da02b15d	dc3c6a10-96c6-4467-9778-313af66956af	{"ar": "3", "en": "3"}	\N	\N	4	f	2025-08-30 09:58:39.315	2025-08-30 14:26:39.41	\N	\N	\N
44444444-4444-4444-4444-444444444444	82b4039a-f9f3-4648-b3e1-23397d83af61	{"ar": "حلويات", "en": "Desserts"}	{"ar": "حلويات لذيذة", "en": "Sweet desserts"}	\N	4	f	2025-08-29 23:21:26.675	2025-08-30 12:08:39.254	\N	\N	\N
33333333-3333-3333-3333-333333333333	82b4039a-f9f3-4648-b3e1-23397d83af61	{"ar": "مشروبات", "en": "Beverages"}	{"ar": "مشروبات باردة وساخنة", "en": "Cold and hot drinks"}	\N	3	f	2025-08-29 23:21:26.675	2025-08-30 12:08:40.136	\N	\N	\N
22222222-2222-2222-2222-222222222222	82b4039a-f9f3-4648-b3e1-23397d83af61	{"ar": "بيتزا", "en": "Pizza"}	{"ar": "بيتزا طازجة", "en": "Fresh pizza"}	\N	2	f	2025-08-29 23:21:26.675	2025-08-30 12:08:40.844	\N	\N	\N
11111111-1111-1111-1111-111111111111	82b4039a-f9f3-4648-b3e1-23397d83af61	{"ar": "برجر", "en": "Burgers"}	{"ar": "برجر لذيذ", "en": "Delicious burgers"}	\N	1	f	2025-08-29 23:21:26.675	2025-08-30 12:08:41.358	\N	\N	\N
c6baef0a-278d-4eef-881e-48ab68911dfe	dc3c6a10-96c6-4467-9778-313af66956af	{"ar": "الأطباق الرئيسية", "en": "Main Dishes"}	{"ar": "أطباقنا الرئيسية المميزة", "en": "Our signature main courses"}	\N	2	f	2025-08-30 05:24:22.847	2025-08-30 14:26:43.489	\N	\N	\N
\.


--
-- Data for Name: menu_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_products (id, company_id, category_id, name, description, image, slug, base_price, pricing, cost, status, priority, preparation_time, pricing_method, selling_method, tags, created_at, updated_at, deleted_at, created_by, updated_by, images) FROM stdin;
dddddddd-dddd-dddd-dddd-dddddddddddd	82b4039a-f9f3-4648-b3e1-23397d83af61	22222222-2222-2222-2222-222222222222	{"ar": "بيبروني سوبريم", "en": "Pepperoni Supreme"}	{"ar": "بيبروني، فطر، فلفل حلو", "en": "Pepperoni, mushrooms, bell peppers"}	\N	\N	21.99	{"talabat": 22.99, "website": 21.99, "uber_eats": 23.99}	0.00	1	2	22	1	1	{pepperoni,meat}	2025-08-29 23:22:08.065	2025-08-29 23:22:08.065	\N	\N	\N	{}
32f76b50-5ed6-4e4f-bc57-b3038ec24ddc	82b4039a-f9f3-4648-b3e1-23397d83af61	11111111-1111-1111-1111-111111111111	{"ar": "حمص", "en": "Hummus"}	{"ar": "غموس الحمص التقليدي بالطحينة", "en": "Classic chickpea dip with tahini"}	\N	\N	8.50	{"dine_in": 8.50, "takeout": 7.50, "delivery": 9.50}	3.20	1	10	5	1	1	{vegetarian,healthy,popular}	2025-08-30 05:22:23.665	2025-08-30 05:22:23.665	\N	\N	\N	{}
bae9d88e-16d8-4c92-b3f9-a0e94ece63f5	82b4039a-f9f3-4648-b3e1-23397d83af61	11111111-1111-1111-1111-111111111111	{"ar": "أجنحة الدجاج", "en": "Buffalo Wings"}	{"ar": "أجنحة دجاج حارة مع الجبنة الزرقاء", "en": "Spicy chicken wings with blue cheese"}	\N	\N	12.99	{"dine_in": 12.99, "takeout": 11.99, "delivery": 13.99}	5.50	1	15	12	1	1	{spicy,popular,chicken}	2025-08-30 05:22:23.665	2025-08-30 05:22:23.665	\N	\N	\N	{}
5dc9dad0-ae58-4831-b73c-252cd62ca888	82b4039a-f9f3-4648-b3e1-23397d83af61	22222222-2222-2222-2222-222222222222	{"ar": "صدر دجاج مشوي", "en": "Grilled Chicken Breast"}	{"ar": "صدر دجاج مشوي بالأعشاب", "en": "Juicy grilled chicken with herbs"}	\N	\N	18.50	{"dine_in": 18.50, "takeout": 17.50, "delivery": 19.50}	8.75	1	20	18	1	1	{healthy,protein,grilled}	2025-08-30 05:22:23.665	2025-08-30 05:22:23.665	\N	\N	\N	{}
89f57d6c-2efe-4ddc-84e4-919cbcf94470	82b4039a-f9f3-4648-b3e1-23397d83af61	22222222-2222-2222-2222-222222222222	{"ar": "برغر لحم", "en": "Beef Burger"}	{"ar": "برغر لحم أنجوس مع البطاطس", "en": "Angus beef burger with fries"}	\N	\N	16.75	{"dine_in": 16.75, "takeout": 15.75, "delivery": 17.75}	7.25	1	25	15	1	1	{beef,popular,burger}	2025-08-30 05:22:23.665	2025-08-30 05:22:23.665	\N	\N	\N	{}
2c9a1a8c-c145-46f2-a8ed-c307ea6643f5	82b4039a-f9f3-4648-b3e1-23397d83af61	33333333-3333-3333-3333-333333333333	{"ar": "كيك الشوكولاتة", "en": "Chocolate Cake"}	{"ar": "كيك الشوكولاتة الغني بالطبقات", "en": "Rich chocolate layer cake"}	\N	\N	7.99	{"dine_in": 7.99, "takeout": 6.99, "delivery": 8.99}	2.50	1	5	3	1	1	{dessert,chocolate,sweet}	2025-08-30 05:22:23.665	2025-08-30 05:22:23.665	\N	\N	\N	{}
ddfd67af-3b93-4033-b8e3-a7ab1e4faf4d	dc3c6a10-96c6-4467-9778-313af66956af	0d819024-b6c2-47ac-aa0f-177f020665cc	{"ar": "wqe", "en": "wqw"}	{"ar": "qw", "en": "wqe"}	\N	\N	5.00	{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1}	0.00	1	999	12	1	1	{2}	2025-08-30 13:16:41.085	2025-08-30 13:16:41.085	\N	\N	\N	{}
bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb	82b4039a-f9f3-4648-b3e1-23397d83af61	11111111-1111-1111-1111-111111111111	{"ar": "دجاج ديلوكس", "en": "Chicken Deluxe"}	{"ar": "صدر دجاج مشوي مع صوص خاص", "en": "Grilled chicken breast with special sauce"}	\N	\N	13.99	{"website": 13.99, "uber_eats": 15.99}	0.00	0	2	10	1	1	{chicken,grilled}	2025-08-29 23:22:08.065	2025-08-30 15:10:24.687	\N	\N	\N	{}
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	82b4039a-f9f3-4648-b3e1-23397d83af61	11111111-1111-1111-1111-111111111111	{"ar": "برجر لحم كلاسيكي", "en": "Classic Beef Burger"}	{"ar": "شريحة لحم عصارة مع خس وطماطم وبصل", "en": "Juicy beef patty with lettuce, tomato, onion"}	\N	\N	15.99	{"website": 15.99, "doordash": 16.99, "uber_eats": 17.99}	0.00	0	1	12	1	1	{popular,beef}	2025-08-29 23:22:08.065	2025-08-30 15:10:24.687	\N	\N	\N	{}
cccccccc-cccc-cccc-cccc-cccccccccccc	82b4039a-f9f3-4648-b3e1-23397d83af61	22222222-2222-2222-2222-222222222222	{"ar": "بيتزا مارجريتا", "en": "Margherita Pizza"}	{"ar": "طماطم طازجة، موتزاريلا، ريحان", "en": "Fresh tomato, mozzarella, basil"}	\N	\N	18.99	{"website": 18.99, "doordash": 20.99}	0.00	0	1	20	1	1	{vegetarian,popular}	2025-08-29 23:22:08.065	2025-08-30 15:10:24.687	\N	\N	\N	{}
eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee	82b4039a-f9f3-4648-b3e1-23397d83af61	33333333-3333-3333-3333-333333333333	{"ar": "عصير برتقال طازج", "en": "Fresh Orange Juice"}	{"ar": "عصير برتقال معصور طازجاً", "en": "Freshly squeezed orange juice"}	\N	\N	4.99	{"website": 4.99, "uber_eats": 5.99}	0.00	0	1	2	1	1	{fresh,vitamin-c}	2025-08-29 23:22:08.065	2025-08-30 15:10:24.687	\N	\N	\N	{}
3d687360-7de7-4bc9-95bf-e3a3861a64a9	dc3c6a10-96c6-4467-9778-313af66956af	0d819024-b6c2-47ac-aa0f-177f020665cc	{"ar": "ss", "en": "ss"}	{"ar": "ss", "en": "ss"}	\N	\N	1.00	{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1, "customChannels": []}	0.00	1	1	15	1	1	{}	2025-08-30 21:29:09.926	2025-08-30 21:29:09.926	\N	\N	\N	{}
\.


--
-- Data for Name: modifier_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modifier_categories (id, company_id, name, description, display_number, image, created_at, updated_at, deleted_at, is_required, max_selections, min_selections, selection_type) FROM stdin;
\.


--
-- Data for Name: modifiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modifiers (id, modifier_category_id, company_id, name, description, base_price, pricing, cost, status, display_number, created_at, updated_at, deleted_at, image, is_default) FROM stdin;
\.


--
-- Data for Name: price_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_history (id, entity_type, entity_id, promotion_id, old_price, new_price, change_reason, platform, created_at, created_by) FROM stdin;
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, product_id, filename, original_name, url, size, width, height, mime_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_modifier_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_modifier_categories (id, product_id, modifier_category_id, min_quantity, max_quantity, price_override, is_required, display_order, created_at) FROM stdin;
\.


--
-- Data for Name: promotion_modifier_markups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_modifier_markups (id, promotion_id, product_id, modifier_id, markup_percentage, original_price, marked_up_price, profit_margin, business_reason, created_at) FROM stdin;
\.


--
-- Data for Name: promotion_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_products (id, promotion_id, product_id, base_discount_type, base_discount_value, created_at) FROM stdin;
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, company_id, name, description, promotion_type, start_date, end_date, is_active, auto_revert, platforms, min_profit_margin, original_pricing_snapshot, created_at, updated_at, created_by) FROM stdin;
\.


--
-- Data for Name: user_activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_activity_logs (id, user_id, action, resource_type, resource_id, description, ip_address, user_agent, success, error_message, "timestamp") FROM stdin;
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id, user_id, token_hash, refresh_token_hash, expires_at, refresh_expires_at, ip_address, user_agent, device_type, is_active, revoked_at, created_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, phone, avatar_url, password_hash, pin, email_verified_at, role, status, company_id, branch_id, language, timezone, last_login_at, last_login_ip, failed_login_attempts, locked_until, must_change_password, created_at, updated_at, deleted_at, created_by, updated_by, first_name, last_name, username) FROM stdin;
9caee1f8-547d-435c-9c66-885a52ac373a	Issa Dalu Shawerma 3a saj	962795943016_1756456703665@placeholder.local	+962795943016	\N	$2a$10$Zrz1NmogqnMzv9IMXVuCHOepv8lNWYlSPgKlT6YoTFmtOwInfRPCS	\N	\N	company_owner	active	dc3c6a10-96c6-4467-9778-313af66956af	\N	en	Asia/Amman	\N	\N	0	\N	f	2025-08-29 08:38:23.666	2025-08-29 08:56:37.471	2025-08-29 08:56:37.471	1ec02dec-9a81-473a-9cdf-31454e2e959a	1ec02dec-9a81-473a-9cdf-31454e2e959a	Issa Dalu	Shawerma 3a saj	\N
d9136bdc-392e-445e-8ed8-60d8b0c979b6	Company B Owner	owner@companyb.com	\N	\N	$2a$12$vkPBZ/RKiS6xY/fwj/QiU.ixOJN4sxpbg7QjKAtu5Bz2K83GIBDQm	\N	\N	company_owner	active	82b4039a-f9f3-4648-b3e1-23397d83af61	\N	en	Asia/Amman	\N	\N	0	\N	f	2025-08-29 08:32:29.076	2025-08-29 08:59:42.945	2025-08-29 08:59:42.945	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	\N	\N
dfed55fa-5890-426d-9960-8ee49318d18a	test2	step2@criptext.com	+962795943016	\N	$2a$10$GB9FEmwSzH9ToXVbeZc06uK3klhyZgKIy3HipHI2nW/puLDYoGRHC	\N	\N	company_owner	active	dc3c6a10-96c6-4467-9778-313af66956af	\N	en	Asia/Amman	\N	\N	0	\N	f	2025-08-29 09:34:55.462	2025-08-29 09:34:55.462	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	\N	\N	issadalu2
ded34072-ae63-4a84-8f11-3a5dcd4bcb9a	test2	step3@criptext.com	+962795943016	\N	$2a$10$tpT7qI93474TQSH7PzYFlu7RJE6iah4g2tjXQCS0n8Dsv5F6ltuX2	\N	\N	call_center	active	c382fdd5-1a60-4481-ad5f-65b575729b2c	\N	en	Asia/Amman	2025-08-29 19:28:07.428	\N	0	\N	f	2025-08-29 19:27:53.731	2025-08-29 19:28:07.429	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	\N	\N	issa2
3131d1ef-ca70-4385-b142-770727c8d5a7	Main Office	step1@criptext.com	+962795943016	\N	$2a$10$nk8iFUSE2RLFP2EleGaAN.JtouhEgBwiBXcA2w0I0OsNgg753zj4O	\N	\N	company_owner	active	dc3c6a10-96c6-4467-9778-313af66956af	\N	en	Asia/Amman	2025-08-29 20:35:58.252	\N	0	\N	f	2025-08-29 09:00:09.037	2025-08-29 20:35:58.253	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	\N	\N	jess
ff25b5d8-036a-4ed9-b909-e001addf1141	ejewp owie	962694358332_1756417011721@placeholder.local	+962694358332	\N	$2a$10$DqPdz8ZyZSxsi4iV.jtLfOvFTJEAr3LlVXVRWpA1xkxE4k4Dgltlq	\N	\N	call_center	active	dc3c6a10-96c6-4467-9778-313af66956af	\N	en	Asia/Amman	\N	\N	0	\N	f	2025-08-28 21:36:51.723	2025-08-29 20:36:33.549	2025-08-29 20:36:33.549	1ec02dec-9a81-473a-9cdf-31454e2e959a	3131d1ef-ca70-4385-b142-770727c8d5a7	ejewp	owie	\N
4fcb92e6-d1c2-4583-8ce7-172227a2a4e8	Super Admin	admin@platform.com	\N	\N	$2b$12$4vT0Z4.ZXgpKxqn1O4b3Ve5jCO/i5lSbExDsOxT7Iz6J1Jx2E/UOS	\N	\N	super_admin	active	82b4039a-f9f3-4648-b3e1-23397d83af61	\N	en	Asia/Amman	\N	\N	0	\N	f	2025-08-30 05:07:35.457	2025-08-30 05:07:35.457	\N	\N	\N	\N	\N	\N
e4282c30-b3b9-4168-bdb1-cb2a7bfcd20b	Main Office	a1dmin@restau1rantplatform.com	+962444444444	\N	$2a$10$ijLhRFTauQToagV08ArQHe4EeGQus2w7AQzQrXdie4lq0ai8LfEhK	\N	\N	branch_manager	active	dc3c6a10-96c6-4467-9778-313af66956af	\N	en	Asia/Amman	\N	\N	0	\N	f	2025-08-30 12:04:22.129	2025-08-30 12:04:37.007	2025-08-30 12:04:37.007	1ec02dec-9a81-473a-9cdf-31454e2e959a	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	\N	addas
test-menu-user-001	Test Menu User	test@menu.com	\N	\N	$2a$12$UYp5LE7.oSp9E83LWcxBCuBwmP8SSwuv0VbTPJeMBGJqihgyMKrMC	\N	\N	company_owner	active	82b4039a-f9f3-4648-b3e1-23397d83af61	\N	en	Asia/Amman	2025-08-30 12:07:54.682	\N	0	\N	f	2025-08-29 23:32:49.478	2025-08-30 12:07:54.683	\N	\N	\N	Test	User	testuser
86cf1cd3-0213-4671-bfa5-917c781d7871	reziq	riz@gmail.com	+962566666666	\N	$2a$10$IMCgZu/ccda/ZgdjfdRQeOx6Y9Y2H6ttCc2tlC1pFpzRrHUrK/RDq	\N	\N	call_center	active	82b4039a-f9f3-4648-b3e1-23397d83af61	\N	en	Asia/Amman	2025-08-30 12:11:33.119	\N	0	\N	f	2025-08-30 12:11:01.201	2025-08-30 12:11:33.12	\N	test-menu-user-001	\N	\N	\N	reziq
1ec02dec-9a81-473a-9cdf-31454e2e959a	System Administrator	admin@restaurantplatform.com	\N	\N	$2a$12$vkPBZ/RKiS6xY/fwj/QiU.ixOJN4sxpbg7QjKAtu5Bz2K83GIBDQm	\N	2025-08-27 09:04:10.179	super_admin	active	dc3c6a10-96c6-4467-9778-313af66956af	40f863e7-b719-4142-8e94-724572002d9b	en	Asia/Amman	2025-08-30 12:12:06.608	\N	0	\N	t	2025-08-27 09:04:10.179	2025-08-30 12:12:06.609	\N	\N	\N	System	Administrator	\N
3ff50f61-1d76-4660-b390-fd8dc12cf0ed	test	a213dmin@restaurantplatform.com	+962444444443	\N	$2a$10$W2rfYoozJ/B.69IOsaSqGu4mH63PichU.cER.F3nuHJzzSnvPOpTC	\N	\N	super_admin	active	dc3c6a10-96c6-4467-9778-313af66956af	\N	en	Asia/Amman	\N	\N	0	\N	f	2025-08-30 18:26:31.855	2025-08-30 18:26:31.855	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	\N	\N	5325rewf
\.


--
-- Name: license_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.license_audit_logs_id_seq', 15, true);


--
-- Name: license_invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.license_invoices_id_seq', 5, true);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: companies companies_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_slug_key UNIQUE (slug);


--
-- Name: license_audit_logs license_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_audit_logs
    ADD CONSTRAINT license_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: license_invoices license_invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_invoices
    ADD CONSTRAINT license_invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: license_invoices license_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_invoices
    ADD CONSTRAINT license_invoices_pkey PRIMARY KEY (id);


--
-- Name: licenses licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_pkey PRIMARY KEY (id);


--
-- Name: menu_categories menu_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_categories
    ADD CONSTRAINT menu_categories_pkey PRIMARY KEY (id);


--
-- Name: menu_products menu_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_products
    ADD CONSTRAINT menu_products_pkey PRIMARY KEY (id);


--
-- Name: modifier_categories modifier_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modifier_categories
    ADD CONSTRAINT modifier_categories_pkey PRIMARY KEY (id);


--
-- Name: modifiers modifiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modifiers
    ADD CONSTRAINT modifiers_pkey PRIMARY KEY (id);


--
-- Name: price_history price_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT price_history_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_modifier_categories product_modifier_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_modifier_categories
    ADD CONSTRAINT product_modifier_categories_pkey PRIMARY KEY (id);


--
-- Name: promotion_modifier_markups promotion_modifier_markups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_modifier_markups
    ADD CONSTRAINT promotion_modifier_markups_pkey PRIMARY KEY (id);


--
-- Name: promotion_products promotion_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_products
    ADD CONSTRAINT promotion_products_pkey PRIMARY KEY (id);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: user_activity_logs user_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_activity_logs
    ADD CONSTRAINT user_activity_logs_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_refresh_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_refresh_token_hash_key UNIQUE (refresh_token_hash);


--
-- Name: user_sessions user_sessions_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_token_hash_key UNIQUE (token_hash);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_branches_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_branches_default ON public.branches USING btree (company_id) WHERE ((is_default = true) AND (deleted_at IS NULL));


--
-- Name: idx_licenses_days_remaining; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_licenses_days_remaining ON public.licenses USING btree (days_remaining) WHERE (status = 'active'::public.license_status);


--
-- Name: idx_licenses_expiry_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_licenses_expiry_active ON public.licenses USING btree (expires_at) WHERE (status = 'active'::public.license_status);


--
-- Name: idx_sessions_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_token ON public.user_sessions USING btree (token_hash) WHERE (is_active = true);


--
-- Name: idx_users_last_login; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_last_login ON public.users USING btree (last_login_at DESC) WHERE (last_login_at IS NOT NULL);


--
-- Name: menu_categories_company_id_is_active_display_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX menu_categories_company_id_is_active_display_number_idx ON public.menu_categories USING btree (company_id, is_active, display_number);


--
-- Name: menu_products_company_id_category_id_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX menu_products_company_id_category_id_priority_idx ON public.menu_products USING btree (company_id, category_id, priority);


--
-- Name: menu_products_company_id_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX menu_products_company_id_created_at_idx ON public.menu_products USING btree (company_id, created_at);


--
-- Name: menu_products_company_id_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX menu_products_company_id_status_idx ON public.menu_products USING btree (company_id, status);


--
-- Name: product_images_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_created_at_idx ON public.product_images USING btree (created_at);


--
-- Name: product_images_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_product_id_idx ON public.product_images USING btree (product_id);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: licenses license_audit_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER license_audit_trigger AFTER INSERT OR UPDATE ON public.licenses FOR EACH ROW EXECUTE FUNCTION public.trigger_license_audit_log();


--
-- Name: branches branches_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: licenses licenses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: menu_categories menu_categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_categories
    ADD CONSTRAINT menu_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: menu_products menu_products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_products
    ADD CONSTRAINT menu_products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.menu_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: menu_products menu_products_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_products
    ADD CONSTRAINT menu_products_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: modifier_categories modifier_categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modifier_categories
    ADD CONSTRAINT modifier_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: modifiers modifiers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modifiers
    ADD CONSTRAINT modifiers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: modifiers modifiers_modifier_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modifiers
    ADD CONSTRAINT modifiers_modifier_category_id_fkey FOREIGN KEY (modifier_category_id) REFERENCES public.modifier_categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_history price_history_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT price_history_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.menu_products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_modifier_categories product_modifier_categories_modifier_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_modifier_categories
    ADD CONSTRAINT product_modifier_categories_modifier_category_id_fkey FOREIGN KEY (modifier_category_id) REFERENCES public.modifier_categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_modifier_categories product_modifier_categories_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_modifier_categories
    ADD CONSTRAINT product_modifier_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.menu_products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_modifier_markups promotion_modifier_markups_modifier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_modifier_markups
    ADD CONSTRAINT promotion_modifier_markups_modifier_id_fkey FOREIGN KEY (modifier_id) REFERENCES public.modifiers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_modifier_markups promotion_modifier_markups_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_modifier_markups
    ADD CONSTRAINT promotion_modifier_markups_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.menu_products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_modifier_markups promotion_modifier_markups_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_modifier_markups
    ADD CONSTRAINT promotion_modifier_markups_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_products promotion_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_products
    ADD CONSTRAINT promotion_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.menu_products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_products promotion_products_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_products
    ADD CONSTRAINT promotion_products_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotions promotions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_activity_logs user_activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_activity_logs
    ADD CONSTRAINT user_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: branches; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

--
-- Name: companies; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict BSafA7c2zjgvwijGOJxuEE5LgDhSb5UWtaPkjvDTc7lAW6AsmJS3vythukWBuwQ

