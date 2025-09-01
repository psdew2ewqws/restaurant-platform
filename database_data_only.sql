--
-- PostgreSQL database dump
--

\restrict ntFM5NCK3PTvsWqbSUhAqzr51gfVpuuEsn06cgyUUhzdWuhcJBM9VgNrNEKnKa0

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
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.companies VALUES ('a13343e5-3109-4dc7-8f75-77982f0cfc7a', 'Main Officewqdascdscwsdcsc', 'main-officewqdascdscwsdcsc', NULL, 'restaurant', 'Asia/Amman', 'JOD', 'trial', 'basic', NULL, '2025-08-30 18:41:53.167', '2025-08-30 18:41:56.151', '2025-08-30 18:41:56.151', NULL, NULL);
INSERT INTO public.companies VALUES ('bef6f0cf-40b3-491e-915c-40e4b0d9fed7', 'edsa', 'edsa', NULL, 'restaurant', 'Asia/Amman', 'JOD', 'active', 'basic', NULL, '2025-08-30 18:50:18.368', '2025-08-30 19:50:14.738', NULL, NULL, NULL);
INSERT INTO public.companies VALUES ('82b4039a-f9f3-4648-b3e1-23397d83af61', 'Test Company B', 'test-company-b', NULL, 'restaurant', 'Asia/Amman', 'JOD', 'active', 'basic', NULL, '2025-08-29 08:32:09.73', '2025-08-29 19:06:57.417', '2025-08-29 19:06:57.417', NULL, NULL);
INSERT INTO public.companies VALUES ('ee1b200f-bd2b-4d23-a3ff-1ce80ef90a0a', 'Main Office', 'main-office', NULL, 'restaurant', 'Asia/Amman', 'JOD', 'trial', 'basic', NULL, '2025-08-29 19:07:13.194', '2025-08-29 19:07:20.805', '2025-08-29 19:07:20.805', NULL, NULL);
INSERT INTO public.companies VALUES ('5b7c4bdc-5649-49bd-9f6e-3a87a583d750', 'Main Office', '2s', NULL, 'restaurant', 'Asia/Amman', 'JOD', 'active', 'basic', NULL, '2025-08-29 19:25:04.682', '2025-08-30 19:50:20.221', '2025-08-30 19:50:20.221', NULL, NULL);
INSERT INTO public.companies VALUES ('dc3c6a10-96c6-4467-9778-313af66956af', 'Default Restaurant', 'default-restaurant', NULL, 'restaurant', 'Asia/Amman', 'JOD', 'trial', 'basic', NULL, '2025-08-28 13:41:43.688', '2025-08-29 19:12:22.896', NULL, NULL, NULL);
INSERT INTO public.companies VALUES ('c382fdd5-1a60-4481-ad5f-65b575729b2c', 'Main Office', 'main-office1', NULL, 'restaurant', 'Asia/Amman', 'JOD', 'active', 'basic', NULL, '2025-08-29 19:08:57.1', '2025-08-29 19:24:07.381', NULL, NULL, NULL);
INSERT INTO public.companies VALUES ('b4830b4e-be20-4bba-8b3e-a0f0d2213749', '112', '112', NULL, 'restaurant', 'Asia/Amman', 'JOD', 'trial', 'basic', NULL, '2025-08-30 18:41:30.02', '2025-08-30 18:41:34.449', '2025-08-30 18:41:34.449', NULL, NULL);


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.branches VALUES ('40f863e7-b719-4142-8e94-724572002d9b', 'dc3c6a10-96c6-4467-9778-313af66956af', 'Main Office', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, true, true, true, true, 'Asia/Amman', '2025-08-27 09:04:10.179', '2025-08-27 09:04:10.179', NULL, NULL, NULL, 'Main Office', NULL, NULL);
INSERT INTO public.branches VALUES ('b558e6c0-0866-4acd-9693-7c0a502e9df7', 'dc3c6a10-96c6-4467-9778-313af66956af', 'test', '+962666666666', NULL, 'wqejnwkp39', 'amma', 'Jordan', 31.93055735, 36.00758411, false, true, false, true, true, 'Asia/Amman', '2025-08-28 21:15:30.596', '2025-08-29 08:29:36.491', NULL, '1ec02dec-9a81-473a-9cdf-31454e2e959a', '1ec02dec-9a81-473a-9cdf-31454e2e959a', 'test', '22:00', '22:09');
INSERT INTO public.branches VALUES ('f97ceb38-c797-4d1c-9ff4-89d9f8da5235', '82b4039a-f9f3-4648-b3e1-23397d83af61', 'Company B Main Branch', NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, true, true, true, true, 'Asia/Amman', '2025-08-29 08:32:37.531', '2025-08-29 08:32:37.531', NULL, NULL, NULL, 'الفرع الرئيسي ب', NULL, NULL);
INSERT INTO public.branches VALUES ('f3d4114a-0e39-43fd-aa98-01b57df7efd0', '82b4039a-f9f3-4648-b3e1-23397d83af61', 'Company B Secondary', NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, true, true, true, true, 'Asia/Amman', '2025-08-29 08:32:37.531', '2025-08-29 08:32:37.531', NULL, NULL, NULL, 'الفرع الثانوي ب', NULL, NULL);
INSERT INTO public.branches VALUES ('eb4d5daa-c58c-4369-a454-047db8ac3f50', 'dc3c6a10-96c6-4467-9778-313af66956af', 'Default Restaurant', '+962444444441', NULL, '21313', 'amma', 'Jordan', 31.94333322, 35.91626025, false, true, true, true, true, 'Asia/Amman', '2025-08-29 19:48:09.722', '2025-08-29 19:48:09.722', NULL, '1ec02dec-9a81-473a-9cdf-31454e2e959a', NULL, 'الفرع الرئيسي', '19:49', '23:48');
INSERT INTO public.branches VALUES ('c91db38e-ef89-44c6-8f7d-57de5e91d903', 'dc3c6a10-96c6-4467-9778-313af66956af', 'ss', '+962444444444', NULL, 'wqejnwkp39', 'amma', 'Jordan', 32.01672005, 35.85926868, false, true, true, true, true, 'Asia/Amman', '2025-08-30 18:24:57.476', '2025-08-30 18:24:57.476', NULL, '1ec02dec-9a81-473a-9cdf-31454e2e959a', NULL, 'ss', '20:24', '12:24');


--
-- Data for Name: license_audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.license_audit_logs VALUES (1, 'a91c9849-509f-4213-aef4-907bd1b2d050', 'UPDATE', '{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2025-09-29T18:50:18.37", "renewed_at": null, "start_date": "2025-08-30T18:50:18.37", "total_days": 30, "updated_at": "2025-08-30T18:50:18.372", "updated_by": null, "last_checked": "2025-08-30T18:50:18.37", "days_remaining": 30}', '{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2025-10-29T18:50:18.37", "renewed_at": "2025-08-30T19:16:46.267", "start_date": "2025-08-30T18:50:18.37", "total_days": 60, "updated_at": "2025-08-30T19:16:46.269", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:16:46.267", "days_remaining": 60}', NULL, '2025-08-30 19:16:46.269025');
INSERT INTO public.license_audit_logs VALUES (2, 'a91c9849-509f-4213-aef4-907bd1b2d050', 'UPDATE', '{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2025-10-29T18:50:18.37", "renewed_at": "2025-08-30T19:16:46.267", "start_date": "2025-08-30T18:50:18.37", "total_days": 60, "updated_at": "2025-08-30T19:16:46.269", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:16:46.267", "days_remaining": 60}', '{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2025-11-28T18:50:18.37", "renewed_at": "2025-08-30T19:16:56.078", "start_date": "2025-08-30T18:50:18.37", "total_days": 90, "updated_at": "2025-08-30T19:16:56.08", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:16:56.078", "days_remaining": 90}', NULL, '2025-08-30 19:16:56.080285');
INSERT INTO public.license_audit_logs VALUES (3, '38da34d2-3e21-4e14-a8c5-6b39c4cdde31', 'UPDATE', '{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2025-09-28T19:08:57.106", "renewed_at": null, "start_date": "2025-08-29T19:08:57.106", "total_days": 30, "updated_at": "2025-08-29T19:24:07.397", "updated_by": null, "last_checked": "2025-08-29T19:08:57.106", "days_remaining": 30}', '{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2025-10-28T19:08:57.106", "renewed_at": "2025-08-30T19:17:02.924", "start_date": "2025-08-29T19:08:57.106", "total_days": 60, "updated_at": "2025-08-30T19:17:02.926", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:17:02.924", "days_remaining": 59}', NULL, '2025-08-30 19:17:02.926598');
INSERT INTO public.license_audit_logs VALUES (4, '38da34d2-3e21-4e14-a8c5-6b39c4cdde31', 'UPDATE', '{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2025-10-28T19:08:57.106", "renewed_at": "2025-08-30T19:17:02.924", "start_date": "2025-08-29T19:08:57.106", "total_days": 60, "updated_at": "2025-08-30T19:17:02.926", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:17:02.924", "days_remaining": 59}', '{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2025-11-27T19:08:57.106", "renewed_at": "2025-08-30T19:17:19.636", "start_date": "2025-08-29T19:08:57.106", "total_days": 90, "updated_at": "2025-08-30T19:17:19.638", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:17:19.636", "days_remaining": 89}', NULL, '2025-08-30 19:17:19.638004');
INSERT INTO public.license_audit_logs VALUES (5, '38da34d2-3e21-4e14-a8c5-6b39c4cdde31', 'UPDATE', '{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2025-11-27T19:08:57.106", "renewed_at": "2025-08-30T19:17:19.636", "start_date": "2025-08-29T19:08:57.106", "total_days": 90, "updated_at": "2025-08-30T19:17:19.638", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:17:19.636", "days_remaining": 89}', '{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2025-12-27T19:08:57.106", "renewed_at": "2025-08-30T19:18:06.118", "start_date": "2025-08-29T19:08:57.106", "total_days": 120, "updated_at": "2025-08-30T19:18:06.121", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:18:06.118", "days_remaining": 119}', NULL, '2025-08-30 19:18:06.121098');
INSERT INTO public.license_audit_logs VALUES (6, '38da34d2-3e21-4e14-a8c5-6b39c4cdde31', 'UPDATE', '{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2025-12-27T19:08:57.106", "renewed_at": "2025-08-30T19:18:06.118", "start_date": "2025-08-29T19:08:57.106", "total_days": 120, "updated_at": "2025-08-30T19:18:06.121", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:18:06.118", "days_remaining": 119}', '{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-01-26T19:08:57.106", "renewed_at": "2025-08-30T19:18:06.775", "start_date": "2025-08-29T19:08:57.106", "total_days": 150, "updated_at": "2025-08-30T19:18:06.777", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:18:06.775", "days_remaining": 149}', NULL, '2025-08-30 19:18:06.77834');
INSERT INTO public.license_audit_logs VALUES (7, '38da34d2-3e21-4e14-a8c5-6b39c4cdde31', 'UPDATE', '{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-01-26T19:08:57.106", "renewed_at": "2025-08-30T19:18:06.775", "start_date": "2025-08-29T19:08:57.106", "total_days": 150, "updated_at": "2025-08-30T19:18:06.777", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:18:06.775", "days_remaining": 149}', '{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-02-25T19:08:57.106", "renewed_at": "2025-08-30T19:23:40.998", "start_date": "2025-08-29T19:08:57.106", "total_days": 180, "updated_at": "2025-08-30T19:23:41", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:23:40.998", "days_remaining": 179}', NULL, '2025-08-30 19:23:41.000509');
INSERT INTO public.license_audit_logs VALUES (8, '4452ed54-28a6-446e-9281-651e6b5b0ec2', 'UPDATE', '{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2025-11-07T13:54:01.426", "renewed_at": "2025-08-29T19:05:53.298", "start_date": "2025-08-09T13:54:01.426", "total_days": 90, "updated_at": "2025-08-29T19:12:22.91", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-29T19:05:53.298", "days_remaining": 70}', '{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2025-12-07T13:54:01.426", "renewed_at": "2025-08-30T19:23:50.52", "start_date": "2025-08-09T13:54:01.426", "total_days": 120, "updated_at": "2025-08-30T19:23:50.521", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:23:50.52", "days_remaining": 99}', NULL, '2025-08-30 19:23:50.52172');
INSERT INTO public.license_audit_logs VALUES (9, '4452ed54-28a6-446e-9281-651e6b5b0ec2', 'UPDATE', '{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2025-12-07T13:54:01.426", "renewed_at": "2025-08-30T19:23:50.52", "start_date": "2025-08-09T13:54:01.426", "total_days": 120, "updated_at": "2025-08-30T19:23:50.521", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:23:50.52", "days_remaining": 99}', '{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-01-06T13:54:01.426", "renewed_at": "2025-08-30T19:24:33.104", "start_date": "2025-08-09T13:54:01.426", "total_days": 150, "updated_at": "2025-08-30T19:24:33.105", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:24:33.104", "days_remaining": 129}', NULL, '2025-08-30 19:24:33.105964');
INSERT INTO public.license_audit_logs VALUES (10, 'a91c9849-509f-4213-aef4-907bd1b2d050', 'UPDATE', '{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2025-11-28T18:50:18.37", "renewed_at": "2025-08-30T19:16:56.078", "start_date": "2025-08-30T18:50:18.37", "total_days": 90, "updated_at": "2025-08-30T19:16:56.08", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:16:56.078", "days_remaining": 90}', '{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2025-12-28T18:50:18.37", "renewed_at": "2025-08-30T19:46:30.526", "start_date": "2025-08-30T18:50:18.37", "total_days": 120, "updated_at": "2025-08-30T19:46:30.528", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:46:30.526", "days_remaining": 120}', NULL, '2025-08-30 19:46:30.528699');
INSERT INTO public.license_audit_logs VALUES (11, 'a91c9849-509f-4213-aef4-907bd1b2d050', 'UPDATE', '{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2025-12-28T18:50:18.37", "renewed_at": "2025-08-30T19:46:30.526", "start_date": "2025-08-30T18:50:18.37", "total_days": 120, "updated_at": "2025-08-30T19:46:30.528", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:46:30.526", "days_remaining": 120}', '{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2026-12-28T18:50:18.37", "renewed_at": "2025-08-30T19:50:10.093", "start_date": "2025-08-30T18:50:18.37", "total_days": 485, "updated_at": "2025-08-30T19:50:10.095", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:50:10.093", "days_remaining": 485}', NULL, '2025-08-30 19:50:10.095596');
INSERT INTO public.license_audit_logs VALUES (12, 'a91c9849-509f-4213-aef4-907bd1b2d050', 'UPDATE', '{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["basic"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2026-12-28T18:50:18.37", "renewed_at": "2025-08-30T19:50:10.093", "start_date": "2025-08-30T18:50:18.37", "total_days": 485, "updated_at": "2025-08-30T19:50:10.095", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:50:10.093", "days_remaining": 485}', '{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["analytics", "multi_location"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2026-12-28T18:50:18.37", "renewed_at": "2025-08-30T19:50:10.093", "start_date": "2025-08-30T18:50:18.37", "total_days": 485, "updated_at": "2025-08-30T19:50:14.747", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:50:10.093", "days_remaining": 485}', NULL, '2025-08-30 19:50:14.736312');
INSERT INTO public.license_audit_logs VALUES (13, 'a91c9849-509f-4213-aef4-907bd1b2d050', 'UPDATE', '{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["analytics", "multi_location"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2026-12-28T18:50:18.37", "renewed_at": "2025-08-30T19:50:10.093", "start_date": "2025-08-30T18:50:18.37", "total_days": 485, "updated_at": "2025-08-30T19:50:14.747", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:50:10.093", "days_remaining": 485}', '{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["analytics", "multi_location"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2027-01-27T18:50:18.37", "renewed_at": "2025-08-30T21:25:38.802", "start_date": "2025-08-30T18:50:18.37", "total_days": 515, "updated_at": "2025-08-30T21:25:38.805", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T21:25:38.802", "days_remaining": 515}', NULL, '2025-08-30 21:25:38.805141');
INSERT INTO public.license_audit_logs VALUES (14, '38da34d2-3e21-4e14-a8c5-6b39c4cdde31', 'UPDATE', '{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-02-25T19:08:57.106", "renewed_at": "2025-08-30T19:23:40.998", "start_date": "2025-08-29T19:08:57.106", "total_days": 180, "updated_at": "2025-08-30T19:23:41", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:23:40.998", "days_remaining": 179}', '{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-03-27T19:08:57.106", "renewed_at": "2025-08-30T21:25:42.664", "start_date": "2025-08-29T19:08:57.106", "total_days": 210, "updated_at": "2025-08-30T21:25:42.666", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T21:25:42.664", "days_remaining": 209}', NULL, '2025-08-30 21:25:42.666677');
INSERT INTO public.license_audit_logs VALUES (15, '4452ed54-28a6-446e-9281-651e6b5b0ec2', 'UPDATE', '{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-01-06T13:54:01.426", "renewed_at": "2025-08-30T19:24:33.104", "start_date": "2025-08-09T13:54:01.426", "total_days": 150, "updated_at": "2025-08-30T19:24:33.105", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T19:24:33.104", "days_remaining": 129}', '{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-02-05T13:54:01.426", "renewed_at": "2025-08-30T21:25:46.155", "start_date": "2025-08-09T13:54:01.426", "total_days": 180, "updated_at": "2025-08-30T21:25:46.163", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T21:25:46.155", "days_remaining": 159}', NULL, '2025-08-30 21:25:46.164013');


--
-- Data for Name: license_invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.license_invoices VALUES (1, 'a91c9849-509f-4213-aef4-907bd1b2d050', 'INV-202508-0001', 99.00, 'USD', 'paid', '2025-08-30 19:46:30.549101', NULL, NULL, NULL, 'bef6f0cf-40b3-491e-915c-40e4b0d9fed7', 30, '2025-08-30 19:46:30.526', '2025-09-29 19:46:30.526', '{"renewalType": "extension", "newExpiryDate": "2025-12-28T18:50:18.370Z", "originalExpiryDate": "2025-11-28T18:50:18.370Z"}', '1ec02dec-9a81-473a-9cdf-31454e2e959a');
INSERT INTO public.license_invoices VALUES (2, 'a91c9849-509f-4213-aef4-907bd1b2d050', 'INV-202508-0002', 1204.50, 'USD', 'paid', '2025-08-30 19:50:10.105866', NULL, NULL, NULL, 'bef6f0cf-40b3-491e-915c-40e4b0d9fed7', 365, '2025-08-30 19:50:10.093', '2025-09-29 19:50:10.093', '{"renewalType": "extension", "newExpiryDate": "2026-12-28T18:50:18.370Z", "originalExpiryDate": "2025-12-28T18:50:18.370Z"}', '1ec02dec-9a81-473a-9cdf-31454e2e959a');
INSERT INTO public.license_invoices VALUES (3, 'a91c9849-509f-4213-aef4-907bd1b2d050', 'INV-202508-0003', 99.00, 'USD', 'paid', '2025-08-30 21:25:38.82335', NULL, NULL, NULL, 'bef6f0cf-40b3-491e-915c-40e4b0d9fed7', 30, '2025-08-30 21:25:38.802', '2025-09-29 21:25:38.802', '{"renewalType": "extension", "newExpiryDate": "2027-01-27T18:50:18.370Z", "originalExpiryDate": "2026-12-28T18:50:18.370Z"}', '1ec02dec-9a81-473a-9cdf-31454e2e959a');
INSERT INTO public.license_invoices VALUES (4, '38da34d2-3e21-4e14-a8c5-6b39c4cdde31', 'INV-202508-0004', 99.00, 'USD', 'paid', '2025-08-30 21:25:42.676009', NULL, NULL, NULL, 'c382fdd5-1a60-4481-ad5f-65b575729b2c', 30, '2025-08-30 21:25:42.664', '2025-09-29 21:25:42.664', '{"renewalType": "extension", "newExpiryDate": "2026-03-27T19:08:57.106Z", "originalExpiryDate": "2026-02-25T19:08:57.106Z"}', '1ec02dec-9a81-473a-9cdf-31454e2e959a');
INSERT INTO public.license_invoices VALUES (5, '4452ed54-28a6-446e-9281-651e6b5b0ec2', 'INV-202508-0005', 99.00, 'USD', 'paid', '2025-08-30 21:25:46.176888', NULL, NULL, NULL, 'dc3c6a10-96c6-4467-9778-313af66956af', 30, '2025-08-30 21:25:46.155', '2025-09-29 21:25:46.155', '{"renewalType": "extension", "newExpiryDate": "2026-02-05T13:54:01.426Z", "originalExpiryDate": "2026-01-06T13:54:01.426Z"}', '1ec02dec-9a81-473a-9cdf-31454e2e959a');


--
-- Data for Name: licenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.licenses VALUES ('b037f11f-b98e-4dd2-a5e6-b8cc37cf58b7', '5b7c4bdc-5649-49bd-9f6e-3a87a583d750', 'active', '2025-08-29 19:25:04.684', '2026-12-27 19:25:04.684', '["analytics", "multi_location"]', '2025-08-29 19:25:04.687', '2025-08-29 19:25:23.167', NULL, '1ec02dec-9a81-473a-9cdf-31454e2e959a', 485, '2025-08-29 19:25:23.164', '2025-08-29 19:25:23.164', 485);
INSERT INTO public.licenses VALUES ('d6a803ce-c7a3-496c-b460-c26fcd8e59be', 'b4830b4e-be20-4bba-8b3e-a0f0d2213749', 'active', '2025-08-30 18:41:30.02', '2025-09-29 18:41:30.02', '["basic"]', '2025-08-30 18:41:30.022', '2025-08-30 18:41:30.022', NULL, NULL, 30, '2025-08-30 18:41:30.02', NULL, 30);
INSERT INTO public.licenses VALUES ('eef7b459-8a50-41b9-85f9-824b7c276ea6', 'a13343e5-3109-4dc7-8f75-77982f0cfc7a', 'active', '2025-08-30 18:41:53.167', '2025-09-29 18:41:53.167', '["basic"]', '2025-08-30 18:41:53.168', '2025-08-30 18:41:53.168', NULL, NULL, 30, '2025-08-30 18:41:53.167', NULL, 30);
INSERT INTO public.licenses VALUES ('lic_sample_001', 'dc3c6a10-96c6-4467-9778-313af66956af', 'active', '2024-09-13 17:15:55.124', '2026-10-23 17:15:55.124', '["pos_integration", "analytics", "multi_branch"]', '2024-09-13 17:15:55.124', '2025-08-29 18:24:23.817', '1ec02dec-9a81-473a-9cdf-31454e2e959a', '1ec02dec-9a81-473a-9cdf-31454e2e959a', 420, '2025-08-29 18:24:23.816', '2025-08-29 18:24:23.816', 770);
INSERT INTO public.licenses VALUES ('adaaf5c8-28f7-402f-843a-029e1e297f45', 'ee1b200f-bd2b-4d23-a3ff-1ce80ef90a0a', 'active', '2025-08-29 19:07:13.198', '2025-09-28 19:07:13.198', '["basic"]', '2025-08-29 19:07:13.199', '2025-08-29 19:07:13.199', NULL, NULL, 30, '2025-08-29 19:07:13.198', NULL, 30);
INSERT INTO public.licenses VALUES ('a91c9849-509f-4213-aef4-907bd1b2d050', 'bef6f0cf-40b3-491e-915c-40e4b0d9fed7', 'active', '2025-08-30 18:50:18.37', '2027-01-27 18:50:18.37', '["analytics", "multi_location"]', '2025-08-30 18:50:18.372', '2025-08-30 21:25:38.805', NULL, '1ec02dec-9a81-473a-9cdf-31454e2e959a', 515, '2025-08-30 21:25:38.802', '2025-08-30 21:25:38.802', 515);
INSERT INTO public.licenses VALUES ('38da34d2-3e21-4e14-a8c5-6b39c4cdde31', 'c382fdd5-1a60-4481-ad5f-65b575729b2c', 'active', '2025-08-29 19:08:57.106', '2026-03-27 19:08:57.106', '["analytics", "multi_location"]', '2025-08-29 19:08:57.109', '2025-08-30 21:25:42.666', NULL, '1ec02dec-9a81-473a-9cdf-31454e2e959a', 209, '2025-08-30 21:25:42.664', '2025-08-30 21:25:42.664', 210);
INSERT INTO public.licenses VALUES ('4452ed54-28a6-446e-9281-651e6b5b0ec2', 'dc3c6a10-96c6-4467-9778-313af66956af', 'active', '2025-08-09 13:54:01.426', '2026-02-05 13:54:01.426', '["analytics", "multi_location"]', '2025-08-09 13:54:01.426', '2025-08-30 21:25:46.163', NULL, '1ec02dec-9a81-473a-9cdf-31454e2e959a', 159, '2025-08-30 21:25:46.155', '2025-08-30 21:25:46.155', 180);


--
-- Data for Name: menu_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.menu_categories VALUES ('0d819024-b6c2-47ac-aa0f-177f020665cc', 'dc3c6a10-96c6-4467-9778-313af66956af', '{"ar": "المقبلات", "en": "Appetizers"}', '{"ar": "مقبلات لذيذة", "en": "Delicious starters"}', NULL, 1, true, '2025-08-30 05:24:22.847', '2025-08-30 18:21:41.575', NULL, NULL, NULL);
INSERT INTO public.menu_categories VALUES ('f11f4a8e-1797-40c7-8a97-86e2da02b15d', 'dc3c6a10-96c6-4467-9778-313af66956af', '{"ar": "3", "en": "3"}', NULL, NULL, 4, false, '2025-08-30 09:58:39.315', '2025-08-30 14:26:39.41', NULL, NULL, NULL);
INSERT INTO public.menu_categories VALUES ('44444444-4444-4444-4444-444444444444', '82b4039a-f9f3-4648-b3e1-23397d83af61', '{"ar": "حلويات", "en": "Desserts"}', '{"ar": "حلويات لذيذة", "en": "Sweet desserts"}', NULL, 4, false, '2025-08-29 23:21:26.675', '2025-08-30 12:08:39.254', NULL, NULL, NULL);
INSERT INTO public.menu_categories VALUES ('33333333-3333-3333-3333-333333333333', '82b4039a-f9f3-4648-b3e1-23397d83af61', '{"ar": "مشروبات", "en": "Beverages"}', '{"ar": "مشروبات باردة وساخنة", "en": "Cold and hot drinks"}', NULL, 3, false, '2025-08-29 23:21:26.675', '2025-08-30 12:08:40.136', NULL, NULL, NULL);
INSERT INTO public.menu_categories VALUES ('22222222-2222-2222-2222-222222222222', '82b4039a-f9f3-4648-b3e1-23397d83af61', '{"ar": "بيتزا", "en": "Pizza"}', '{"ar": "بيتزا طازجة", "en": "Fresh pizza"}', NULL, 2, false, '2025-08-29 23:21:26.675', '2025-08-30 12:08:40.844', NULL, NULL, NULL);
INSERT INTO public.menu_categories VALUES ('11111111-1111-1111-1111-111111111111', '82b4039a-f9f3-4648-b3e1-23397d83af61', '{"ar": "برجر", "en": "Burgers"}', '{"ar": "برجر لذيذ", "en": "Delicious burgers"}', NULL, 1, false, '2025-08-29 23:21:26.675', '2025-08-30 12:08:41.358', NULL, NULL, NULL);
INSERT INTO public.menu_categories VALUES ('c6baef0a-278d-4eef-881e-48ab68911dfe', 'dc3c6a10-96c6-4467-9778-313af66956af', '{"ar": "الأطباق الرئيسية", "en": "Main Dishes"}', '{"ar": "أطباقنا الرئيسية المميزة", "en": "Our signature main courses"}', NULL, 2, false, '2025-08-30 05:24:22.847', '2025-08-30 14:26:43.489', NULL, NULL, NULL);


--
-- Data for Name: menu_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.menu_products VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', '82b4039a-f9f3-4648-b3e1-23397d83af61', '22222222-2222-2222-2222-222222222222', '{"ar": "بيبروني سوبريم", "en": "Pepperoni Supreme"}', '{"ar": "بيبروني، فطر، فلفل حلو", "en": "Pepperoni, mushrooms, bell peppers"}', NULL, NULL, 21.99, '{"talabat": 22.99, "website": 21.99, "uber_eats": 23.99}', 0.00, 1, 2, 22, 1, 1, '{pepperoni,meat}', '2025-08-29 23:22:08.065', '2025-08-29 23:22:08.065', NULL, NULL, NULL, '{}');
INSERT INTO public.menu_products VALUES ('32f76b50-5ed6-4e4f-bc57-b3038ec24ddc', '82b4039a-f9f3-4648-b3e1-23397d83af61', '11111111-1111-1111-1111-111111111111', '{"ar": "حمص", "en": "Hummus"}', '{"ar": "غموس الحمص التقليدي بالطحينة", "en": "Classic chickpea dip with tahini"}', NULL, NULL, 8.50, '{"dine_in": 8.50, "takeout": 7.50, "delivery": 9.50}', 3.20, 1, 10, 5, 1, 1, '{vegetarian,healthy,popular}', '2025-08-30 05:22:23.665', '2025-08-30 05:22:23.665', NULL, NULL, NULL, '{}');
INSERT INTO public.menu_products VALUES ('bae9d88e-16d8-4c92-b3f9-a0e94ece63f5', '82b4039a-f9f3-4648-b3e1-23397d83af61', '11111111-1111-1111-1111-111111111111', '{"ar": "أجنحة الدجاج", "en": "Buffalo Wings"}', '{"ar": "أجنحة دجاج حارة مع الجبنة الزرقاء", "en": "Spicy chicken wings with blue cheese"}', NULL, NULL, 12.99, '{"dine_in": 12.99, "takeout": 11.99, "delivery": 13.99}', 5.50, 1, 15, 12, 1, 1, '{spicy,popular,chicken}', '2025-08-30 05:22:23.665', '2025-08-30 05:22:23.665', NULL, NULL, NULL, '{}');
INSERT INTO public.menu_products VALUES ('5dc9dad0-ae58-4831-b73c-252cd62ca888', '82b4039a-f9f3-4648-b3e1-23397d83af61', '22222222-2222-2222-2222-222222222222', '{"ar": "صدر دجاج مشوي", "en": "Grilled Chicken Breast"}', '{"ar": "صدر دجاج مشوي بالأعشاب", "en": "Juicy grilled chicken with herbs"}', NULL, NULL, 18.50, '{"dine_in": 18.50, "takeout": 17.50, "delivery": 19.50}', 8.75, 1, 20, 18, 1, 1, '{healthy,protein,grilled}', '2025-08-30 05:22:23.665', '2025-08-30 05:22:23.665', NULL, NULL, NULL, '{}');
INSERT INTO public.menu_products VALUES ('89f57d6c-2efe-4ddc-84e4-919cbcf94470', '82b4039a-f9f3-4648-b3e1-23397d83af61', '22222222-2222-2222-2222-222222222222', '{"ar": "برغر لحم", "en": "Beef Burger"}', '{"ar": "برغر لحم أنجوس مع البطاطس", "en": "Angus beef burger with fries"}', NULL, NULL, 16.75, '{"dine_in": 16.75, "takeout": 15.75, "delivery": 17.75}', 7.25, 1, 25, 15, 1, 1, '{beef,popular,burger}', '2025-08-30 05:22:23.665', '2025-08-30 05:22:23.665', NULL, NULL, NULL, '{}');
INSERT INTO public.menu_products VALUES ('2c9a1a8c-c145-46f2-a8ed-c307ea6643f5', '82b4039a-f9f3-4648-b3e1-23397d83af61', '33333333-3333-3333-3333-333333333333', '{"ar": "كيك الشوكولاتة", "en": "Chocolate Cake"}', '{"ar": "كيك الشوكولاتة الغني بالطبقات", "en": "Rich chocolate layer cake"}', NULL, NULL, 7.99, '{"dine_in": 7.99, "takeout": 6.99, "delivery": 8.99}', 2.50, 1, 5, 3, 1, 1, '{dessert,chocolate,sweet}', '2025-08-30 05:22:23.665', '2025-08-30 05:22:23.665', NULL, NULL, NULL, '{}');
INSERT INTO public.menu_products VALUES ('ddfd67af-3b93-4033-b8e3-a7ab1e4faf4d', 'dc3c6a10-96c6-4467-9778-313af66956af', '0d819024-b6c2-47ac-aa0f-177f020665cc', '{"ar": "wqe", "en": "wqw"}', '{"ar": "qw", "en": "wqe"}', NULL, NULL, 5.00, '{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1}', 0.00, 1, 999, 12, 1, 1, '{2}', '2025-08-30 13:16:41.085', '2025-08-30 13:16:41.085', NULL, NULL, NULL, '{}');
INSERT INTO public.menu_products VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '82b4039a-f9f3-4648-b3e1-23397d83af61', '11111111-1111-1111-1111-111111111111', '{"ar": "دجاج ديلوكس", "en": "Chicken Deluxe"}', '{"ar": "صدر دجاج مشوي مع صوص خاص", "en": "Grilled chicken breast with special sauce"}', NULL, NULL, 13.99, '{"website": 13.99, "uber_eats": 15.99}', 0.00, 0, 2, 10, 1, 1, '{chicken,grilled}', '2025-08-29 23:22:08.065', '2025-08-30 15:10:24.687', NULL, NULL, NULL, '{}');
INSERT INTO public.menu_products VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '82b4039a-f9f3-4648-b3e1-23397d83af61', '11111111-1111-1111-1111-111111111111', '{"ar": "برجر لحم كلاسيكي", "en": "Classic Beef Burger"}', '{"ar": "شريحة لحم عصارة مع خس وطماطم وبصل", "en": "Juicy beef patty with lettuce, tomato, onion"}', NULL, NULL, 15.99, '{"website": 15.99, "doordash": 16.99, "uber_eats": 17.99}', 0.00, 0, 1, 12, 1, 1, '{popular,beef}', '2025-08-29 23:22:08.065', '2025-08-30 15:10:24.687', NULL, NULL, NULL, '{}');
INSERT INTO public.menu_products VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', '82b4039a-f9f3-4648-b3e1-23397d83af61', '22222222-2222-2222-2222-222222222222', '{"ar": "بيتزا مارجريتا", "en": "Margherita Pizza"}', '{"ar": "طماطم طازجة، موتزاريلا، ريحان", "en": "Fresh tomato, mozzarella, basil"}', NULL, NULL, 18.99, '{"website": 18.99, "doordash": 20.99}', 0.00, 0, 1, 20, 1, 1, '{vegetarian,popular}', '2025-08-29 23:22:08.065', '2025-08-30 15:10:24.687', NULL, NULL, NULL, '{}');
INSERT INTO public.menu_products VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '82b4039a-f9f3-4648-b3e1-23397d83af61', '33333333-3333-3333-3333-333333333333', '{"ar": "عصير برتقال طازج", "en": "Fresh Orange Juice"}', '{"ar": "عصير برتقال معصور طازجاً", "en": "Freshly squeezed orange juice"}', NULL, NULL, 4.99, '{"website": 4.99, "uber_eats": 5.99}', 0.00, 0, 1, 2, 1, 1, '{fresh,vitamin-c}', '2025-08-29 23:22:08.065', '2025-08-30 15:10:24.687', NULL, NULL, NULL, '{}');
INSERT INTO public.menu_products VALUES ('3d687360-7de7-4bc9-95bf-e3a3861a64a9', 'dc3c6a10-96c6-4467-9778-313af66956af', '0d819024-b6c2-47ac-aa0f-177f020665cc', '{"ar": "ss", "en": "ss"}', '{"ar": "ss", "en": "ss"}', NULL, NULL, 1.00, '{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1, "customChannels": []}', 0.00, 1, 1, 15, 1, 1, '{}', '2025-08-30 21:29:09.926', '2025-08-30 21:29:09.926', NULL, NULL, NULL, '{}');


--
-- Data for Name: modifier_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: modifiers; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: price_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_modifier_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: promotion_modifier_markups; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: promotion_products; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES ('9caee1f8-547d-435c-9c66-885a52ac373a', 'Issa Dalu Shawerma 3a saj', '962795943016_1756456703665@placeholder.local', '+962795943016', NULL, '$2a$10$Zrz1NmogqnMzv9IMXVuCHOepv8lNWYlSPgKlT6YoTFmtOwInfRPCS', NULL, NULL, 'company_owner', 'active', 'dc3c6a10-96c6-4467-9778-313af66956af', NULL, 'en', 'Asia/Amman', NULL, NULL, 0, NULL, false, '2025-08-29 08:38:23.666', '2025-08-29 08:56:37.471', '2025-08-29 08:56:37.471', '1ec02dec-9a81-473a-9cdf-31454e2e959a', '1ec02dec-9a81-473a-9cdf-31454e2e959a', 'Issa Dalu', 'Shawerma 3a saj', NULL);
INSERT INTO public.users VALUES ('d9136bdc-392e-445e-8ed8-60d8b0c979b6', 'Company B Owner', 'owner@companyb.com', NULL, NULL, '$2a$12$vkPBZ/RKiS6xY/fwj/QiU.ixOJN4sxpbg7QjKAtu5Bz2K83GIBDQm', NULL, NULL, 'company_owner', 'active', '82b4039a-f9f3-4648-b3e1-23397d83af61', NULL, 'en', 'Asia/Amman', NULL, NULL, 0, NULL, false, '2025-08-29 08:32:29.076', '2025-08-29 08:59:42.945', '2025-08-29 08:59:42.945', NULL, '1ec02dec-9a81-473a-9cdf-31454e2e959a', NULL, NULL, NULL);
INSERT INTO public.users VALUES ('dfed55fa-5890-426d-9960-8ee49318d18a', 'test2', 'step2@criptext.com', '+962795943016', NULL, '$2a$10$GB9FEmwSzH9ToXVbeZc06uK3klhyZgKIy3HipHI2nW/puLDYoGRHC', NULL, NULL, 'company_owner', 'active', 'dc3c6a10-96c6-4467-9778-313af66956af', NULL, 'en', 'Asia/Amman', NULL, NULL, 0, NULL, false, '2025-08-29 09:34:55.462', '2025-08-29 09:34:55.462', NULL, '1ec02dec-9a81-473a-9cdf-31454e2e959a', NULL, NULL, NULL, 'issadalu2');
INSERT INTO public.users VALUES ('ded34072-ae63-4a84-8f11-3a5dcd4bcb9a', 'test2', 'step3@criptext.com', '+962795943016', NULL, '$2a$10$tpT7qI93474TQSH7PzYFlu7RJE6iah4g2tjXQCS0n8Dsv5F6ltuX2', NULL, NULL, 'call_center', 'active', 'c382fdd5-1a60-4481-ad5f-65b575729b2c', NULL, 'en', 'Asia/Amman', '2025-08-29 19:28:07.428', NULL, 0, NULL, false, '2025-08-29 19:27:53.731', '2025-08-29 19:28:07.429', NULL, '1ec02dec-9a81-473a-9cdf-31454e2e959a', NULL, NULL, NULL, 'issa2');
INSERT INTO public.users VALUES ('3131d1ef-ca70-4385-b142-770727c8d5a7', 'Main Office', 'step1@criptext.com', '+962795943016', NULL, '$2a$10$nk8iFUSE2RLFP2EleGaAN.JtouhEgBwiBXcA2w0I0OsNgg753zj4O', NULL, NULL, 'company_owner', 'active', 'dc3c6a10-96c6-4467-9778-313af66956af', NULL, 'en', 'Asia/Amman', '2025-08-29 20:35:58.252', NULL, 0, NULL, false, '2025-08-29 09:00:09.037', '2025-08-29 20:35:58.253', NULL, '1ec02dec-9a81-473a-9cdf-31454e2e959a', NULL, NULL, NULL, 'jess');
INSERT INTO public.users VALUES ('ff25b5d8-036a-4ed9-b909-e001addf1141', 'ejewp owie', '962694358332_1756417011721@placeholder.local', '+962694358332', NULL, '$2a$10$DqPdz8ZyZSxsi4iV.jtLfOvFTJEAr3LlVXVRWpA1xkxE4k4Dgltlq', NULL, NULL, 'call_center', 'active', 'dc3c6a10-96c6-4467-9778-313af66956af', NULL, 'en', 'Asia/Amman', NULL, NULL, 0, NULL, false, '2025-08-28 21:36:51.723', '2025-08-29 20:36:33.549', '2025-08-29 20:36:33.549', '1ec02dec-9a81-473a-9cdf-31454e2e959a', '3131d1ef-ca70-4385-b142-770727c8d5a7', 'ejewp', 'owie', NULL);
INSERT INTO public.users VALUES ('4fcb92e6-d1c2-4583-8ce7-172227a2a4e8', 'Super Admin', 'admin@platform.com', NULL, NULL, '$2b$12$4vT0Z4.ZXgpKxqn1O4b3Ve5jCO/i5lSbExDsOxT7Iz6J1Jx2E/UOS', NULL, NULL, 'super_admin', 'active', '82b4039a-f9f3-4648-b3e1-23397d83af61', NULL, 'en', 'Asia/Amman', NULL, NULL, 0, NULL, false, '2025-08-30 05:07:35.457', '2025-08-30 05:07:35.457', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES ('e4282c30-b3b9-4168-bdb1-cb2a7bfcd20b', 'Main Office', 'a1dmin@restau1rantplatform.com', '+962444444444', NULL, '$2a$10$ijLhRFTauQToagV08ArQHe4EeGQus2w7AQzQrXdie4lq0ai8LfEhK', NULL, NULL, 'branch_manager', 'active', 'dc3c6a10-96c6-4467-9778-313af66956af', NULL, 'en', 'Asia/Amman', NULL, NULL, 0, NULL, false, '2025-08-30 12:04:22.129', '2025-08-30 12:04:37.007', '2025-08-30 12:04:37.007', '1ec02dec-9a81-473a-9cdf-31454e2e959a', '1ec02dec-9a81-473a-9cdf-31454e2e959a', NULL, NULL, 'addas');
INSERT INTO public.users VALUES ('test-menu-user-001', 'Test Menu User', 'test@menu.com', NULL, NULL, '$2a$12$UYp5LE7.oSp9E83LWcxBCuBwmP8SSwuv0VbTPJeMBGJqihgyMKrMC', NULL, NULL, 'company_owner', 'active', '82b4039a-f9f3-4648-b3e1-23397d83af61', NULL, 'en', 'Asia/Amman', '2025-08-30 12:07:54.682', NULL, 0, NULL, false, '2025-08-29 23:32:49.478', '2025-08-30 12:07:54.683', NULL, NULL, NULL, 'Test', 'User', 'testuser');
INSERT INTO public.users VALUES ('86cf1cd3-0213-4671-bfa5-917c781d7871', 'reziq', 'riz@gmail.com', '+962566666666', NULL, '$2a$10$IMCgZu/ccda/ZgdjfdRQeOx6Y9Y2H6ttCc2tlC1pFpzRrHUrK/RDq', NULL, NULL, 'call_center', 'active', '82b4039a-f9f3-4648-b3e1-23397d83af61', NULL, 'en', 'Asia/Amman', '2025-08-30 12:11:33.119', NULL, 0, NULL, false, '2025-08-30 12:11:01.201', '2025-08-30 12:11:33.12', NULL, 'test-menu-user-001', NULL, NULL, NULL, 'reziq');
INSERT INTO public.users VALUES ('1ec02dec-9a81-473a-9cdf-31454e2e959a', 'System Administrator', 'admin@restaurantplatform.com', NULL, NULL, '$2a$12$vkPBZ/RKiS6xY/fwj/QiU.ixOJN4sxpbg7QjKAtu5Bz2K83GIBDQm', NULL, '2025-08-27 09:04:10.179', 'super_admin', 'active', 'dc3c6a10-96c6-4467-9778-313af66956af', '40f863e7-b719-4142-8e94-724572002d9b', 'en', 'Asia/Amman', '2025-08-30 12:12:06.608', NULL, 0, NULL, true, '2025-08-27 09:04:10.179', '2025-08-30 12:12:06.609', NULL, NULL, NULL, 'System', 'Administrator', NULL);
INSERT INTO public.users VALUES ('3ff50f61-1d76-4660-b390-fd8dc12cf0ed', 'test', 'a213dmin@restaurantplatform.com', '+962444444443', NULL, '$2a$10$W2rfYoozJ/B.69IOsaSqGu4mH63PichU.cER.F3nuHJzzSnvPOpTC', NULL, NULL, 'super_admin', 'active', 'dc3c6a10-96c6-4467-9778-313af66956af', NULL, 'en', 'Asia/Amman', NULL, NULL, 0, NULL, false, '2025-08-30 18:26:31.855', '2025-08-30 18:26:31.855', NULL, '1ec02dec-9a81-473a-9cdf-31454e2e959a', NULL, NULL, NULL, '5325rewf');


--
-- Data for Name: user_activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: license_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.license_audit_logs_id_seq', 15, true);


--
-- Name: license_invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.license_invoices_id_seq', 5, true);


--
-- PostgreSQL database dump complete
--

\unrestrict ntFM5NCK3PTvsWqbSUhAqzr51gfVpuuEsn06cgyUUhzdWuhcJBM9VgNrNEKnKa0

