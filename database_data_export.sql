--
-- PostgreSQL database dump
--

\restrict oLAwOA5GJ3C8TLqINWtgvXDHeKamTDaeGxa1LZgHto17ReN59II1DUt7fbCwfxJ

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
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, name, slug, logo, business_type, timezone, default_currency, status, subscription_plan, subscription_expires_at, created_at, updated_at, deleted_at, created_by, updated_by) FROM stdin;
a13343e5-3109-4dc7-8f75-77982f0cfc7a	Main Officewqdascdscwsdcsc	main-officewqdascdscwsdcsc	\N	restaurant	Asia/Amman	JOD	trial	basic	\N	2025-08-30 18:41:53.167	2025-08-30 18:41:56.151	2025-08-30 18:41:56.151	\N	\N
bef6f0cf-40b3-491e-915c-40e4b0d9fed7	edsa	edsa	\N	restaurant	Asia/Amman	JOD	active	basic	\N	2025-08-30 18:50:18.368	2025-08-30 19:50:14.738	\N	\N	\N
82b4039a-f9f3-4648-b3e1-23397d83af61	Test Company B	test-company-b	\N	restaurant	Asia/Amman	JOD	active	basic	\N	2025-08-29 08:32:09.73	2025-08-29 19:06:57.417	2025-08-29 19:06:57.417	\N	\N
ee1b200f-bd2b-4d23-a3ff-1ce80ef90a0a	Main Office	main-office	\N	restaurant	Asia/Amman	JOD	trial	basic	\N	2025-08-29 19:07:13.194	2025-08-29 19:07:20.805	2025-08-29 19:07:20.805	\N	\N
5b7c4bdc-5649-49bd-9f6e-3a87a583d750	Main Office	2s	\N	restaurant	Asia/Amman	JOD	active	basic	\N	2025-08-29 19:25:04.682	2025-08-30 19:50:20.221	2025-08-30 19:50:20.221	\N	\N
dc3c6a10-96c6-4467-9778-313af66956af	Default Restaurant	default-restaurant	\N	restaurant	Asia/Amman	JOD	active	basic	\N	2025-08-28 13:41:43.688	2025-09-02 16:43:23.262	\N	\N	\N
aa896a02-e087-40a9-b981-d30c49a5c0a6	dqwdqasd	dqwdqasd	\N	restaurant	Asia/Amman	JOD	trial	basic	\N	2025-09-02 20:41:23.083	2025-09-02 20:41:33.683	\N	\N	\N
c382fdd5-1a60-4481-ad5f-65b575729b2c	Main Office	main-office1	\N	restaurant	Asia/Amman	JOD	active	basic	\N	2025-08-29 19:08:57.1	2025-08-29 19:24:07.381	\N	\N	\N
b4830b4e-be20-4bba-8b3e-a0f0d2213749	112	112	\N	restaurant	Asia/Amman	JOD	trial	basic	\N	2025-08-30 18:41:30.02	2025-08-30 18:41:34.449	2025-08-30 18:41:34.449	\N	\N
\.


--
-- Data for Name: delivery_providers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_providers (id, name, "displayName", api_base_url, api_key, is_active, priority, supported_areas, avg_delivery_time, base_fee, fee_per_km, max_distance, configuration, created_at, updated_at, company_id, webhook_url) FROM stdin;
0ed9a1b8-102f-48c7-97ad-6bafbbba636e	jahez	{"ar": "جاهز", "en": "Jahez"}	https://integration-api-staging.jahez.net	\N	t	5	{riyadh,jeddah,dammam,mecca,medina}	35	5.00	1.50	25.00	{"region": "saudi_arabia", "currency": "SAR", "features": ["real_time_tracking", "scheduled_delivery", "arabic_support"], "endpoints": {"createOrder": "api/orders/create", "updateEvent": "food_aggregator/jahez/update_event"}, "apiVersion": "v1", "operatingHours": {"end": "23:59", "start": "06:00"}, "supportedPaymentMethods": ["cash", "card", "wallet"]}	2025-09-01 05:37:59.936	2025-09-01 05:46:19.02	\N	food_aggregator/jahez/create-order
b79fbba3-441e-49df-b316-c46340011b5c	deliveroo	{"ar": "ديليفيرو", "en": "Deliveroo"}	https://api-sandbox.developers.deliveroo.com	\N	t	6	{london,manchester,birmingham,dubai,abu_dhabi}	30	2.49	0.50	15.00	{"oauth": {"scope": "read_orders write_orders", "authUrl": "https://auth-sandbox.developers.deliveroo.com", "tokenUrl": "https://auth-sandbox.developers.deliveroo.com/oauth/token"}, "region": "international", "currency": "GBP", "features": ["oauth_integration", "multi_currency", "premium_service"], "apiVersion": "v1", "credentials": {"username": "2d9evch7l3cnjjthi9515inp4u", "clientSecret": "1dll310ddt9is56880km4g59cvhbmq3flg1plt726cs8keq2amp7", "clientEncoding": "MmQ5ZXZjaDdsM2Nuamp0aGk5NTE1aW5wNHU6MWRsbDMxMGRkdDlpczU2ODgwa200ZzU5Y3ZoYm1xM2ZsZzFwbHQ3MjZjczhrZXEyYW1wNw=="}, "operatingHours": {"end": "23:00", "start": "11:00"}, "currencyByMarket": {"uk": "GBP", "uae": "AED", "france": "EUR", "belgium": "EUR"}, "supportedPaymentMethods": ["card", "paypal", "apple_pay", "google_pay"]}	2025-09-01 05:37:59.944	2025-09-01 05:46:19.025	\N	food_aggregator/delivaroo/set-order
062c3878-427b-4234-baca-0674ac725cb3	yallow	{"ar": "يالو", "en": "Yallow"}	https://integration.ishbek.com/Yallow/Api/	\N	t	7	{amman,zarqa}	40	3.00	1.00	18.00	{"region": "jordan_local", "currency": "JOD", "features": ["local_delivery", "jordan_focused"], "endpoints": {"createOrder": "createOrder/branch/"}, "apiVersion": "v1", "operatingHours": {"end": "21:00", "start": "09:00"}, "supportedPaymentMethods": ["cash", "card"]}	2025-09-01 05:46:19.029	2025-09-01 05:46:19.029	\N	\N
a7206c9c-57d8-4a85-a509-397db92f2a83	dhub	{"ar": "دهوب", "en": "DHUB"}	https://jordon.dhub.pro/	\N	t	1	{amman,zarqa,irbid,aqaba,salt,madaba}	25	2.50	0.75	20.00	{"region": "jordan", "currency": "JOD", "features": ["real_time_tracking", "jordan_coverage", "arabic_support", "office_management"], "endpoints": {"createBranch": "external/api/Branches/CreateBranch", "createOffice": "external/api/Offices/CreateOffice", "createDeliveryJob": "external/api/Order/Create", "validateDeliveryJob": "external/api/Order/Validate"}, "apiVersion": "v1", "operatingHours": {"end": "22:00", "start": "08:00"}, "supportedPaymentMethods": ["cash", "card"]}	2025-08-31 23:59:06.045	2025-09-01 05:46:18.986	\N	\N
d503fea1-bee8-4312-9fd7-69906ee6670b	talabat	{"ar": "طلبات", "en": "Talabat"}	https://htalabatdelivery.ishbek.com/Delivery/	\N	t	2	{kuwait,uae,saudi,qatar,bahrain,oman}	30	1.00	0.25	25.00	{"region": "gulf_states", "currency": "KWD", "features": ["real_time_tracking", "scheduled_delivery", "gulf_coverage", "multi_currency", "credentials_management"], "endpoints": {"getFees": "GetEstimatedFees", "createOrder": "CreateOrder", "getRequestLog": "Logs/GetTalabatMenuRequestLogByCompanyId", "getCredentials": "branch/GetTalabatBranchids", "createCredentials": "branch/Createtalabatcredentials", "markOrderPrepared": "AcceptOrder"}, "apiVersion": "v1", "deliveryTypes": ["talabat_delivery", "talabat_pay_at_vendor", "talabat_pay_at_pickup"], "operatingHours": {"end": "02:00", "start": "10:00"}, "currencyByMarket": {"uae": "AED", "oman": "OMR", "qatar": "QAR", "saudi": "SAR", "kuwait": "KWD", "bahrain": "BHD"}, "orderTypeMapping": {"66770d92-8516-4e85-af94-3153c7b834eb": "talabat"}, "supportedPaymentMethods": ["cash", "card", "knet", "talabat_wallet"]}	2025-08-31 23:59:06.05	2025-09-01 05:46:19.004	\N	\N
74a65a95-a7b5-4fc4-aadd-736e2ee8bd69	careem	{"ar": "كريم", "en": "Careem"}	http://65.108.60.120:708/api/	\N	t	3	{uae,saudi,egypt,pakistan,jordan,lebanon}	28	5.00	1.00	30.00	{"region": "middle_east_africa", "currency": "AED", "features": ["real_time_tracking", "premium_service", "multi_region", "24_7_service"], "endpoints": {"getMenu": "Menu/GetBranchMenuCareemmMap", "trackOrder": "orders/track", "createOrder": "orders/create"}, "apiVersion": "v2", "deliveryTypes": ["careem", "careemnow"], "operatingHours": {"end": "24/7", "start": "24/7"}, "orderTypeMapping": {"0c698066-ce70-483f-8da6-968465fd697a": "careem", "b8fe602c-9bf4-4c13-bcf1-4a84325992e2": "careemnow"}, "supportedPaymentMethods": ["cash", "card", "careem_wallet"]}	2025-08-31 23:59:06.048	2025-09-01 05:46:19.01	\N	\N
81ceae80-37c0-4329-af5d-d9de05d998fc	careemexpress	{"ar": "كريم إكسبريس", "en": "Careem Express"}	https://integration.ishbek.com/CareemNow/Api/	\N	t	4	{dubai,abu_dhabi,riyadh,jeddah}	15	8.00	1.50	15.00	{"region": "uae_saudi", "currency": "AED", "features": ["express_delivery", "premium_service", "card_only"], "endpoints": {"createOrder": "createOrder/branch/"}, "apiVersion": "v1", "deliveryTypes": ["careemexpress"], "operatingHours": {"end": "23:00", "start": "08:00"}, "supportedPaymentMethods": ["card", "careem_wallet"]}	2025-09-01 05:46:19.016	2025-09-01 05:46:19.016	\N	\N
8ae1444c-4946-4c3a-bceb-123c6850c5fe	jooddelivery	{"ar": "جود للتوصيل", "en": "Jood Delivery"}	https://integration.ishbek.com/JoodDelivery/Api	\N	t	8	{riyadh,jeddah}	45	6.00	1.25	20.00	{"region": "saudi_local", "currency": "SAR", "features": ["local_delivery", "saudi_focused", "order_estimation"], "endpoints": {"createOrder": "createOrder/branch/", "checkOrderStatus": "checkOrderStatus/orderId/", "checkOrderEstimations": "checkOrderEstimations/branch/"}, "apiVersion": "v1", "operatingHours": {"end": "22:00", "start": "10:00"}, "supportedPaymentMethods": ["cash", "card"]}	2025-09-01 05:46:19.032	2025-09-01 05:46:19.032	\N	\N
8f64c7ca-d653-454a-ac66-d86a2ac9160f	topdeliver	{"ar": "توب ديليفر", "en": "Top Deliver"}	https://integration.ishbek.com/TopDelivery/Api/	\N	t	9	{kuwait,hawalli}	50	1.50	0.50	22.00	{"region": "kuwait_local", "currency": "KWD", "features": ["local_delivery", "kuwait_focused", "knet_support"], "endpoints": {"createOrder": "createOrder/branch/", "checkOrderStatus": "checkOrderStatus/orderId/", "checkOrderEstimations": "checkOrderEstimations/branch/"}, "apiVersion": "v1", "operatingHours": {"end": "23:00", "start": "09:00"}, "supportedPaymentMethods": ["cash", "card", "knet"]}	2025-09-01 05:46:19.035	2025-09-01 05:46:19.035	\N	\N
45ed31c6-adf5-4159-a773-4bd1a013f188	nashmi	{"ar": "ناشمي", "en": "Nashmi"}	https://integration.ishbek.com/Nashmi/Nashmi	\N	t	10	{doha,al_rayyan}	55	5.00	2.00	15.00	{"region": "qatar_local", "currency": "QAR", "features": ["local_delivery", "qatar_focused", "preorder_estimation"], "endpoints": {"getFees": "checkPreorderEstimationsTime/branch/", "createTask": "createOrder/branch/"}, "apiVersion": "v1", "operatingHours": {"end": "22:00", "start": "10:00"}, "supportedPaymentMethods": ["cash", "card"]}	2025-09-01 05:46:19.038	2025-09-01 05:46:19.038	\N	\N
8628f82e-aada-40ba-88ab-572e90cc56fd	tawasi	{"ar": "تواصي للتوصيل", "en": "Tawasi Delivery"}	https://integration.ishbek.com/Tawasi/Api/	\N	t	11	{beirut,tripoli}	60	4.00	1.50	12.00	{"region": "lebanon_local", "currency": "LBP", "features": ["local_delivery", "lebanon_focused"], "endpoints": {"createOrder": "createOrder/branch/"}, "apiVersion": "v1", "operatingHours": {"end": "21:00", "start": "11:00"}, "supportedPaymentMethods": ["cash", "card"]}	2025-09-01 05:46:19.041	2025-09-01 05:46:19.041	\N	\N
c8fc6fd5-7aac-44ce-89e0-7921a4f902ad	delivergy	{"ar": "ديليفرجي", "en": "Delivergy"}	https://integration.ishbek.com/Delivergy/Api/	\N	t	12	{multi_region}	35	3.50	1.00	25.00	{"region": "multi_regional", "currency": "USD", "features": ["combined_service", "multi_region_support"], "apiVersion": "v1", "deliveryTypes": ["standard_delivery", "express_delivery"], "operatingHours": {"end": "23:00", "start": "08:00"}, "orderTypeMapping": {"ffda8ae8-9d11-4f48-8095-64876c21e5d6": "delivergy"}, "supportedPaymentMethods": ["cash", "card"]}	2025-09-01 05:46:19.044	2025-09-01 05:46:19.044	\N	\N
d4b5794b-ae63-4153-8065-cd44e5002177	utrac	{"ar": "يو تراك", "en": "U-Trac Logistics"}	https://integration.ishbek.com/UTrac/Api/	\N	t	13	{logistics_tracking}	45	2.00	0.75	50.00	{"region": "logistics", "currency": "USD", "features": ["logistics_tracking", "bulk_delivery", "tracking_service"], "apiVersion": "v1", "operatingHours": {"end": "24/7", "start": "24/7"}, "orderTypeMapping": {"5d6b3235-eb0f-456f-82df-e981703f601e": "utrac"}, "supportedPaymentMethods": ["cash", "card"]}	2025-09-01 05:46:19.047	2025-09-01 05:46:19.047	\N	\N
43c0eee8-8768-42b4-b136-a89effa2f673	local_delivery	{"ar": "التوصيل المحلي", "en": "Local Delivery"}	\N	\N	t	14	{restaurant_managed}	30	1.50	0.50	10.00	{"region": "restaurant_managed", "currency": "variable", "features": ["restaurant_managed", "flexible_payment", "local_coverage"], "apiVersion": "internal", "deliveryTypes": ["local_delivery", "pay_at_vendor", "pay_at_pickup"], "operatingHours": {"end": "restaurant_hours", "start": "restaurant_hours"}, "supportedPaymentMethods": ["cash", "card", "pay_at_vendor", "pay_at_pickup"]}	2025-09-01 05:46:19.05	2025-09-01 05:46:19.05	\N	\N
\.


--
-- Data for Name: jordan_locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jordan_locations (id, governorate, city, district, area_name_en, area_name_ar, postal_code, delivery_difficulty, average_delivery_fee, lat, lng, is_active, created_at, updated_at) FROM stdin;
8d85aff0-9d15-4405-93d5-f2126c08b005	Amman	Amman	Downtown	Downtown Amman	وسط عمان	11181	2	3.50	31.95390000	35.91060000	t	2025-08-31 23:59:06.031	2025-08-31 23:59:06.031
63d93f55-5948-40a4-9b39-ffa2fae6683f	Amman	Amman	Abdali	Abdali	العبدلي	11190	1	4.00	31.96280000	35.90940000	t	2025-08-31 23:59:06.035	2025-08-31 23:59:06.035
4176e7a3-be58-4381-a8e4-3c986bf8cb29	Amman	Amman	Sweifieh	Sweifieh	الصويفية	11190	2	4.50	31.93420000	35.87560000	t	2025-08-31 23:59:06.038	2025-08-31 23:59:06.038
6471e057-8949-42f3-94ef-fb6a4c3f9c29	Amman	Amman	Jabal Amman	Jabal Amman	جبل عمان	11118	3	5.00	31.95150000	35.92390000	t	2025-08-31 23:59:06.04	2025-08-31 23:59:06.04
7d32fe8b-cf00-4f06-92aa-a01ab899c25b	Zarqa	Zarqa	Center	Zarqa Center	وسط الزرقاء	13110	3	6.00	32.07280000	36.08800000	t	2025-08-31 23:59:06.042	2025-08-31 23:59:06.042
3df6ab10-20a2-4c13-b17e-56633b04a76a	Amman	عمان	\N	rsd	sadas	\N	2	1.00	\N	\N	t	2025-09-01 14:51:54.92	2025-09-01 14:51:54.92
a190c827-9ef9-418a-bbb7-b17250d91de3	Amman	عمان	\N	test11	test11	\N	1	2.50	\N	\N	t	2025-09-01 14:52:25.804	2025-09-01 14:52:25.804
a4e8c22c-20b7-494b-ba3b-7c0665e93fd0	Zarqa	الزرقاء	\N	test11	test11	\N	2	1.00	\N	\N	t	2025-09-01 15:13:59.778	2025-09-01 15:13:59.778
6313d094-7613-4d7f-8632-1fe855a2c2de	Amman	عمان	\N	test23123	test12312312	\N	2	1.00	\N	\N	t	2025-09-01 15:21:44.405	2025-09-01 15:21:44.405
b7d48851-b720-4003-b189-5659665187dd	Amman	عمان	\N	qq	qq	\N	2	2.50	\N	\N	t	2025-09-01 15:22:13.949	2025-09-01 15:22:13.949
b1d8bf73-bed6-4384-b8ca-6c54f63b26a6	Amman	عمان	\N	essa1	essa1	\N	2	2.50	\N	\N	t	2025-09-01 15:34:34.409	2025-09-01 15:34:34.409
d87ee17d-4dfe-4b52-9e52-64461698a004	Amman	عمان	\N	essa2	essa2	\N	2	1.00	\N	\N	t	2025-09-01 15:38:20.008	2025-09-01 15:38:20.008
\.


--
-- Data for Name: _DeliveryProviderToJordanLocation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_DeliveryProviderToJordanLocation" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b04d20a1-d159-4557-98ec-cfc71fa367e4	9b74bf893984da597f5ef9637730cf3afd7b1bf795f6d929a38fd4da8ee3ff83	2025-09-01 22:32:16.869909+00	20250901223013_add_provider_configuration_models		\N	2025-09-01 22:32:16.869909+00	0
cd465b02-d1ee-43ca-8078-7f64a5f839b7	9d4d0dcdd7f65de0075929143471e820e4d9acace752e7e68e3ea242a7cfe634	\N	20250902000001_delivery_system_optimizations	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250902000001_delivery_system_optimizations\n\nDatabase error code: 25001\n\nDatabase error:\nERROR: CREATE INDEX CONCURRENTLY cannot run inside a transaction block\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E25001), message: "CREATE INDEX CONCURRENTLY cannot run inside a transaction block", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("xact.c"), line: Some(3590), routine: Some("PreventInTransactionBlock") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250902000001_delivery_system_optimizations"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20250902000001_delivery_system_optimizations"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226	2025-09-02 16:33:33.821937+00	2025-09-02 16:33:06.726696+00	0
97fc547e-4637-48f7-9445-bef3e876e40e	c44779236f4618026e42d61876d9e5e3a9facb3128bc2a270b7432528932ee17	2025-09-02 16:33:33.823831+00	20250902000001_delivery_system_optimizations		\N	2025-09-02 16:33:33.823831+00	0
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branches (id, company_id, name, phone, email, address, city, country, latitude, longitude, is_default, is_active, allows_online_orders, allows_delivery, allows_pickup, timezone, created_at, updated_at, deleted_at, created_by, updated_by, name_ar, open_time, close_time) FROM stdin;
40f863e7-b719-4142-8e94-724572002d9b	dc3c6a10-96c6-4467-9778-313af66956af	Main Office	\N	\N	\N	\N	\N	\N	\N	t	t	t	t	t	Asia/Amman	2025-08-27 09:04:10.179	2025-08-27 09:04:10.179	\N	\N	\N	Main Office	\N	\N
f97ceb38-c797-4d1c-9ff4-89d9f8da5235	82b4039a-f9f3-4648-b3e1-23397d83af61	Company B Main Branch	\N	\N	\N	\N	\N	\N	\N	f	t	t	t	t	Asia/Amman	2025-08-29 08:32:37.531	2025-08-29 08:32:37.531	\N	\N	\N	الفرع الرئيسي ب	\N	\N
f3d4114a-0e39-43fd-aa98-01b57df7efd0	82b4039a-f9f3-4648-b3e1-23397d83af61	Company B Secondary	\N	\N	\N	\N	\N	\N	\N	f	t	t	t	t	Asia/Amman	2025-08-29 08:32:37.531	2025-08-29 08:32:37.531	\N	\N	\N	الفرع الثانوي ب	\N	\N
eb4d5daa-c58c-4369-a454-047db8ac3f50	dc3c6a10-96c6-4467-9778-313af66956af	Default Restaurant	+962444444441	\N	21313	amma	Jordan	31.94333322	35.91626025	f	t	t	t	t	Asia/Amman	2025-08-29 19:48:09.722	2025-08-29 19:48:09.722	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	الفرع الرئيسي	19:49	23:48
c91db38e-ef89-44c6-8f7d-57de5e91d903	dc3c6a10-96c6-4467-9778-313af66956af	ss	+962444444444	\N	wqejnwkp39	amma	Jordan	32.01672005	35.85926868	f	t	t	t	t	Asia/Amman	2025-08-30 18:24:57.476	2025-08-30 18:24:57.476	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	ss	20:24	12:24
b558e6c0-0866-4acd-9693-7c0a502e9df7	dc3c6a10-96c6-4467-9778-313af66956af	test	+962123456789	\N	wqejnwkp39	amma	Jordan	31.93055735	36.00758411	f	t	t	f	f	Asia/Amman	2025-08-28 21:15:30.596	2025-09-01 08:11:40.247	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	1ec02dec-9a81-473a-9cdf-31454e2e959a	UPDATED ARABIC NAME	08:00	22:00
\.


--
-- Data for Name: company_provider_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_provider_configs (id, company_id, provider_type, configuration, credentials, is_active, priority, max_distance, base_fee, fee_per_km, avg_delivery_time, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: branch_provider_mappings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branch_provider_mappings (id, branch_id, company_provider_config_id, provider_branch_id, provider_site_id, branch_configuration, is_active, priority, min_order_value, max_order_value, supported_payment_methods, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: delivery_error_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_error_logs (id, company_id, provider_type, error_type, error_code, error_message, request_payload, response_payload, retry_count, resolved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: delivery_provider_analytics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_provider_analytics (id, company_id, provider_type, date, total_orders, successful_orders, failed_orders, cancelled_orders, total_revenue, total_delivery_fee, average_delivery_time, customer_ratings_sum, customer_ratings_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: delivery_provider_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_provider_orders (id, company_id, branch_id, delivery_provider_id, provider_order_id, order_number, order_status, order_details, customer_details, delivery_address, webhook_data, is_processed, error_message, created_at, updated_at, actual_delivery_time, delivery_attempts, estimated_delivery_time, failure_reason, last_status_check, provider_fee_charged, tracking_number, webhook_retries) FROM stdin;
\.


--
-- Data for Name: global_locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.global_locations (id, country_name, country_name_ar, governorate, city_name, city_name_ar, area_name, area_name_ar, sub_area_name, sub_area_name_ar, latitude, longitude, search_text, is_active, delivery_difficulty, average_delivery_fee, created_at, updated_at) FROM stdin;
3ff6ed8b-a7cb-4b7f-a7ca-5cc7b778e9ae	Jordan	الأردن	Amman	عمان	عمان	طبربور	طبربور	عصائر رطب قلبك	عصائر رطب قلبك	\N	\N	عصائر رطب قلبك طبربور عمان	t	2	2.50	2025-09-01 11:57:19.192	2025-09-01 11:57:19.192
6048c956-17fa-40a2-9bd8-1a8beee329c7	Jordan	الأردن	Amman	عمان	عمان	test121	test121	\N	\N	\N	\N	\N	t	2	1.00	2025-09-01 16:04:06.117	2025-09-01 16:04:06.117
99915706-92f4-4c27-839d-5ceb12900c39	Jordan	الأردن	Amman	عمان	عمان	الشميساني	الشميساني	فندق الماريوت	فندق الماريوت	\N	\N	فندق الماريوت الشميساني عمان	t	2	2.50	2025-09-01 11:57:20.348	2025-09-01 11:57:20.348
fd78ddd7-85f3-4b3b-a720-74588a0cab35	Jordan	الأردن	Irbid	اربد	اربد	كتم	كتم	كتم	كتم	\N	\N	كتم كتم اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
7af2560a-e7d0-4afa-9df7-e598be29d4dd	Jordan	الأردن	Irbid	اربد	اربد	كريمه	كريمه	كريمة	كريمة	\N	\N	كريمة كريمه اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
94314803-b2da-4857-9b11-c671caba6758	Jordan	الأردن	Amman	عمان	عمان	العبدلي	العبدلي	قصر العدل	قصر العدل	\N	\N	قصر العدل العبدلي عمان	t	2	2.50	2025-09-01 11:57:20.919	2025-09-01 11:57:20.919
176c9ee2-c5a4-4a02-b740-df375a1ca954	Jordan	الأردن	Amman	عمان	عمان	وسط البلد	وسط البلد	جامع الحسيني	جامع الحسيني	\N	\N	جامع الحسيني وسط البلد عمان	t	2	2.50	2025-09-01 11:57:21.384	2025-09-01 11:57:21.384
88daef8b-0210-4db2-9e23-f2c3a20b0445	Jordan	الأردن	Amman	عمان	عمان	جبل الحسين	جبل الحسين	مخيم الحسين فندق توليدو	مخيم الحسين فندق توليدو	\N	\N	مخيم الحسين فندق توليدو جبل الحسين عمان	t	2	2.50	2025-09-01 11:57:21.526	2025-09-01 11:57:21.526
c54fa5c7-7298-4d8d-98ed-bfaecebc72ff	Jordan	الأردن	Amman	السلط	السلط	السلط	السلط	السرو	السرو	\N	\N	السرو السلط السلط	t	2	2.50	2025-09-01 11:57:22.992	2025-09-01 11:57:22.992
8e435b4c-2d05-4c16-8d21-ad506b232299	Jordan	الأردن	Amman	الزرقاء	الزرقاء	رمزي	رمزي	رمزي	رمزي	\N	\N	رمزي رمزي الزرقاء	t	2	2.50	2025-09-01 11:57:23.002	2025-09-01 11:57:23.002
bf98fc5c-4a41-4975-ba8b-651337a40173	Jordan	الأردن	Amman	الزرقاء	الزرقاء	حي المعصوم	حي المعصوم	مدارس مانشستر الانجليزية	مدارس مانشستر الانجليزية	\N	\N	مدارس مانشستر الانجليزية حي المعصوم الزرقاء	t	2	2.50	2025-09-01 11:57:23.012	2025-09-01 11:57:23.012
999bd6b7-f5ee-448b-a86d-2a5324d15f30	Jordan	الأردن	Amman	الزرقاء	الزرقاء	اسكان البتراوي	اسكان البتراوي	مدرسه البترواي الجنوبية	مدرسه البترواي الجنوبية	\N	\N	مدرسه البترواي الجنوبية اسكان البتراوي الزرقاء	t	2	2.50	2025-09-01 11:57:23.026	2025-09-01 11:57:23.026
e415f9a6-d75b-4510-95fa-f0bb5a978e8b	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الامير شاكر	الامير شاكر	مدرسه مسلمه بن عبدالملك	مدرسه مسلمه بن عبدالملك	\N	\N	مدرسه مسلمه بن عبدالملك الامير شاكر الزرقاء	t	2	2.50	2025-09-01 11:57:23.044	2025-09-01 11:57:23.044
220a7a55-40a6-42ae-98e3-db648621b792	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الباستين	الباستين	مسجد اسماء بنت ابي بكر الصديق	مسجد اسماء بنت ابي بكر الصديق	\N	\N	مسجد اسماء بنت ابي بكر الصديق الباستين الزرقاء	t	2	2.50	2025-09-01 11:57:23.055	2025-09-01 11:57:23.055
fe7ffda5-183c-4a20-86e6-5100fa380b6e	Jordan	الأردن	Amman	الزرقاء	الزرقاء	القمر	القمر	مسجد المجاهدين	مسجد المجاهدين	\N	\N	مسجد المجاهدين القمر الزرقاء	t	2	2.50	2025-09-01 11:57:23.065	2025-09-01 11:57:23.065
27dbf366-1e61-4f90-93ac-f5515406cc44	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الامر حمزه	الامر حمزه	مسجد معاذ بن جبل رضي الله عنه	مسجد معاذ بن جبل رضي الله عنه	\N	\N	مسجد معاذ بن جبل رضي الله عنه الامر حمزه الزرقاء	t	2	2.50	2025-09-01 11:57:23.094	2025-09-01 11:57:23.094
f6e88fec-742f-4dea-9565-812bc2184855	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الجبل الابيض	الجبل الابيض	مسجد علي بن ابي طالب رضي الله عنه	مسجد علي بن ابي طالب رضي الله عنه	\N	\N	مسجد علي بن ابي طالب رضي الله عنه الجبل الابيض الزرقاء	t	2	2.50	2025-09-01 11:57:23.103	2025-09-01 11:57:23.103
b886d58e-0b63-477d-9e65-f5b5a34551b7	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الاميره رحمه	الاميره رحمه	مدرسه المراد النموذجية	مدرسه المراد النموذجية	\N	\N	مدرسه المراد النموذجية الاميره رحمه الزرقاء	t	2	2.50	2025-09-01 11:57:23.111	2025-09-01 11:57:23.111
dbc3a59b-ea8d-447f-90f7-6ec939f9d4e7	Jordan	الأردن	Amman	الزرقاء	الزرقاء	ام بياضه	ام بياضه	مسجد خليل الرحمان	مسجد خليل الرحمان	\N	\N	مسجد خليل الرحمان ام بياضه الزرقاء	t	2	2.50	2025-09-01 11:57:23.121	2025-09-01 11:57:23.121
beda0e35-5baa-45e5-8313-de41163f5665	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الامير حسن	الامير حسن	سوبر ماركت جنه الريان	سوبر ماركت جنه الريان	\N	\N	سوبر ماركت جنه الريان الامير حسن الزرقاء	t	2	2.50	2025-09-01 11:57:23.142	2025-09-01 11:57:23.142
f1834156-4c66-4db5-b041-3182c345c9cb	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الفلاح	الفلاح	مسجد المهاجرين	مسجد المهاجرين	\N	\N	مسجد المهاجرين الفلاح الزرقاء	t	2	2.50	2025-09-01 11:57:23.15	2025-09-01 11:57:23.15
f76f0dce-580c-4cc4-9f46-f208eb4c81bf	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الدويك	الدويك	مدرسه الفلاح الاسلاميه	مدرسه الفلاح الاسلاميه	\N	\N	مدرسه الفلاح الاسلاميه الدويك الزرقاء	t	2	2.50	2025-09-01 11:57:23.158	2025-09-01 11:57:23.158
df3b8060-ccec-4fac-aad2-0f70231c6570	Jordan	الأردن	Amman	الزرقاء	الزرقاء	مكه المكرمه	مكه المكرمه	خزان مياه القادسيه	خزان مياه القادسيه	\N	\N	خزان مياه القادسيه مكه المكرمه الزرقاء	t	2	2.50	2025-09-01 11:57:23.164	2025-09-01 11:57:23.164
ee578e97-1671-4763-8b17-d6f95ac150a8	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الاحمد	الاحمد	مسجد سعد بن ربيعه رضي الله عنه	مسجد سعد بن ربيعه رضي الله عنه	\N	\N	مسجد سعد بن ربيعه رضي الله عنه الاحمد الزرقاء	t	2	2.50	2025-09-01 11:57:23.175	2025-09-01 11:57:23.175
6e4de780-79fa-4c59-a7dc-492c659506ba	Jordan	الأردن	Amman	الزرقاء	الزرقاء	نصار	نصار	مسجد اويس القرني	مسجد اويس القرني	\N	\N	مسجد اويس القرني نصار الزرقاء	t	2	2.50	2025-09-01 11:57:23.182	2025-09-01 11:57:23.182
c167cb7d-74ae-42ad-bc8f-ab8eab00bc0d	Jordan	الأردن	Amman	الزرقاء	الزرقاء	بيرين	بيرين	مدرسه الكبرى	مدرسه الكبرى	\N	\N	مدرسه الكبرى بيرين الزرقاء	t	2	2.50	2025-09-01 11:57:23.191	2025-09-01 11:57:23.191
5f00e942-e61a-4ede-9044-d8ecb64f0bfe	Jordan	الأردن	Amman	الزرقاء	الزرقاء	قرطبه	قرطبه	مسجد السعدي	مسجد السعدي	\N	\N	مسجد السعدي قرطبه الزرقاء	t	2	2.50	2025-09-01 11:57:23.204	2025-09-01 11:57:23.204
38be6355-d8c2-46e0-a508-3bd21e8eafe1	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الجنينه	الجنينه	مسجد جميل سالم عياش	مسجد جميل سالم عياش	\N	\N	مسجد جميل سالم عياش الجنينه الزرقاء	t	2	2.50	2025-09-01 11:57:23.214	2025-09-01 11:57:23.214
1d5a3298-b9a5-4836-9f54-eedf0d458442	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الشومر	الشومر	مسجد الاسراء	مسجد الاسراء	\N	\N	مسجد الاسراء الشومر الزرقاء	t	2	2.50	2025-09-01 11:57:23.222	2025-09-01 11:57:23.222
f7001428-e4d5-49af-9642-d4802256158e	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الزرقاء الجديده	الزرقاء الجديده	بادي	بادي	\N	\N	بادي الزرقاء الجديده الزرقاء	t	2	2.50	2025-09-01 11:57:23.234	2025-09-01 11:57:23.234
94b7c498-3497-4c9f-bf2a-e66ec978e616	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الهاشميه	الهاشميه	مسجد زيد ابن الخطاب	مسجد زيد ابن الخطاب	\N	\N	مسجد زيد ابن الخطاب الهاشميه الزرقاء	t	2	2.50	2025-09-01 11:57:23.26	2025-09-01 11:57:23.26
6e296595-9118-497b-86ed-2d8b81e16402	Jordan	الأردن	Amman	الزرقاء	الزرقاء	البستان	البستان	معرض العاروري للبلاط	معرض العاروري للبلاط	\N	\N	معرض العاروري للبلاط البستان الزرقاء	t	2	2.50	2025-09-01 11:57:23.271	2025-09-01 11:57:23.271
ba491def-5c9f-425a-8fdf-fd4ccac6b60e	Jordan	الأردن	Amman	الزرقاء	الزرقاء	النصر	النصر	مسجد ابن قيم	مسجد ابن قيم	\N	\N	مسجد ابن قيم النصر الزرقاء	t	2	2.50	2025-09-01 11:57:23.285	2025-09-01 11:57:23.285
ea92f180-8dae-4b8a-870e-0468e230bd8e	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الحديقه	الحديقه	مديريه الصحه الزرقاء	مديريه الصحه الزرقاء	\N	\N	مديريه الصحه الزرقاء الحديقه الزرقاء	t	2	2.50	2025-09-01 11:57:23.312	2025-09-01 11:57:23.312
9cd13755-1535-4b8c-b641-8d6d0fd1942e	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الغويريه	الغويريه	مدرسه الثوره العربيه الكبرى	مدرسه الثوره العربيه الكبرى	\N	\N	مدرسه الثوره العربيه الكبرى الغويريه الزرقاء	t	2	2.50	2025-09-01 11:57:23.319	2025-09-01 11:57:23.319
9cf91557-b41e-4c22-8b04-cb9cdd44cd65	Jordan	الأردن	Amman	الزرقاء	الزرقاء	حي الامير محمد	حي الامير محمد	مدرسه ابن طولون الاساسيه للبنين	مدرسه ابن طولون الاساسيه للبنين	\N	\N	مدرسه ابن طولون الاساسيه للبنين حي الامير محمد الزرقاء	t	2	2.50	2025-09-01 11:57:23.33	2025-09-01 11:57:23.33
16ca637e-eef1-48b8-be21-5d138f7758c0	Jordan	الأردن	Amman	الزرقاء	الزرقاء	ضاحيه المدينه المنوره	ضاحيه المدينه المنوره	مسجد اولياء الله	مسجد اولياء الله	\N	\N	مسجد اولياء الله ضاحيه المدينه المنوره الزرقاء	t	2	2.50	2025-09-01 11:57:23.348	2025-09-01 11:57:23.348
47253cd6-280b-4998-bc59-03d481a4e0db	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الزواهره	الزواهره	الدلة	الدلة	\N	\N	الدلة الزواهره الزرقاء	t	2	2.50	2025-09-01 11:57:23.369	2025-09-01 11:57:23.369
852c504a-264a-456b-ac0f-977296557ee3	Jordan	الأردن	Amman	الزرقاء	الزرقاء	جبل المغير	جبل المغير	جبل المغير الجنوبي	جبل المغير الجنوبي	\N	\N	جبل المغير الجنوبي جبل المغير الزرقاء	t	2	2.50	2025-09-01 11:57:23.391	2025-09-01 11:57:23.391
02259a0c-e846-42c6-a716-f392e2a74eeb	Jordan	الأردن	Amman	الزرقاء	الزرقاء	عوجان	عوجان	عوجان	عوجان	\N	\N	عوجان عوجان الزرقاء	t	2	2.50	2025-09-01 11:57:23.437	2025-09-01 11:57:23.437
0d8fe137-983c-4128-92c0-025a8d25bbee	Jordan	الأردن	Amman	الزرقاء	الزرقاء	جناعه	جناعه	جناعة	جناعة	\N	\N	جناعة جناعه الزرقاء	t	2	2.50	2025-09-01 11:57:23.457	2025-09-01 11:57:23.457
b35c47f2-e3d7-4d55-aa51-f8dcd7757fa2	Jordan	الأردن	Amman	الزرقاء	الزرقاء	مدينه الشرق	مدينه الشرق	مدينه الشرق	مدينه الشرق	\N	\N	مدينه الشرق مدينه الشرق الزرقاء	t	2	2.50	2025-09-01 11:57:23.472	2025-09-01 11:57:23.472
65ad02f5-041b-45aa-bfc0-7e675e6a5023	Jordan	الأردن	Amman	الزرقاء	الزرقاء	حي الرشيد-الرصيفه	حي الرشيد-الرصيفه	حي الرشيد-الرصيفة	حي الرشيد-الرصيفة	\N	\N	حي الرشيد-الرصيفة حي الرشيد-الرصيفه الزرقاء	t	2	2.50	2025-09-01 11:57:23.49	2025-09-01 11:57:23.49
396206d4-c8bd-4b41-9b83-7fd479115e57	Jordan	الأردن	Amman	الزرقاء	الزرقاء	حي الاسكان	حي الاسكان	سوبر ماركت ابوعزام	سوبر ماركت ابوعزام	\N	\N	سوبر ماركت ابوعزام حي الاسكان الزرقاء	t	2	2.50	2025-09-01 11:57:23.499	2025-09-01 11:57:23.499
6ee74130-77db-4eac-becd-b50aff73eb96	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الملك طلال	الملك طلال	المؤسسه المثاليه لقطع الكهرباء	المؤسسه المثاليه لقطع الكهرباء	\N	\N	المؤسسه المثاليه لقطع الكهرباء الملك طلال الزرقاء	t	2	2.50	2025-09-01 11:57:23.508	2025-09-01 11:57:23.508
6ded037e-2ccb-4d4b-bda3-7f035cba2077	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الجبر	الجبر	مطعم محمد طافش	مطعم محمد طافش	\N	\N	مطعم محمد طافش الجبر الزرقاء	t	2	2.50	2025-09-01 11:57:23.515	2025-09-01 11:57:23.515
c1adc9d4-b44c-4f35-8d0a-fff74be930c7	Jordan	الأردن	Amman	الزرقاء	الزرقاء	حي الحسين	حي الحسين	مكتب المتحدةه للصرافة	مكتب المتحدةه للصرافة	\N	\N	مكتب المتحدةه للصرافة حي الحسين الزرقاء	t	2	2.50	2025-09-01 11:57:23.522	2025-09-01 11:57:23.522
4d17e0f8-b699-4afa-b883-e325e46397bc	Jordan	الأردن	Amman	الزرقاء	الزرقاء	حي النزهه	حي النزهه	سوبر ماركت الشريف	سوبر ماركت الشريف	\N	\N	سوبر ماركت الشريف حي النزهه الزرقاء	t	2	2.50	2025-09-01 11:57:23.531	2025-09-01 11:57:23.531
387fb381-7d75-4afe-b2d7-e4fb7ef89636	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الجامعه الهاشميه	الجامعه الهاشميه	بنك القاهره عمان	بنك القاهره عمان	\N	\N	بنك القاهره عمان الجامعه الهاشميه الزرقاء	t	2	2.50	2025-09-01 11:57:23.561	2025-09-01 11:57:23.561
1fa32d6e-3dc3-4d1a-9c0a-83842487249d	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الحرفيين	الحرفيين	كراج غسان عشور تجليس ودهان	كراج غسان عشور تجليس ودهان	\N	\N	كراج غسان عشور تجليس ودهان الحرفيين الزرقاء	t	2	2.50	2025-09-01 11:57:23.566	2025-09-01 11:57:23.566
6d25c24d-ec62-4801-80d2-1a06451498c8	Jordan	الأردن	Amman	الزرقاء	الزرقاء	المصانع	المصانع	مسجد الحسن بن علي	مسجد الحسن بن علي	\N	\N	مسجد الحسن بن علي المصانع الزرقاء	t	2	2.50	2025-09-01 11:57:23.572	2025-09-01 11:57:23.572
b4680ace-9834-4796-af21-4404e17d4428	Jordan	الأردن	Amman	الزرقاء	الزرقاء	حي الجندي	حي الجندي	مدرسه زينب الاسديه الثانويه للبنات	مدرسه زينب الاسديه الثانويه للبنات	\N	\N	مدرسه زينب الاسديه الثانويه للبنات حي الجندي الزرقاء	t	2	2.50	2025-09-01 11:57:23.579	2025-09-01 11:57:23.579
0d84956a-400e-418e-b680-ca0f3b6e68fa	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الضباط	الضباط	مجدي ابولاوي للادوات الصحيه	مجدي ابولاوي للادوات الصحيه	\N	\N	مجدي ابولاوي للادوات الصحيه الضباط الزرقاء	t	2	2.50	2025-09-01 11:57:23.592	2025-09-01 11:57:23.592
6fb0aa55-dd52-46c0-9d94-70a7474c98ec	Jordan	الأردن	Amman	الزرقاء	الزرقاء	الزرقاء	الزرقاء	طريق 100	طريق 100	\N	\N	طريق 100 الزرقاء الزرقاء	t	2	2.50	2025-09-01 11:57:23.603	2025-09-01 11:57:23.603
fb4b9e6b-b57b-4723-9bf8-6d3b65852bd4	Jordan	الأردن	Amman	الزرقاء	الزرقاء	حي شبيب	حي شبيب	الزرقاء حي شبيب	الزرقاء حي شبيب	\N	\N	الزرقاء حي شبيب حي شبيب الزرقاء	t	2	2.50	2025-09-01 11:57:23.69	2025-09-01 11:57:23.69
41eb1d68-e9af-4cea-a95e-b5952f705edf	Jordan	الأردن	Amman	اربد	اربد	الاشرفيه	الاشرفيه	طلوع المصدار	طلوع المصدار	\N	\N	طلوع المصدار الاشرفيه اربد	t	2	2.50	2025-09-01 11:57:23.696	2025-09-01 11:57:23.696
a151c48b-94cd-4eb6-9fd4-89fa1f37fec8	Jordan	الأردن	Amman	اربد	اربد	حي الاطباء	حي الاطباء	مسجد علياء التل	مسجد علياء التل	\N	\N	مسجد علياء التل حي الاطباء اربد	t	2	2.50	2025-09-01 11:57:23.734	2025-09-01 11:57:23.734
915c798b-e3a4-4234-a5d7-49f59e763f0f	Jordan	الأردن	Amman	اربد	اربد	الجامعه	الجامعه	الجامعة	الجامعة	\N	\N	الجامعة الجامعه اربد	t	2	2.50	2025-09-01 11:57:23.768	2025-09-01 11:57:23.768
6f81df14-4ca3-4276-9304-bae6f2979761	Jordan	الأردن	Amman	اربد	اربد	السلام	السلام	السلام	السلام	\N	\N	السلام السلام اربد	t	2	2.50	2025-09-01 11:57:23.82	2025-09-01 11:57:23.82
b23a8ab6-dae4-404a-9cd5-86cae6d3de39	Jordan	الأردن	Amman	اربد	اربد	النظيف	النظيف	مسجد المرعي	مسجد المرعي	\N	\N	مسجد المرعي النظيف اربد	t	2	2.50	2025-09-01 11:57:23.829	2025-09-01 11:57:23.829
26099bac-9c6e-48bd-8df1-68d421a57e1c	Jordan	الأردن	Amman	اربد	اربد	الاندلس	الاندلس	بنك الاسكان	بنك الاسكان	\N	\N	بنك الاسكان الاندلس اربد	t	2	2.50	2025-09-01 11:57:23.85	2025-09-01 11:57:23.85
0d7a8172-3b04-4187-9ac2-aad6d93ace97	Jordan	الأردن	Amman	اربد	اربد	حنينا	حنينا	مسجد البشتاوي	مسجد البشتاوي	\N	\N	مسجد البشتاوي حنينا اربد	t	2	2.50	2025-09-01 11:57:23.865	2025-09-01 11:57:23.865
26eb446d-19df-4225-93ab-282bd6064399	Jordan	الأردن	Amman	اربد	اربد	اليرموك	اليرموك	مسجد ال الشيخ مبارك	مسجد ال الشيخ مبارك	\N	\N	مسجد ال الشيخ مبارك اليرموك اربد	t	2	2.50	2025-09-01 11:57:23.9	2025-09-01 11:57:23.9
ec4251c4-383b-4c4b-afa0-a5a6ccd92c29	Jordan	الأردن	Amman	اربد	اربد	التل	التل	ديوان الخدمه المدنية	ديوان الخدمه المدنية	\N	\N	ديوان الخدمه المدنية التل اربد	t	2	2.50	2025-09-01 11:57:23.916	2025-09-01 11:57:23.916
785d7d19-3af2-4d4f-93b3-f931b0a7f753	Jordan	الأردن	Amman	اربد	اربد	حي الافراح	حي الافراح	البنك الاسلامي الاردني	البنك الاسلامي الاردني	\N	\N	البنك الاسلامي الاردني حي الافراح اربد	t	2	2.50	2025-09-01 11:57:23.935	2025-09-01 11:57:23.935
0b4c24b7-380f-4aee-9ce8-0b374de2a192	Jordan	الأردن	Amman	اربد	اربد	العوده	العوده	مقبره مخيم اربد	مقبره مخيم اربد	\N	\N	مقبره مخيم اربد العوده اربد	t	2	2.50	2025-09-01 11:57:23.963	2025-09-01 11:57:23.963
f962ecbc-1080-4732-88b3-033c12eb1362	Jordan	الأردن	Amman	اربد	اربد	البقعه	البقعه	البقعه	البقعه	\N	\N	البقعه البقعه اربد	t	2	2.50	2025-09-01 11:57:23.986	2025-09-01 11:57:23.986
86cb608e-c8f8-41da-b054-65165790d5d4	Jordan	الأردن	Amman	اربد	اربد	جديد	جديد	مدرسه زبده فركوح الاساسيه المختلطة	مدرسه زبده فركوح الاساسيه المختلطة	\N	\N	مدرسه زبده فركوح الاساسيه المختلطة جديد اربد	t	2	2.50	2025-09-01 11:57:23.993	2025-09-01 11:57:23.993
c4ef0439-154b-4402-bf9c-0f92b5cd5283	Jordan	الأردن	Amman	اربد	اربد	البياضه	البياضه	دوار البياضة	دوار البياضة	\N	\N	دوار البياضة البياضه اربد	t	2	2.50	2025-09-01 11:57:24.005	2025-09-01 11:57:24.005
e560c34a-a62a-4521-9654-70e9d2429b45	Jordan	الأردن	Amman	اربد	اربد	السعاده	السعاده	مسجد خليل الرحمن	مسجد خليل الرحمن	\N	\N	مسجد خليل الرحمن السعاده اربد	t	2	2.50	2025-09-01 11:57:24.014	2025-09-01 11:57:24.014
a320442d-8b55-4843-9be1-e4d479a1709b	Jordan	الأردن	Amman	اربد	اربد	السهل الاخضر	السهل الاخضر	مسجد التقوى	مسجد التقوى	\N	\N	مسجد التقوى السهل الاخضر اربد	t	2	2.50	2025-09-01 11:57:24.032	2025-09-01 11:57:24.032
eba1fa49-1ebc-47e1-b9e6-0269d4124d9a	Jordan	الأردن	Amman	اربد	اربد	الصحه	الصحه	مسجد بيعه الرضوان	مسجد بيعه الرضوان	\N	\N	مسجد بيعه الرضوان الصحه اربد	t	2	2.50	2025-09-01 11:57:24.046	2025-09-01 11:57:24.046
a5166f84-28b7-4de9-962e-fce53bc25dd0	Jordan	الأردن	Amman	اربد	اربد	الصوانيه	الصوانيه	مسجد ابراهيم الخليل	مسجد ابراهيم الخليل	\N	\N	مسجد ابراهيم الخليل الصوانيه اربد	t	2	2.50	2025-09-01 11:57:24.059	2025-09-01 11:57:24.059
dfa36404-4fde-4142-bf3b-00aa184bb4c0	Jordan	الأردن	Amman	اربد	اربد	حي الابرار	حي الابرار	مسجد الابرار	مسجد الابرار	\N	\N	مسجد الابرار حي الابرار اربد	t	2	2.50	2025-09-01 11:57:24.068	2025-09-01 11:57:24.068
5a08bc1f-b346-4033-a18b-b668781eac4d	Jordan	الأردن	Amman	اربد	اربد	المطلع	المطلع	مسجد عين جالوت	مسجد عين جالوت	\N	\N	مسجد عين جالوت المطلع اربد	t	2	2.50	2025-09-01 11:57:24.084	2025-09-01 11:57:24.084
a0ebfa87-ead6-45d5-866a-f3ca74e4b7fe	Jordan	الأردن	Amman	اربد	اربد	الهاشمي	الهاشمي	الهاشمي	الهاشمي	\N	\N	الهاشمي الهاشمي اربد	t	2	2.50	2025-09-01 11:57:24.118	2025-09-01 11:57:24.118
c8b347b6-55f8-4151-b479-b83da264a595	Jordan	الأردن	Amman	اربد	اربد	النصر	النصر	مسجد ابن قيم	مسجد ابن قيم	\N	\N	مسجد ابن قيم النصر اربد	t	2	2.50	2025-09-01 11:57:24.135	2025-09-01 11:57:24.135
88b73c6c-5aae-4ed5-a78b-7f4bf8b288f6	Jordan	الأردن	Amman	اربد	اربد	النزهه	النزهه	البنك الاسلامي الاردني	البنك الاسلامي الاردني	\N	\N	البنك الاسلامي الاردني النزهه اربد	t	2	2.50	2025-09-01 11:57:24.173	2025-09-01 11:57:24.173
52e822ec-6bea-4f13-9ae8-5f63584ffceb	Jordan	الأردن	Amman	اربد	اربد	الجامع	الجامع	بنك الاسكان	بنك الاسكان	\N	\N	بنك الاسكان الجامع اربد	t	2	2.50	2025-09-01 11:57:24.208	2025-09-01 11:57:24.208
8f85068a-f966-4209-96af-db2c8b488903	Jordan	الأردن	Amman	اربد	اربد	الملعب	الملعب	بنك الاردن دبي الاسلامي	بنك الاردن دبي الاسلامي	\N	\N	بنك الاردن دبي الاسلامي الملعب اربد	t	2	2.50	2025-09-01 11:57:24.221	2025-09-01 11:57:24.221
13a120a9-41b8-4de1-ae20-8d8a17e8f53d	Jordan	الأردن	Amman	اربد	اربد	المناره	المناره	صاله الاحمد	صاله الاحمد	\N	\N	صاله الاحمد المناره اربد	t	2	2.50	2025-09-01 11:57:24.245	2025-09-01 11:57:24.245
06537ce1-36be-41c0-92e1-ab777d4fdf5a	Jordan	الأردن	Amman	اربد	اربد	ضاحيه الامير راشد	ضاحيه الامير راشد	نادي السيارات	نادي السيارات	\N	\N	نادي السيارات ضاحيه الامير راشد اربد	t	2	2.50	2025-09-01 11:57:24.29	2025-09-01 11:57:24.29
6f44eb77-87e6-4eaf-a282-127c1965e86e	Jordan	الأردن	Amman	اربد	اربد	حي الورود	حي الورود	حي الورود	حي الورود	\N	\N	حي الورود حي الورود اربد	t	2	2.50	2025-09-01 11:57:24.349	2025-09-01 11:57:24.349
216570ca-054c-47ae-aec0-2cfe2fd154a7	Jordan	الأردن	Amman	اربد	اربد	الزهراء	الزهراء	محطه توتال	محطه توتال	\N	\N	محطه توتال الزهراء اربد	t	2	2.50	2025-09-01 11:57:24.374	2025-09-01 11:57:24.374
e0cd36df-9c91-41e1-b46e-0105436fd036	Jordan	الأردن	Amman	اربد	اربد	الحكمه	الحكمه	مدرسه القادسيه للبنات	مدرسه القادسيه للبنات	\N	\N	مدرسه القادسيه للبنات الحكمه اربد	t	2	2.50	2025-09-01 11:57:24.389	2025-09-01 11:57:24.389
2c51baa5-062d-459c-afbe-a32e2435ffcb	Jordan	الأردن	Amman	اربد	اربد	الفضيله	الفضيله	مسجد المصطفى	مسجد المصطفى	\N	\N	مسجد المصطفى الفضيله اربد	t	2	2.50	2025-09-01 11:57:24.401	2025-09-01 11:57:24.401
dd34c5c9-a078-4eba-bfa5-e35d7366e64e	Jordan	الأردن	Amman	اربد	اربد	الروضه	الروضه	مدرسه تونس	مدرسه تونس	\N	\N	مدرسه تونس الروضه اربد	t	2	2.50	2025-09-01 11:57:24.413	2025-09-01 11:57:24.413
e8ca935e-13ba-4900-9406-6f7e88438d27	Jordan	الأردن	Amman	اربد	اربد	البساتين	البساتين	مسجد خليل الرحمن	مسجد خليل الرحمن	\N	\N	مسجد خليل الرحمن البساتين اربد	t	2	2.50	2025-09-01 11:57:24.428	2025-09-01 11:57:24.428
0c583b07-9aa6-418a-8f95-16010df40b58	Jordan	الأردن	Amman	اربد	اربد	الصناعه	الصناعه	حراج اربد	حراج اربد	\N	\N	حراج اربد الصناعه اربد	t	2	2.50	2025-09-01 11:57:24.438	2025-09-01 11:57:24.438
4d569688-097f-45cb-8d07-6fc77a190ab5	Jordan	الأردن	Amman	اربد	اربد	الميدان	الميدان	مسجد ابو هريرة	مسجد ابو هريرة	\N	\N	مسجد ابو هريرة الميدان اربد	t	2	2.50	2025-09-01 11:57:24.446	2025-09-01 11:57:24.446
fa4cc685-8bb9-40c1-90c5-e822efb1239c	Jordan	الأردن	Amman	اربد	اربد	الرابيه	الرابيه	اشاره الاتصالات اورانج	اشاره الاتصالات اورانج	\N	\N	اشاره الاتصالات اورانج الرابيه اربد	t	2	2.50	2025-09-01 11:57:24.497	2025-09-01 11:57:24.497
8ca28a49-c3e8-4246-af9f-58f094f3d5f0	Jordan	الأردن	Amman	اربد	اربد	اربد	اربد	مخابز ابو راشد	مخابز ابو راشد	\N	\N	مخابز ابو راشد اربد اربد	t	2	2.50	2025-09-01 11:57:24.56	2025-09-01 11:57:24.56
ae696579-c67c-4b6f-8e7f-5d04effb32cb	Jordan	الأردن	Amman	عمان	عمان	Abdali	العبدلي	الفريد	الفريد	\N	\N	الفريد العبدلي عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
fe357406-c3bc-47f5-b899-780ac50f6c8b	Jordan	الأردن	Amman	عمان	عمان	Downtown	وسط البلد	شارع بسمان	شارع بسمان	\N	\N	شارع بسمان وسط البلد عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
6913b57c-b119-4f87-ac64-c86b94dfc1ff	Jordan	الأردن	Irbid	اربد	اربد	Hashemi	الهاشمي	البنك الاسلامي الاردني	البنك الاسلامي الاردني	\N	\N	البنك الاسلامي الاردني الهاشمي اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
c13c8392-aca5-4267-a38a-d1e124268816	Jordan	الأردن	Amman	عمان	عمان	Jabal Hussein	جبل الحسين	مخيم الحسين مدرسه عمر بن الخطاب	مخيم الحسين مدرسه عمر بن الخطاب	\N	\N	مخيم الحسين مدرسه عمر بن الخطاب جبل الحسين عمان	t	4	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
906d3a01-29a0-4615-90fd-fca6c4cd963b	Jordan	الأردن	Irbid	اربد	اربد	Nasr	النصر	مدرسه نور الحسين	مدرسه نور الحسين	\N	\N	مدرسه نور الحسين النصر اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
91ad32fb-b4d9-4ced-8e09-252b5fe36357	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	Nasr	النصر	مسجد بلاط الشهداء	مسجد بلاط الشهداء	\N	\N	مسجد بلاط الشهداء النصر الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
9bc4a8f4-c6f0-464d-97b2-59aa701b41f8	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	القنيه	القنيه	القنية	القنية	\N	\N	القنية القنيه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
435cb868-961c-42fb-bfd1-53aa48403645	Jordan	الأردن	Amman	عمان	عمان	Shmeisani	الشميساني	فندق لا ماريديان	فندق لا ماريديان	\N	\N	فندق لا ماريديان الشميساني عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
14525980-b689-4361-8f20-04b33fbbeed0	Jordan	الأردن	Amman	عمان	عمان	Tabarbour	طبربور	ليالي الشرق	ليالي الشرق	\N	\N	ليالي الشرق طبربور عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
c0e6ebfc-3220-4bc5-9916-c0532edd9d75	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	أبو الزيغان	أبو الزيغان	أبو الزيغان	أبو الزيغان	\N	\N	أبو الزيغان أبو الزيغان الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
cfa37d8d-87b4-4ea2-a803-2c93ebefa4fb	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	أم صليح	أم صليح	أم صليح	أم صليح	\N	\N	أم صليح أم صليح الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
85bfa152-01c6-4ece-9907-c1400d820b9b	Jordan	الأردن	Irbid	اربد	اربد	ابان	ابان	ابان	ابان	\N	\N	ابان ابان اربد	t	2	3.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
f5e69f3f-26cc-4fd5-aa50-48ea6a4db1d4	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	ابن سينا 	ابن سينا 	ابن سينا	ابن سينا	\N	\N	ابن سينا ابن سينا  الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
3c30f0ed-39e6-47cc-af1a-485a609d0110	Jordan	الأردن	Amman	عمان	عمان	ابو علندا	ابو علندا	الصناعيه جسر المستنده	الصناعيه جسر المستنده	\N	\N	الصناعيه جسر المستنده ابو علندا عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
c0bcca6e-f499-46d7-a2a9-07b3b450add7	Jordan	الأردن	Amman	عمان	عمان	ابو عليا	ابو عليا	دوار الصحفيين	دوار الصحفيين	\N	\N	دوار الصحفيين ابو عليا عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
abd12fa4-516b-48e9-8c90-f64012d96d19	Jordan	الأردن	Amman	عمان	عمان	ابو نصير	ابو نصير	اشاره ابو نصير	اشاره ابو نصير	\N	\N	اشاره ابو نصير ابو نصير عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
de613e00-c329-47e8-a1a3-802798296410	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	اتوستراد	اتوستراد	اتوستراد	اتوستراد	\N	\N	اتوستراد اتوستراد الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
bf395ec3-f29d-45f1-bdc0-b637b8ad562b	Jordan	الأردن	Irbid	اربد	اربد	اربد	اربد	اربد شارع ابو راشد	اربد شارع ابو راشد	\N	\N	اربد شارع ابو راشد اربد اربد	t	2	3.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
1161f918-bc1e-4904-8478-75ad17802918	Jordan	الأردن	Irbid	اربد	اربد	اربد اشارة الدفاع	اربد اشارة الدفاع	اربد اشارة الدفاع	اربد اشارة الدفاع	\N	\N	اربد اشارة الدفاع اربد اشارة الدفاع اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
6d417b29-28c2-49ce-8fa5-9a9e108fcb8c	Jordan	الأردن	Irbid	اربد	اربد	اربد السوق	اربد السوق	اربد السوق	اربد السوق	\N	\N	اربد السوق اربد السوق اربد	t	2	3.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
5ff76011-8961-45ec-94d2-5ec44b101ee8	Jordan	الأردن	Irbid	اربد	اربد	اربد المحكمة الشرعية	اربد المحكمة الشرعية	اربد المحكمة الشرعية	اربد المحكمة الشرعية	\N	\N	اربد المحكمة الشرعية اربد المحكمة الشرعية اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
7c70edd7-0520-4a23-8eb7-6db11eae4593	Jordan	الأردن	Irbid	اربد	اربد	اربد بني كنانة -مستشفي اليرموك	اربد بني كنانة -مستشفي اليرموك	اربد بني كنانة -مستشفي اليرموك	اربد بني كنانة -مستشفي اليرموك	\N	\N	اربد بني كنانة -مستشفي اليرموك اربد بني كنانة -مستشفي اليرموك اربد	t	2	3.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
997ca1bd-ff2d-4248-be5a-b2c8e0e6fb2b	Jordan	الأردن	Irbid	اربد	اربد	اربد جبل المغير	اربد جبل المغير	اربد جبل المغير	اربد جبل المغير	\N	\N	اربد جبل المغير اربد جبل المغير اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
1987ee50-555c-42ff-b160-f8323ed6c141	Jordan	الأردن	Irbid	اربد	اربد	اربد دوار الام كي	اربد دوار الام كي	اربد دوار الام كي	اربد دوار الام كي	\N	\N	اربد دوار الام كي اربد دوار الام كي اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
6272cf8a-4c8c-4020-99c6-67ece654fed3	Jordan	الأردن	Irbid	اربد	اربد	اربد دوار مريسي	اربد دوار مريسي	اربد دوار مريسي	اربد دوار مريسي	\N	\N	اربد دوار مريسي اربد دوار مريسي اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5305a5dd-1ad5-409c-adeb-13e43cc32af7	Jordan	الأردن	Irbid	اربد	اربد	اربد شارع الحصن (عند هابي لاند)	اربد شارع الحصن (عند هابي لاند)	اربد شارع الحصن (عند هابي لاند)	اربد شارع الحصن (عند هابي لاند)	\N	\N	اربد شارع الحصن (عند هابي لاند) اربد شارع الحصن (عند هابي لاند) اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
373dc226-524d-4a77-acea-b29ccd462388	Jordan	الأردن	Irbid	اربد	اربد	اربد شارع فلسطين	اربد شارع فلسطين	اربد شارع فلسطين	اربد شارع فلسطين	\N	\N	اربد شارع فلسطين اربد شارع فلسطين اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
a8991787-7650-41d2-aee4-5ec08acc67de	Jordan	الأردن	Irbid	اربد	اربد	اربد ضاحية الحسن	اربد ضاحية الحسن	اربد ضاحية الحسن	اربد ضاحية الحسن	\N	\N	اربد ضاحية الحسن اربد ضاحية الحسن اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
a19bd19d-a228-46c9-82b4-b9bebba05359	Jordan	الأردن	Irbid	اربد	اربد	اربد(ضاحية الرشيد)	اربد(ضاحية الرشيد)	اربد(ضاحية الرشيد)	اربد(ضاحية الرشيد)	\N	\N	اربد(ضاحية الرشيد) اربد(ضاحية الرشيد) اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
34b3920b-50ab-46cc-b16e-4177a8efc334	Jordan	الأردن	Irbid	اربد	اربد	اربد كرم حجازي	اربد كرم حجازي	اربد كرم حجازي	اربد كرم حجازي	\N	\N	اربد كرم حجازي اربد كرم حجازي اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
9f97b69d-4a40-4c37-b088-b4c5266fef43	Jordan	الأردن	Irbid	اربد	اربد	اربد مخيم الشهيد	اربد مخيم الشهيد	اربد مخيم الشهيد	اربد مخيم الشهيد	\N	\N	اربد مخيم الشهيد اربد مخيم الشهيد اربد	t	4	4.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
fd68e0c4-ab5a-45eb-b768-6f95060e396d	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الباستين	الباستين	الباستين	الباستين	\N	\N	الباستين الباستين الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
71a0972f-235f-47ff-a656-216b0ac4d84d	Jordan	الأردن	Irbid	اربد	اربد	اربد مستشفى الأمير راشد	اربد مستشفى الأمير راشد	اربد مستشفى الأمير راشد	اربد مستشفى الأمير راشد	\N	\N	اربد مستشفى الأمير راشد اربد مستشفى الأمير راشد اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
2af4535c-f6c2-407d-93d0-c38d5d650dfe	Jordan	الأردن	Irbid	اربد	اربد	اربد مول	اربد مول	اربد مول	اربد مول	\N	\N	اربد مول اربد مول اربد	t	1	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
01202166-b571-4b3c-88df-9b75fdbef1bb	Jordan	الأردن	Irbid	اربد	اربد	ارحابا	ارحابا	ارحابا	ارحابا	\N	\N	ارحابا ارحابا اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
56af5578-827d-4fad-aba1-4f5fe450b629	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	اسكان البتراوي	اسكان البتراوي	انس مول للخضار والفواكه	انس مول للخضار والفواكه	\N	\N	انس مول للخضار والفواكه اسكان البتراوي الزرقاء	t	1	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
b240111d-f0aa-4d5d-8588-f50e7307325d	Jordan	الأردن	Irbid	اربد	اربد	اسكان الضباط	اسكان الضباط	اسكان الضباط	اسكان الضباط	\N	\N	اسكان الضباط اسكان الضباط اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
c9702572-6eb9-4427-a862-04068bb746ec	Jordan	الأردن	Irbid	اربد	اربد	اسكان العاملين	اسكان العاملين	اسكان العاملين	اسكان العاملين	\N	\N	اسكان العاملين اسكان العاملين اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
af107f23-02fd-468b-8a56-4571c0b193a1	Jordan	الأردن	Irbid	اربد	اربد	اسكان المهندسين	اسكان المهندسين	اسكان المهندسين	اسكان المهندسين	\N	\N	اسكان المهندسين اسكان المهندسين اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e782a6dd-70c9-48b5-8146-2e079361cac5	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	اسكان طلال-الرصيفه	اسكان طلال-الرصيفه	اسكان طلال-الرصيفة	اسكان طلال-الرصيفة	\N	\N	اسكان طلال-الرصيفة اسكان طلال-الرصيفه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	Jordan	الأردن	Irbid	اربد	اربد	 اشارات اليوسفي	 اشارات اليوسفي	 اشارات اليوسفي	 اشارات اليوسفي	\N	\N	 اشارات اليوسفي  اشارات اليوسفي اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
a3f3719a-5a22-4af6-9b30-05e90d3e989c	Jordan	الأردن	Irbid	اربد	اربد	اشاره الاسكان	اشاره الاسكان	اشاره الاسكان	اشاره الاسكان	\N	\N	اشاره الاسكان اشاره الاسكان اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
64a58f7d-8819-4497-b474-85012c988a77	Jordan	الأردن	Irbid	اربد	اربد	اشاره الحسبه	اشاره الحسبه	اشاره الحسبة	اشاره الحسبة	\N	\N	اشاره الحسبة اشاره الحسبه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
c2b947a8-c56a-42e0-9735-2236b3e6dd82	Jordan	الأردن	Irbid	اربد	اربد	اشاره الدراوشه	اشاره الدراوشه	اشاره الدراوشة	اشاره الدراوشة	\N	\N	اشاره الدراوشة اشاره الدراوشه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
3372f954-f10b-4b30-9786-0b0c9415feb7	Jordan	الأردن	Irbid	اربد	اربد	اشاره القيروان	اشاره القيروان	اشاره القيروان	اشاره القيروان	\N	\N	اشاره القيروان اشاره القيروان اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
13c02fee-7a6c-4c87-8a46-e439a49a97a9	Jordan	الأردن	Irbid	اربد	اربد	اشاره الملكه نور	اشاره الملكه نور	اشاره الملكه نور	اشاره الملكه نور	\N	\N	اشاره الملكه نور اشاره الملكه نور اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
1ea47927-56ee-4423-aa39-34228b44696f	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الأزرق	الأزرق	الأزرق	الأزرق	\N	\N	الأزرق الأزرق الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
8bd458d1-c84d-4b88-96f9-2716de840d93	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الاحمد	الاحمد	سوبرماركت صلاح	سوبرماركت صلاح	\N	\N	سوبرماركت صلاح الاحمد الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
142176ff-6bd1-4fd6-a158-593364c66d17	Jordan	الأردن	Irbid	اربد	اربد	الاشرفيه	الاشرفيه	مستشفى البشير	مستشفى البشير	\N	\N	مستشفى البشير الاشرفيه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
150d781e-3957-4faa-abab-8b6f3284ecf5	Jordan	الأردن	Amman	عمان	عمان	الاشرفيه	الاشرفيه	مسجد الزيتاوي	مسجد الزيتاوي	\N	\N	مسجد الزيتاوي الاشرفيه عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5878b75b-77c4-4e35-b967-b6676864a172	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الامر حمزه	الامر حمزه	مسجد اسعد بن زرارة	مسجد اسعد بن زرارة	\N	\N	مسجد اسعد بن زرارة الامر حمزه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
4cb00973-28e4-41f0-8dbb-5988164e6c04	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الامير حسن	الامير حسن	مسجد سعد بن معاذ رضي الله عنه	مسجد سعد بن معاذ رضي الله عنه	\N	\N	مسجد سعد بن معاذ رضي الله عنه الامير حسن الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
ed452238-8315-40a8-9979-ac9f9397727a	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الامير شاكر	الامير شاكر	العيسى للاثاث المنزلي	العيسى للاثاث المنزلي	\N	\N	العيسى للاثاث المنزلي الامير شاكر الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5fddcd29-c42d-4020-add6-4b1b25ba9733	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الاميره رحمه	الاميره رحمه	مسجد الامام الغزالي	مسجد الامام الغزالي	\N	\N	مسجد الامام الغزالي الاميره رحمه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
beca4c0b-2e42-40c4-a8b0-a1e95681fb3a	Jordan	الأردن	Irbid	اربد	اربد	الاندلس	الاندلس	مدرسه الجيل الجديد	مدرسه الجيل الجديد	\N	\N	مدرسه الجيل الجديد الاندلس اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
74305061-f6ca-4657-a7e3-45fa4e2f1818	Jordan	الأردن	Irbid	اربد	اربد	الايمان	الايمان	محطه ابو هيثم الشوحه للمحروقات	محطه ابو هيثم الشوحه للمحروقات	\N	\N	محطه ابو هيثم الشوحه للمحروقات الايمان اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
f4010ce2-b4b6-449b-a98b-f8ce524b40ae	Jordan	الأردن	Irbid	اربد	اربد	البارحه	البارحه	البارحة	البارحة	\N	\N	البارحة البارحه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
0e8fd54c-2099-4874-95e6-339522462d3c	Jordan	الأردن	Irbid	اربد	اربد	البساتين	البساتين	مدرسه محمود ابو غنيمة	مدرسه محمود ابو غنيمة	\N	\N	مدرسه محمود ابو غنيمة البساتين اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
29894924-8190-469e-afa7-b1317cb8aa1f	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	البستان	البستان	البستان	البستان	\N	\N	البستان البستان الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
7bebcbd3-f5dc-4635-9024-1efab326762f	Jordan	الأردن	Irbid	اربد	اربد	البقعه	البقعه	مسجد المقري	مسجد المقري	\N	\N	مسجد المقري البقعه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
521f33ff-b700-4501-86eb-2203357daf58	Jordan	الأردن	Amman	عمان	عمان	البقعه	البقعه	البقعه	البقعه	\N	\N	البقعه البقعه عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
68fd787c-4de4-434f-8a79-a96520fc03ad	Jordan	الأردن	Irbid	اربد	اربد	البلد	البلد	البلد	البلد	\N	\N	البلد البلد اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
2845158c-7e89-4c95-9715-1672e9b40ec6	Jordan	الأردن	Aqaba	العقبة	العقبة	البلد القديمة	البلد القديمة	البلد القديمة	البلد القديمة	\N	\N	البلد القديمة البلد القديمة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
d0534aa4-d481-4292-8af0-b672f6da345d	Jordan	الأردن	Aqaba	العقبة	العقبة	البنك العربي - العقبة	البنك العربي - العقبة	البنك العربي - العقبة	البنك العربي - العقبة	\N	\N	البنك العربي - العقبة البنك العربي - العقبة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
47d64cf2-af2c-401f-994a-82f0af05ca6b	Jordan	الأردن	Amman	عمان	عمان	البنيات	البنيات	مسجد الرحمه	مسجد الرحمه	\N	\N	مسجد الرحمه البنيات عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
73cdecad-29cc-40b3-9922-30dc42e5e3e1	Jordan	الأردن	Amman	عمان	عمان	البيادر	البيادر	حي الرونق الحموي لمواد البناء	حي الرونق الحموي لمواد البناء	\N	\N	حي الرونق الحموي لمواد البناء البيادر عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
5e9a062a-0139-4f7c-b462-19e726e2580c	Jordan	الأردن	Irbid	اربد	اربد	البياضه	البياضه	مسجد خلف الهوشان	مسجد خلف الهوشان	\N	\N	مسجد خلف الهوشان البياضه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
8b2f4a3a-9020-4040-9041-26dd25eaeb48	Jordan	الأردن	Aqaba	العقبة	العقبة	التالابيه	التالابيه	التالابيه	التالابيه	\N	\N	التالابيه التالابيه العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
ad262615-8ae2-4135-bc4f-2a3bc23db4df	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	التطوير الحضري	التطوير الحضري	التطوير الحضري	التطوير الحضري	\N	\N	التطوير الحضري التطوير الحضري الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
c04e026a-cd97-41ed-a8a0-e682127c14f0	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	التطوير الحضري-الرصيفه	التطوير الحضري-الرصيفه	التطوير الحضري-الرصيفة	التطوير الحضري-الرصيفة	\N	\N	التطوير الحضري-الرصيفة التطوير الحضري-الرصيفه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
82067226-1058-40be-b7c3-14a208b6beaa	Jordan	الأردن	Irbid	اربد	اربد	التل	التل	مدرسه اربد	مدرسه اربد	\N	\N	مدرسه اربد التل اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
3532fca6-be35-4153-b17c-b1026760fa79	Jordan	الأردن	Amman	عمان	عمان	الجاردنز	الجاردنز	حي البركه جريده الدستور	حي البركه جريده الدستور	\N	\N	حي البركه جريده الدستور الجاردنز عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
d7bf7700-e412-4b62-adec-37d1241fbf1e	Jordan	الأردن	Irbid	اربد	اربد	الجامع	الجامع	مسجد اربد الكبير	مسجد اربد الكبير	\N	\N	مسجد اربد الكبير الجامع اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e81bf618-d109-4c96-b0d3-964577ad1a00	Jordan	الأردن	Aqaba	العقبة	العقبة	الجامعة الاردنية - العقبة	الجامعة الاردنية - العقبة	الجامعة الاردنية - العقبة	الجامعة الاردنية - العقبة	\N	\N	الجامعة الاردنية - العقبة الجامعة الاردنية - العقبة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
1cfaeb55-6b3a-4e14-9973-13dbc560d0e3	Jordan	الأردن	Irbid	اربد	اربد	الجامعه	الجامعه	مدينه الحسن الرياضية	مدينه الحسن الرياضية	\N	\N	مدينه الحسن الرياضية الجامعه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e9a011c5-29f9-4f72-86ba-b88c68290396	Jordan	الأردن	Aqaba	العقبة	العقبة	الجامعه الامريكية - العقبة	الجامعه الامريكية - العقبة	الجامعه الامريكية - العقبة	الجامعه الامريكية - العقبة	\N	\N	الجامعه الامريكية - العقبة الجامعه الامريكية - العقبة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
bb40a685-11a3-45cd-ac57-093ac0c94e33	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الجامعه الهاشميه	الجامعه الهاشميه	كافيه ايمن مشافيه	كافيه ايمن مشافيه	\N	\N	كافيه ايمن مشافيه الجامعه الهاشميه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5a83026b-0ba5-4ba8-b924-2f02d3971e31	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الجبر	الجبر	ابومجدي مول	ابومجدي مول	\N	\N	ابومجدي مول الجبر الزرقاء	t	1	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
91f7d73f-900a-4e93-9812-c3bcd920dcca	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الجبل الابيض	الجبل الابيض	مسجد اسامه بن زيد	مسجد اسامه بن زيد	\N	\N	مسجد اسامه بن زيد الجبل الابيض الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
68c23b92-1b68-4eab-9fed-6ac552c5984a	Jordan	الأردن	Amman	عمان	عمان	الجبيهه	الجبيهه	دوار الاميرة سمية	دوار الاميرة سمية	\N	\N	دوار الاميرة سمية الجبيهه عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
879bd621-e4e5-46d2-9f6f-762c641e7170	Jordan	الأردن	Amman	عمان	عمان	الجبيهه حي الامام الغزالي	الجبيهه حي الامام الغزالي	الجبيهه حي الامام الغزالي	الجبيهه حي الامام الغزالي	\N	\N	الجبيهه حي الامام الغزالي الجبيهه حي الامام الغزالي عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
a796049e-35a1-4db1-bb34-b6d7e64cca6a	Jordan	الأردن	Irbid	اربد	اربد	جديد MK	جديد MK	جديد MK	جديد MK	\N	\N	جديد mk جديد mk اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
fabf2393-b4f7-437b-afff-251cde8a46cb	Jordan	الأردن	Amman	عمان	عمان	الجبيهه حي البلديه	الجبيهه حي البلديه	الجبيهه حي البلديه	الجبيهه حي البلديه	\N	\N	الجبيهه حي البلديه الجبيهه حي البلديه عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
39049054-919f-4a21-8832-053ef1fbe4e8	Jordan	الأردن	Amman	عمان	عمان	الجبيهه حي الجامعه	الجبيهه حي الجامعه	مستشفى الاسراء	مستشفى الاسراء	\N	\N	مستشفى الاسراء الجبيهه حي الجامعه عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
2816a6db-c061-4896-9cc4-2d300928f7f1	Jordan	الأردن	Amman	عمان	عمان	الجبيهه حي الريان	الجبيهه حي الريان	اشاره المنهل	اشاره المنهل	\N	\N	اشاره المنهل الجبيهه حي الريان عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
6f148598-616e-4e79-b8ff-5bbd3125a68e	Jordan	الأردن	Amman	عمان	عمان	الجبيهه حي الزيتونه	الجبيهه حي الزيتونه	الجبيهه حي الزيتونه	الجبيهه حي الزيتونه	\N	\N	الجبيهه حي الزيتونه الجبيهه حي الزيتونه عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
f6b1e5ba-03fb-40c7-b502-70caa988340f	Jordan	الأردن	Amman	عمان	عمان	الجبيهه حي الفضيله	الجبيهه حي الفضيله	مدرسه الخنساء	مدرسه الخنساء	\N	\N	مدرسه الخنساء الجبيهه حي الفضيله عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
45ce8399-bf69-43f2-8993-6bd8202d097b	Jordan	الأردن	Amman	عمان	عمان	الجبيهه حي المنصور	الجبيهه حي المنصور	كازيه توتال	كازيه توتال	\N	\N	كازيه توتال الجبيهه حي المنصور عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
d18d33b1-d600-4d2d-8d53-557812882d19	Jordan	الأردن	Amman	عمان	عمان	الجبيهه حي ام زويتينه	الجبيهه حي ام زويتينه	مسجد محمد محمود جبران	مسجد محمد محمود جبران	\N	\N	مسجد محمد محمود جبران الجبيهه حي ام زويتينه عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
7d438d5b-d775-4ac7-a31a-e6733ba75ad6	Jordan	الأردن	Amman	عمان	عمان	الجبيهه ضاحيه الرشيد	الجبيهه ضاحيه الرشيد	الجبيهه ضاحيه الرشيد	الجبيهه ضاحيه الرشيد	\N	\N	الجبيهه ضاحيه الرشيد الجبيهه ضاحيه الرشيد عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
0219a65a-cc5e-4d8c-b6e0-5519033462cf	Jordan	الأردن	Amman	عمان	عمان	الجبيهه ضاحيه الروضه	الجبيهه ضاحيه الروضه	فندق لانكستر للشقق الفندقيه	فندق لانكستر للشقق الفندقيه	\N	\N	فندق لانكستر للشقق الفندقيه الجبيهه ضاحيه الروضه عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
5d14eab3-1ccd-4198-a60f-2bc056c24c80	Jordan	الأردن	Aqaba	العقبة	العقبة	الجمعية	الجمعية	الجمعية	الجمعية	\N	\N	الجمعية الجمعية العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
f01ec853-fec1-47fd-b1b0-906c22104b2a	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الجنينه	الجنينه	المسجد الابراهيمي	المسجد الابراهيمي	\N	\N	المسجد الابراهيمي الجنينه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
72c5bf90-4a3c-40db-a06b-9476af0cfcd7	Jordan	الأردن	Amman	عمان	عمان	الجويده	الجويده	مطحنه الجويده	مطحنه الجويده	\N	\N	مطحنه الجويده الجويده عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
9c7d5bf7-5cc9-48e9-8d87-91c90558bf05	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الحاووز	الحاووز	الحاووز	الحاووز	\N	\N	الحاووز الحاووز الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5424a529-ec5f-4d3b-9386-b02ebccf90e0	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الحديقه	الحديقه	الحديقة	الحديقة	\N	\N	الحديقة الحديقه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
ef48fc7e-ce39-4cd5-83ef-9e32e7e39f7d	Jordan	الأردن	Aqaba	العقبة	العقبة	الحرفية	الحرفية	الحرفية	الحرفية	\N	\N	الحرفية الحرفية العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
b2c37e12-c706-4bbf-8bc3-9ff8cac0ea1f	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الحرفيين	الحرفيين	شركه السفاريني	شركه السفاريني	\N	\N	شركه السفاريني الحرفيين الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
07617db6-dadb-4119-b55f-5bc96243f705	Jordan	الأردن	Irbid	اربد	اربد	الحرمين الشرقي	الحرمين الشرقي	مصنع الجبال الذهبية	مصنع الجبال الذهبية	\N	\N	مصنع الجبال الذهبية الحرمين الشرقي اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
b9ffce20-c2ea-4b9c-a054-9292f68cbec0	Jordan	الأردن	Irbid	اربد	اربد	الحرمين الغربي	الحرمين الغربي	مسجد نور الهدى	مسجد نور الهدى	\N	\N	مسجد نور الهدى الحرمين الغربي اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
a77a3eaf-0622-4f88-8031-2cd24d69a3c4	Jordan	الأردن	Irbid	اربد	اربد	الحسبه المركزيه	الحسبه المركزيه	الحسبه المركزية	الحسبه المركزية	\N	\N	الحسبه المركزية الحسبه المركزيه اربد	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
40f2f2b1-1b25-4759-a2dc-e06edc0c85c2	Jordan	الأردن	Irbid	اربد	اربد	الحصن	الحصن	الحصن	الحصن	\N	\N	الحصن الحصن اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5e580880-218e-408c-bb7e-89c4b7d64214	Jordan	الأردن	Irbid	اربد	اربد	الحكمه	الحكمه	سيفوي	سيفوي	\N	\N	سيفوي الحكمه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
b502c956-d6d6-45a3-b581-c0cbc91be5a3	Jordan	الأردن	Irbid	اربد	اربد	الحي الجنوبي	الحي الجنوبي	الحي الجنوبي	الحي الجنوبي	\N	\N	الحي الجنوبي الحي الجنوبي اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
7f624ff1-af07-4940-8263-9838fab76661	Jordan	الأردن	Irbid	اربد	اربد	الحي الشرقي	الحي الشرقي	الحي الشرقي	الحي الشرقي	\N	\N	الحي الشرقي الحي الشرقي اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5a1768e5-92dc-48c6-9947-dca0b60718c9	Jordan	الأردن	Irbid	اربد	اربد	الحي الغربي	الحي الغربي	الحي الغربي	الحي الغربي	\N	\N	الحي الغربي الحي الغربي اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
9b04b7c5-b5b2-4273-b89a-31cf5d2ef1c6	Jordan	الأردن	Irbid	اربد	اربد	الخراج	الخراج	الخراج	الخراج	\N	\N	الخراج الخراج اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
3cc9c14b-0193-4877-af6d-fafd7d020b8e	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الدويك	الدويك	الدويك	الدويك	\N	\N	الدويك الدويك الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
f3b338d7-13aa-40ae-b3d4-a34d7269205b	Jordan	الأردن	Irbid	اربد	اربد	الرابيه	الرابيه	مدرسه كامبريدج	مدرسه كامبريدج	\N	\N	مدرسه كامبريدج الرابيه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
b2e86607-1078-4da7-872b-4927dac2d53a	Jordan	الأردن	Amman	عمان	عمان	الرابيه	الرابيه	السفاره الاسرائيليه	السفاره الاسرائيليه	\N	\N	السفاره الاسرائيليه الرابيه عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
67650a08-1b24-4d19-8ae6-94b89302f71f	Jordan	الأردن	Irbid	اربد	اربد	الراهبات الورديه	الراهبات الورديه	الراهبات الوردية	الراهبات الوردية	\N	\N	الراهبات الوردية الراهبات الورديه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
7ee5e69d-f3aa-4755-b9a7-140c4321d735	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الرصيفه	الرصيفه	الرصيفة	الرصيفة	\N	\N	الرصيفة الرصيفه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
8e8f0f2e-4395-4ce4-847a-c07a583403d3	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الرصيفه الجنوبي	الرصيفه الجنوبي	الرصيفه الجنوبي	الرصيفه الجنوبي	\N	\N	الرصيفه الجنوبي الرصيفه الجنوبي الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
f74f9314-b6d6-408e-9dbf-ab97f443ab1c	Jordan	الأردن	Aqaba	العقبة	العقبة	الرمال	الرمال	الرمال	الرمال	\N	\N	الرمال الرمال العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
9934e507-61bf-41dd-a9f8-b500091cfb31	Jordan	الأردن	Irbid	اربد	اربد	الرمثا	الرمثا	الرمثا	الرمثا	\N	\N	الرمثا الرمثا اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
fe19818d-118d-4335-8183-63daee28cad9	Jordan	الأردن	Amman	عمان	عمان	الروابي	الروابي	شارع التباشير 4	شارع التباشير 4	\N	\N	شارع التباشير 4 الروابي عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
775d5cc9-1843-40f7-8138-0d011b32a60c	Jordan	الأردن	Irbid	اربد	اربد	الروضه	الروضه	دوار حسن التل	دوار حسن التل	\N	\N	دوار حسن التل الروضه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
4178d3bb-8f52-4892-afc5-4789aa7053c7	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الزرقاء	الزرقاء	الاتوستراد قبل اشارة الحديد	الاتوستراد قبل اشارة الحديد	\N	\N	الاتوستراد قبل اشارة الحديد الزرقاء الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
911649d0-6de8-41db-aa29-1d0fd27f5438	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الزرقاء الجديده	الزرقاء الجديده	الوينك	الوينك	\N	\N	الوينك الزرقاء الجديده الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
8937d2ae-913b-4bc0-8c3b-043de0b190a1	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الزرقاء ضاحية الرشيد	الزرقاء ضاحية الرشيد	ضاحية الرشيد الزرقاء	ضاحية الرشيد الزرقاء	\N	\N	ضاحية الرشيد الزرقاء الزرقاء ضاحية الرشيد الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
7034af28-8df6-4f0d-a44a-8f2b163b2ee1	Jordan	الأردن	Irbid	اربد	اربد	الزهراء	الزهراء	الزهراء	الزهراء	\N	\N	الزهراء الزهراء اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
3f1b2391-00cd-4ec4-8c03-b5f42ee928d7	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الزواهره	الزواهره	معم ليالي الشام	معم ليالي الشام	\N	\N	معم ليالي الشام الزواهره الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
59ccdb28-828c-4fd3-88bb-8d518e713988	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	السخنه	السخنه	السخنة	السخنة	\N	\N	السخنة السخنه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
bb97a94c-98d3-4048-b5b7-7a898a79e49c	Jordan	الأردن	Irbid	اربد	اربد	السعاده	السعاده	مدرسه عز الدين القسام	مدرسه عز الدين القسام	\N	\N	مدرسه عز الدين القسام السعاده اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
cf4292e1-b97c-4528-8205-1734b275fcd6	Jordan	الأردن	Irbid	اربد	اربد	السلام	السلام	دوار ابو اشرف	دوار ابو اشرف	\N	\N	دوار ابو اشرف السلام اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
bb3c3b43-fb9a-49b1-b600-26944f61c011	Jordan	الأردن	Balqa	السلط	السلط	السلط	السلط	دير علا	دير علا	\N	\N	دير علا السلط السلط	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
595d51b5-bda5-482e-9351-6493897986be	Jordan	الأردن	Irbid	اربد	اربد	السنبله	السنبله	السنبلة	السنبلة	\N	\N	السنبلة السنبله اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
267adf5f-89b4-4992-9a77-0e1ae673d8ce	Jordan	الأردن	Irbid	اربد	اربد	السهل الاخضر	السهل الاخضر	مركز الرازي الصحي	مركز الرازي الصحي	\N	\N	مركز الرازي الصحي السهل الاخضر اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
6d0c15c1-a995-420e-8b51-46dcf07a3b4d	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	السوق	السوق	السوق	السوق	\N	\N	السوق السوق الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
a3dea505-4a40-4260-9240-339a86b15e34	Jordan	الأردن	Aqaba	العقبة	العقبة	السوق الوسط التجاري - العقبه	السوق الوسط التجاري - العقبه	السوق الوسط التجاري - العقبه	السوق الوسط التجاري - العقبه	\N	\N	السوق الوسط التجاري - العقبه السوق الوسط التجاري - العقبه العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
0d49ddf1-b73e-4f02-b9b1-4b3ff98814b6	Jordan	الأردن	Aqaba	العقبة	العقبة	الشاطئ الجنوبي ( المنتزة البحري )	الشاطئ الجنوبي ( المنتزة البحري )	الشاطئ الجنوبي ( المنتزة البحري )	الشاطئ الجنوبي ( المنتزة البحري )	\N	\N	الشاطئ الجنوبي ( المنتزة البحري ) الشاطئ الجنوبي ( المنتزة البحري ) العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
4451adbe-f711-4e33-8dbc-e192d5e0e919	Jordan	الأردن	Irbid	اربد	اربد	الشجره	الشجره	الشجرة	الشجرة	\N	\N	الشجرة الشجره اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
dcc929dc-7488-4691-a1cd-c8f5bb99acfd	Jordan	الأردن	Aqaba	العقبة	العقبة	الشلاله	الشلاله	الشلاله	الشلاله	\N	\N	الشلاله الشلاله العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
c5a2c864-f9e5-4991-bef5-08aef7e9a1b4	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الشومر	الشومر	مسجد النبي اسماعيل عليه السلام	مسجد النبي اسماعيل عليه السلام	\N	\N	مسجد النبي اسماعيل عليه السلام الشومر الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e6184fbb-ef85-4187-ab38-cd310c660acf	Jordan	الأردن	Irbid	اربد	اربد	الشونه الشماليه	الشونه الشماليه	الشونه الشمالية	الشونه الشمالية	\N	\N	الشونه الشمالية الشونه الشماليه اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
5eecddb6-a674-4862-876a-79d02d6f0f93	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الشيوخ	الشيوخ	الشيوخ	الشيوخ	\N	\N	الشيوخ الشيوخ الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
c23f6ce4-fbd1-4320-9d11-be9b0f52cd58	Jordan	الأردن	Irbid	اربد	اربد	الصحه	الصحه	مسجد الخلايلة	مسجد الخلايلة	\N	\N	مسجد الخلايلة الصحه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
cec74b03-2f15-4c4f-8cce-03e51d5e694e	Jordan	الأردن	Irbid	اربد	اربد	الصريح	الصريح	الصريح	الصريح	\N	\N	الصريح الصريح اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
263c6006-9cff-4303-997d-6c819b55cdb5	Jordan	الأردن	Irbid	اربد	اربد	الصناعه	الصناعه	الصناعة	الصناعة	\N	\N	الصناعة الصناعه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
66ea9641-9cea-488b-ad7c-e573f7b99499	Jordan	الأردن	Aqaba	العقبة	العقبة	الصناعية (العقبة)	الصناعية (العقبة)	الصناعية (العقبة)	الصناعية (العقبة)	\N	\N	الصناعية (العقبة) الصناعية (العقبة) العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
d0222d58-c000-43f5-96c1-b99775e8ab5e	Jordan	الأردن	Irbid	اربد	اربد	الصوانيه	الصوانيه	مسجد البصول	مسجد البصول	\N	\N	مسجد البصول الصوانيه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
ca36f18a-1c37-4d3d-88a7-7a1e7edceb8d	Jordan	الأردن	Amman	عمان	عمان	الصويفيه	الصويفيه	حي السهل مطعم كنتاكي	حي السهل مطعم كنتاكي	\N	\N	حي السهل مطعم كنتاكي الصويفيه عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
747a546e-a935-40aa-8549-df79c7e618e6	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الضباط	الضباط	مسجد الرؤيا	مسجد الرؤيا	\N	\N	مسجد الرؤيا الضباط الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5e2ad739-8af0-4621-a1a1-aed48b4f7f71	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الضليل	الضليل	الضليل	الضليل	\N	\N	الضليل الضليل الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
63f16218-0547-4a9d-997f-1a292b4d6226	Jordan	الأردن	Aqaba	العقبة	العقبة	الطريق الخلفي	الطريق الخلفي	الطريق الخلفي	الطريق الخلفي	\N	\N	الطريق الخلفي الطريق الخلفي العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
e2a84be2-5c5f-4389-a97f-98891b95f1de	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الظاهريه	الظاهريه	الظاهرية	الظاهرية	\N	\N	الظاهرية الظاهريه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
576d0b09-95ae-43d8-a4f2-4899bb8dfdac	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الظليل	الظليل	الظليل	الظليل	\N	\N	الظليل الظليل الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
cd499da8-6adc-47ee-ad4b-e8da4f946098	Jordan	الأردن	Aqaba	العقبة	العقبة	العاشرة	العاشرة	العاشرة	العاشرة	\N	\N	العاشرة العاشرة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
71bdfb28-ad4e-41b5-866b-50324c736a73	Jordan	الأردن	Aqaba	العقبة	العقبة	العالمية العقبة	العالمية العقبة	العالمية العقبة	العالمية العقبة	\N	\N	العالمية العقبة العالمية العقبة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
45eb4a22-6888-41b8-8018-e424f63c9776	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	العالوك	العالوك	العالوك	العالوك	\N	\N	العالوك العالوك الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
28ca0b81-23db-4e5f-bf6d-0279e7462e45	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة	العقبة	العقبة	العقبة	\N	\N	العقبة العقبة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
85b8ade2-8f59-4169-93f5-bd366831fb67	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة التاسعة	العقبة التاسعة	العقبة التاسعة	العقبة التاسعة	\N	\N	العقبة التاسعة العقبة التاسعة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
592e77d9-3f9d-456b-be1b-81dc1882a119	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة الثالثة	العقبة الثالثة	العقبة الثالثة	العقبة الثالثة	\N	\N	العقبة الثالثة العقبة الثالثة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
9204d01f-591c-4430-95c6-f5b6f9d962fa	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة الثامنة	العقبة الثامنة	العقبة الثامنة	العقبة الثامنة	\N	\N	العقبة الثامنة العقبة الثامنة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
80887c64-581b-4d8d-968b-e0a04eaaece7	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة الخامسة	العقبة الخامسة	العقبة الخامسة	العقبة الخامسة	\N	\N	العقبة الخامسة العقبة الخامسة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
5f60569d-2fef-45be-aea8-7b4cd513bb19	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة الخزان	العقبة الخزان	العقبة الخزان	العقبة الخزان	\N	\N	العقبة الخزان العقبة الخزان العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
e3b7d5ee-3448-442e-85c7-3382c947699e	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة الرابعة	العقبة الرابعة	العقبة الرابعة	العقبة الرابعة	\N	\N	العقبة الرابعة العقبة الرابعة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
1ea36bb1-c78a-467e-98a8-73c560d5f9f8	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة السابعة	العقبة السابعة	العقبة السابعة	العقبة السابعة	\N	\N	العقبة السابعة العقبة السابعة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
15ecb441-1f70-4ecf-bc64-b2ed7a20fd2c	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة السادسة	العقبة السادسة	العقبة السادسة	العقبة السادسة	\N	\N	العقبة السادسة العقبة السادسة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
f6867f01-8433-4a37-9153-ef3aba25d319	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة - الكرامة	العقبة - الكرامة	العقبة - الكرامة	العقبة - الكرامة	\N	\N	العقبة - الكرامة العقبة - الكرامة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
c62b3e01-1398-41ee-9ebb-2ee1a81e4cbd	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	القمر	القمر	القمر	القمر	\N	\N	القمر القمر الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
3896c16c-c9e1-48e7-935d-272eba4cc179	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة المحدود الغربي	العقبة المحدود الغربي	العقبة المحدود الغربي	العقبة المحدود الغربي	\N	\N	العقبة المحدود الغربي العقبة المحدود الغربي العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
86b42294-892a-4d25-ae17-6352ca68d278	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة المستشفي الاسلامي	العقبة المستشفي الاسلامي	العقبة المستشفي الاسلامي	العقبة المستشفي الاسلامي	\N	\N	العقبة المستشفي الاسلامي العقبة المستشفي الاسلامي العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
b9b23db2-ec26-4605-bd84-44d700419982	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة المعامل	العقبة المعامل	العقبة المعامل	العقبة المعامل	\N	\N	العقبة المعامل العقبة المعامل العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
f226ee28-2e95-4ee0-94df-e97a00492805	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة المنارة	العقبة المنارة	العقبة المنارة	العقبة المنارة	\N	\N	العقبة المنارة العقبة المنارة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
335b85e9-2c45-411a-8ed2-e633710c2a71	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة بنك الاسكان	العقبة بنك الاسكان	العقبة بنك الاسكان	العقبة بنك الاسكان	\N	\N	العقبة بنك الاسكان العقبة بنك الاسكان العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
c5558b55-3df7-4441-b25e-131e60338c0f	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة دوار هيا	العقبة دوار هيا	العقبة دوار هيا	العقبة دوار هيا	\N	\N	العقبة دوار هيا العقبة دوار هيا العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
00750dce-bb2e-451b-935e-233d7b89567c	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة سكن الاطباء	العقبة سكن الاطباء	العقبة سكن الاطباء	العقبة سكن الاطباء	\N	\N	العقبة سكن الاطباء العقبة سكن الاطباء العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
de9b09b0-15c9-4eda-bccf-4f3e3f8d32ed	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة فندق الموفنبيك	العقبة فندق الموفنبيك	العقبة فندق الموفنبيك	العقبة فندق الموفنبيك	\N	\N	العقبة فندق الموفنبيك العقبة فندق الموفنبيك العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
4fc43a29-ee09-452b-acd5-1a6ba50d21c2	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة ماكدونالز	العقبة ماكدونالز	العقبة ماكدونالز	العقبة ماكدونالز	\N	\N	العقبة ماكدونالز العقبة ماكدونالز العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
ce11d21e-8044-477b-945b-3fec981956eb	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة مستشفي هاشم	العقبة مستشفي هاشم	العقبة مستشفي هاشم	العقبة مستشفي هاشم	\N	\N	العقبة مستشفي هاشم العقبة مستشفي هاشم العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
7bc351ce-c68b-47ef-98bf-6bbcdeb0249d	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبة - نادي الامير راشد	العقبة - نادي الامير راشد	العقبة - نادي الامير راشد	العقبة - نادي الامير راشد	\N	\N	العقبة - نادي الامير راشد العقبة - نادي الامير راشد العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
3ac49b03-6901-49d7-9e95-cb266287f8aa	Jordan	الأردن	Aqaba	العقبة	العقبة	العقبه شارع البيتزا	العقبه شارع البيتزا	العقبه شارع البيتزا	العقبه شارع البيتزا	\N	\N	العقبه شارع البيتزا العقبه شارع البيتزا العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
d11a058c-6b15-450e-9f99-fcad56b03bee	Jordan	الأردن	Amman	عمان	عمان	العلكوميه	العلكوميه	العلكوميه	العلكوميه	\N	\N	العلكوميه العلكوميه عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
95d03c39-e1dc-44cf-8a4d-bf22b73b1c38	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	العموريه	العموريه	العمورية	العمورية	\N	\N	العمورية العموريه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
daaecbfe-c455-45ac-a683-ff2d941148d9	Jordan	الأردن	Irbid	اربد	اربد	العوده	العوده	مسجد الكردي	مسجد الكردي	\N	\N	مسجد الكردي العوده اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
1cb29284-af44-4e78-9c02-5796b0ce76db	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الغويريه	الغويريه	الغويرية	الغويرية	\N	\N	الغويرية الغويريه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
a801179e-e670-4124-b569-b61303596596	Jordan	الأردن	Amman	البلقاء	البلقاء	الفحيص	الفحيص	الفحيص	الفحيص	\N	\N	الفحيص الفحيص البلقاء	t	2	3.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
2223ddc2-b775-42f0-8c86-63e8281f42c6	Jordan	الأردن	Balqa	السلط	السلط	الفحيص	الفحيص	الفحيص	الفحيص	\N	\N	الفحيص الفحيص السلط	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
97928841-4abe-4af9-a95a-d2a09e7ba4ed	Jordan	الأردن	Amman	عمان	عمان	الفحيص	الفحيص	الفحيص	الفحيص	\N	\N	الفحيص الفحيص عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
21a32988-ef8d-43ba-b451-a100f96c4265	Jordan	الأردن	Irbid	اربد	اربد	الفضيله	الفضيله	الفضيلة	الفضيلة	\N	\N	الفضيلة الفضيله اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
a25a2869-d0ec-4cc4-a34b-2be5ab1c47f2	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الفلاتر	الفلاتر	الفلاتر	الفلاتر	\N	\N	الفلاتر الفلاتر الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
1a65af52-8a27-45cb-a46f-ccbe3a489f16	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الفلاح	الفلاح	مسجد المرحوم عبدالله الدويك	مسجد المرحوم عبدالله الدويك	\N	\N	مسجد المرحوم عبدالله الدويك الفلاح الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5de2a9f5-ce59-4f1c-9f66-ffa91884d282	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	القادسية-الرصيفه	القادسية-الرصيفه	القادسية-الرصيفة	القادسية-الرصيفة	\N	\N	القادسية-الرصيفة القادسية-الرصيفه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5bb03d20-0771-48cb-80c3-6823e9870dbf	Jordan	الأردن	Aqaba	العقبة	العقبة	القرية اللوجستية	القرية اللوجستية	القرية اللوجستية	القرية اللوجستية	\N	\N	القرية اللوجستية القرية اللوجستية العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
7e60ef71-1077-4feb-8579-7bbc5919b9a2	Jordan	الأردن	Amman	عمان	عمان	القويسمه	القويسمه	حي المعادي صيدليه علاء و الاء	حي المعادي صيدليه علاء و الاء	\N	\N	حي المعادي صيدليه علاء و الاء القويسمه عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
ddf2837b-fa7f-45b7-90cf-3d04a62cdef4	Jordan	الأردن	Irbid	اربد	اربد	الكرامه	الكرامه	البنك العربي	البنك العربي	\N	\N	البنك العربي الكرامه اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
adc912a1-07b7-473c-85b3-53ffbb061dea	Jordan	الأردن	Amman	عمان	عمان	الكرسي	الكرسي	سوبر ماركت محمد	سوبر ماركت محمد	\N	\N	سوبر ماركت محمد الكرسي عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
5e0bd30e-f145-4063-bda4-a411ff634785	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الكمشه	الكمشه	الكمشة	الكمشة	\N	\N	الكمشة الكمشه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
b28b8730-c9e7-4258-b876-f7bda22cb2a9	Jordan	الأردن	Amman	عمان	عمان	اللويبده	اللويبده	اللويبده	اللويبده	\N	\N	اللويبده اللويبده عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
43015fb1-e695-401e-94f9-36ecf1fdbc58	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	المجد	المجد	المجد	المجد	\N	\N	المجد المجد الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
6ce69cca-4a7f-4852-8878-bb090716cc75	Jordan	الأردن	Aqaba	العقبة	العقبة	المجمع الصناعي	المجمع الصناعي	المجمع الصناعي	المجمع الصناعي	\N	\N	المجمع الصناعي المجمع الصناعي العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
d9450ccf-45f2-4ac5-ba09-dc6acf76619c	Jordan	الأردن	Aqaba	العقبة	العقبة	المحدود	المحدود	المحدود	المحدود	\N	\N	المحدود المحدود العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
4244ffa9-2c2c-45d4-9875-8a4dd79aa57d	Jordan	الأردن	Aqaba	العقبة	العقبة	المحدودة	المحدودة	المحدودة	المحدودة	\N	\N	المحدودة المحدودة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
658cdf07-cb7e-4746-8e1e-5e043fa83875	Jordan	الأردن	Irbid	اربد	اربد	المدرسه الشامله	المدرسه الشامله	المدرسه الشاملة	المدرسه الشاملة	\N	\N	المدرسه الشاملة المدرسه الشامله اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
ed04bb0a-e515-4087-aa84-c8d952bb5acf	Jordan	الأردن	Amman	عمان	عمان	المدينه الرياضيه	المدينه الرياضيه	سوبر ماركت المدينه	سوبر ماركت المدينه	\N	\N	سوبر ماركت المدينه المدينه الرياضيه عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
3d1a7d28-b584-4e6f-a78d-867c63c988ad	Jordan	الأردن	Irbid	اربد	اربد	المدينه الصناعيه	المدينه الصناعيه	المدينه الصناعية	المدينه الصناعية	\N	\N	المدينه الصناعية المدينه الصناعيه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
749fdb0d-d092-4424-92a4-57f3a03f5255	Jordan	الأردن	Irbid	اربد	اربد	المرج	المرج	المرج	المرج	\N	\N	المرج المرج اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
a920aa67-e7df-42e8-9848-86d7cc3990c2	Jordan	الأردن	Irbid	اربد	اربد	المزار الشمالي	المزار الشمالي	المزار الشمالي	المزار الشمالي	\N	\N	المزار الشمالي المزار الشمالي اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
dd8d7862-bead-4322-bae9-1c24b1250f40	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	المشيرفه	المشيرفه	المشيرفة	المشيرفة	\N	\N	المشيرفة المشيرفه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
1e0e8592-eaae-4acb-a2d1-2c567b968422	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	المصانع	المصانع	مجمع القناديل الزرقاء	مجمع القناديل الزرقاء	\N	\N	مجمع القناديل الزرقاء المصانع الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
aec6af04-c492-4e93-a224-494ad2dcaeda	Jordan	الأردن	Irbid	اربد	اربد	المطلع	المطلع	المطلع	المطلع	\N	\N	المطلع المطلع اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
2b4e878f-89b2-43dc-a60f-ff84df2bb982	Jordan	الأردن	Amman	عمان	عمان	المقابلين	المقابلين	المقابلين	المقابلين	\N	\N	المقابلين المقابلين عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
de08ff6e-62d6-40f0-8e3e-bd67a7942671	Jordan	الأردن	Irbid	اربد	اربد	الملعب	الملعب	البنك الاسلامي الاردني	البنك الاسلامي الاردني	\N	\N	البنك الاسلامي الاردني الملعب اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
01a588dc-e4e2-469c-8d6d-e3dd0b3a239e	Jordan	الأردن	Irbid	اربد	اربد	الملعب البلدي	الملعب البلدي	الملعب البلدي	الملعب البلدي	\N	\N	الملعب البلدي الملعب البلدي اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e5ca21bf-7c1b-41bb-b277-d97488c343b7	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الملك طلال	الملك طلال	مسجد الصالحين	مسجد الصالحين	\N	\N	مسجد الصالحين الملك طلال الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
22cb2ee3-dd70-42a5-9083-96bb4a411439	Jordan	الأردن	Irbid	اربد	اربد	المناره	المناره	كنافه عمواس	كنافه عمواس	\N	\N	كنافه عمواس المناره اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
79efc0d9-fe33-469e-9fe9-c4dba2197d83	Jordan	الأردن	Amman	عمان	عمان	المناره	المناره	صاله الاحمد	صاله الاحمد	\N	\N	صاله الاحمد المناره عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
fa181c92-44ec-428b-b285-784da51ad84f	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	المناهل	المناهل	المناهل	المناهل	\N	\N	المناهل المناهل الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
6cada5f0-6603-47f0-afab-e7633d9f0c24	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	المنطقه الحره	المنطقه الحره	المنطقه الحرة	المنطقه الحرة	\N	\N	المنطقه الحرة المنطقه الحره الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
8641929a-62e4-430b-91a6-ca1b2513f1a1	Jordan	الأردن	Irbid	اربد	اربد	الميدان	الميدان	ميدان علي الشراري	ميدان علي الشراري	\N	\N	ميدان علي الشراري الميدان اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
c554caaf-f70c-4982-88bf-ce3178530407	Jordan	الأردن	Aqaba	العقبة	العقبة	الميناء الجديد (العقبة)	الميناء الجديد (العقبة)	الميناء الجديد (العقبة)	الميناء الجديد (العقبة)	\N	\N	الميناء الجديد (العقبة) الميناء الجديد (العقبة) العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
47a5a2e3-e51e-4a2e-9704-36680c4bfe10	Jordan	الأردن	Irbid	اربد	اربد	النزهه	النزهه	مصرف الراجحي	مصرف الراجحي	\N	\N	مصرف الراجحي النزهه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
1837c09f-92cd-4e81-941e-47aa5684b8b3	Jordan	الأردن	Irbid	اربد	اربد	النظيف	النظيف	النظيف	النظيف	\N	\N	النظيف النظيف اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
cb3a5f6f-a1da-4412-9d52-17252a28807b	Jordan	الأردن	Irbid	اربد	اربد	النعيمه	النعيمه	النعيمة	النعيمة	\N	\N	النعيمة النعيمه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
445d7e6c-cc9c-4c06-9337-d9dacad9e21b	Jordan	الأردن	Amman	عمان	عمان	الهاشمي الجنوبي	الهاشمي الجنوبي	حديقه الملكه نور	حديقه الملكه نور	\N	\N	حديقه الملكه نور الهاشمي الجنوبي عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
6f415adb-d3c5-426e-9382-a7eea34db7fb	Jordan	الأردن	Amman	عمان	عمان	الهاشمي الشمالي	الهاشمي الشمالي	سامح مول	سامح مول	\N	\N	سامح مول الهاشمي الشمالي عمان	t	1	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
527d962f-d33f-40b8-9e9f-6a5ada95bf1f	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الهاشميه	الهاشميه	مسجد التواصي بالحق	مسجد التواصي بالحق	\N	\N	مسجد التواصي بالحق الهاشميه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
67ee8d78-36d3-4870-9dab-3f7e3a6212b4	Jordan	الأردن	Amman	عمان	عمان	الوحدات	الوحدات	مركز امن الوحدات الاشرفيه	مركز امن الوحدات الاشرفيه	\N	\N	مركز امن الوحدات الاشرفيه الوحدات عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
2558d5f0-896a-46c2-b1d3-c97d0d04f148	Jordan	الأردن	Aqaba	العقبة	العقبة	الوحدات الشرقية	الوحدات الشرقية	الوحدات الشرقية	الوحدات الشرقية	\N	\N	الوحدات الشرقية الوحدات الشرقية العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
06d5d11a-b071-4c96-b048-ce7d97a06467	Jordan	الأردن	Aqaba	العقبة	العقبة	الوحدات الشعبية	الوحدات الشعبية	الوحدات الشعبية	الوحدات الشعبية	\N	\N	الوحدات الشعبية الوحدات الشعبية العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
24fb07e9-fd34-40ba-8e91-f191df588970	Jordan	الأردن	Aqaba	العقبة	العقبة	الوحدات الغربية	الوحدات الغربية	الوحدات الغربية	الوحدات الغربية	\N	\N	الوحدات الغربية الوحدات الغربية العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
430a288f-6d6e-4ff3-91a8-d0e58437e195	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	الوسط التجاري	الوسط التجاري	الوسط التجاري	الوسط التجاري	\N	\N	الوسط التجاري الوسط التجاري الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
67f9d6ec-01d8-491a-855a-e358fd1f584c	Jordan	الأردن	Amman	عمان	عمان	اليادوده	اليادوده	ام الكندم	ام الكندم	\N	\N	ام الكندم اليادوده عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e2c52e53-1912-4d4d-b658-d5e74f283147	Jordan	الأردن	Irbid	اربد	اربد	اليرموك	اليرموك	مسجد الصالحين	مسجد الصالحين	\N	\N	مسجد الصالحين اليرموك اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
05b2c8b4-a451-4272-b8f6-f1043145b158	Jordan	الأردن	Amman	عمان	عمان	ام اذينه	ام اذينه	مجمع الالماس	مجمع الالماس	\N	\N	مجمع الالماس ام اذينه عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
3ea6f112-4069-4778-90f1-911b3370d60a	Jordan	الأردن	Amman	عمان	عمان	ام الاسود	ام الاسود	مسجد ام الاسود	مسجد ام الاسود	\N	\N	مسجد ام الاسود ام الاسود عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
7f4cca15-6ebe-4a83-8628-17829a5e0c95	Jordan	الأردن	Amman	عمان	عمان	ام الحيران	ام الحيران	ام الحيران	ام الحيران	\N	\N	ام الحيران ام الحيران عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
49d5dde7-b76d-41ab-acd2-563c3e0ec108	Jordan	الأردن	Amman	عمان	عمان	ام الدنانير	ام الدنانير	ام الدنانير	ام الدنانير	\N	\N	ام الدنانير ام الدنانير عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
2165bb42-0f12-4a7b-bd46-63a25a9287e5	Jordan	الأردن	Amman	عمان	عمان	ام السماق	ام السماق	دوار النعيمات	دوار النعيمات	\N	\N	دوار النعيمات ام السماق عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
85971fbd-8cd5-4af6-98a5-8851d333b5b1	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	ام بياضه	ام بياضه	ميني ماركت  حي السلام	ميني ماركت  حي السلام	\N	\N	ميني ماركت  حي السلام ام بياضه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
59860762-61a3-41e8-b4f5-04b3a8926ca2	Jordan	الأردن	Amman	عمان	عمان	ام قصير	ام قصير	مسجد ابي بن كعب	مسجد ابي بن كعب	\N	\N	مسجد ابي بن كعب ام قصير عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
ba6f65ed-5724-4d44-a585-b83a646bb50c	Jordan	الأردن	Amman	عمان	عمان	ام نواره	ام نواره	ام نواره	ام نواره	\N	\N	ام نواره ام نواره عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
3036bb11-e9a7-4f5f-8089-964e55f3b910	Jordan	الأردن	Irbid	اربد	اربد	ايدون	ايدون	ايدون	ايدون	\N	\N	ايدون ايدون اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
004b692c-09bb-48b5-af4a-d572fd32e994	Jordan	الأردن	Aqaba	العقبة	العقبة	ايله - العقبة	ايله - العقبة	ايله - العقبة	ايله - العقبة	\N	\N	ايله - العقبة ايله - العقبة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
b87af2d1-5313-4eae-9903-e6c01c37152c	Jordan	الأردن	Irbid	اربد	اربد	باب الهواء	باب الهواء	باب الهواء	باب الهواء	\N	\N	باب الهواء باب الهواء اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
cdf3dd9c-63e0-414f-ab45-bd07bcf0fe52	Jordan	الأردن	Amman	عمان	عمان	بدر الجديده	بدر الجديده	معمل الطوب	معمل الطوب	\N	\N	معمل الطوب بدر الجديده عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
54d5f8ed-366b-448a-8a4f-3b8b947a5769	Jordan	الأردن	Irbid	اربد	اربد	بشرى	بشرى	بشرى	بشرى	\N	\N	بشرى بشرى اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
2fdfff23-2be1-4d26-b324-2d2d7d89bd79	Jordan	الأردن	Irbid	اربد	اربد	بيت أديس	بيت أديس	بيت أديس	بيت أديس	\N	\N	بيت أديس بيت أديس اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
51da2ea2-9add-4ed1-8569-19a2f109593b	Jordan	الأردن	Irbid	اربد	اربد	بيت راس	بيت راس	بيت راس	بيت راس	\N	\N	بيت راس بيت راس اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
d372d042-6ed5-42b4-8423-81cf2a3c8b0a	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	بيرين	بيرين	مدرسه خديجه ام المؤمنين	مدرسه خديجه ام المؤمنين	\N	\N	مدرسه خديجه ام المؤمنين بيرين الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
1f021507-d0ff-40de-a95d-66e16589a976	Jordan	الأردن	Aqaba	العقبة	العقبة	تالابية	تالابية	تالابية	تالابية	\N	\N	تالابية تالابية العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
9f7adbbb-16da-4793-9c49-9c9c49152d5c	Jordan	الأردن	Irbid	اربد	اربد	تبنه	تبنه	تبنه	تبنه	\N	\N	تبنه تبنه اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
7f5928bd-d984-4ac8-a795-e51eca2e7b6d	Jordan	الأردن	Amman	عمان	عمان	تلاع العلي	تلاع العلي	طلوع نيفين	طلوع نيفين	\N	\N	طلوع نيفين تلاع العلي عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
7ecdd505-8afc-4e48-9a4a-3b8e4b5c02d1	Jordan	الأردن	Aqaba	العقبة	العقبة	جامعة العقبة التكنلوجيا	جامعة العقبة التكنلوجيا	جامعة العقبة التكنلوجيا	جامعة العقبة التكنلوجيا	\N	\N	جامعة العقبة التكنلوجيا جامعة العقبة التكنلوجيا العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
2f67f204-70d8-40dd-a4b4-0c6a7f19cad6	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	جامعه الزرقاء الخاصه	جامعه الزرقاء الخاصه	جامعه الزرقاء الخاصة	جامعه الزرقاء الخاصة	\N	\N	جامعه الزرقاء الخاصة جامعه الزرقاء الخاصه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5fc402f0-560e-4073-88b9-cd2a5b03426a	Jordan	الأردن	Irbid	اربد	اربد	جامعه العلوم والتكنولوجيا	جامعه العلوم والتكنولوجيا	جامعه العلوم والتكنولوجيا	جامعه العلوم والتكنولوجيا	\N	\N	جامعه العلوم والتكنولوجيا جامعه العلوم والتكنولوجيا اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
f0af32a0-e22e-4658-99c2-d848dea8117a	Jordan	الأردن	Amman	عمان	عمان	جاوا	جاوا	جاوا	جاوا	\N	\N	جاوا جاوا عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
110fa64b-d663-4abe-b3ea-4ed2bac59a41	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	جبل الأمير حسن	جبل الأمير حسن	جبل الأمير حسن	جبل الأمير حسن	\N	\N	جبل الأمير حسن جبل الأمير حسن الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5ef50496-8f6c-47df-b9ca-e615c82ec933	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	جبل الأمير حمزه	جبل الأمير حمزه	جبل الأمير حمزة	جبل الأمير حمزة	\N	\N	جبل الأمير حمزة جبل الأمير حمزه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
92e10160-440e-4d0a-8525-942ebd9d25ef	Jordan	الأردن	Amman	عمان	عمان	جبل التاج	جبل التاج	الطيبات جبل النظيف	الطيبات جبل النظيف	\N	\N	الطيبات جبل النظيف جبل التاج عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
66a9ac7d-e9ee-4977-884d-a7057843452a	Jordan	الأردن	Amman	عمان	عمان	جبل الجوفه	جبل الجوفه	نزول البلد	نزول البلد	\N	\N	نزول البلد جبل الجوفه عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
107285b5-f32d-4612-b504-ed9ed4609974	Jordan	الأردن	Amman	عمان	عمان	جبل الزهور	جبل الزهور	جبل الزهور	جبل الزهور	\N	\N	جبل الزهور جبل الزهور عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
b583d4f4-3925-4147-a14f-efa15312f62b	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	جبل الشمالي-الرصيفه	جبل الشمالي-الرصيفه	جبل الشمالي-الرصيفة	جبل الشمالي-الرصيفة	\N	\N	جبل الشمالي-الرصيفة جبل الشمالي-الرصيفه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
24a06f76-f64e-4e82-8809-f6ee85236848	Jordan	الأردن	Amman	عمان	عمان	جبل القصور	جبل القصور	القصور الملكيه	القصور الملكيه	\N	\N	القصور الملكيه جبل القصور عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
ec3084c9-eb92-4de8-8820-f7337f70995f	Jordan	الأردن	Amman	عمان	عمان	جبل القلعه	جبل القلعه	مكتب بريد الحسين الشرقي	مكتب بريد الحسين الشرقي	\N	\N	مكتب بريد الحسين الشرقي جبل القلعه عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
618ecd06-e926-4126-8756-cf0ea336069a	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	جبل المغير	جبل المغير	جبل المغير	جبل المغير	\N	\N	جبل المغير جبل المغير الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
92e54e46-a040-4c5b-927c-924b122479ff	Jordan	الأردن	Amman	عمان	عمان	جبل النزهه	جبل النزهه	سوق النزهه	سوق النزهه	\N	\N	سوق النزهه جبل النزهه عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
63f6c4b7-c967-4d8b-8dfa-2531f2ca1fcd	Jordan	الأردن	Amman	عمان	عمان	جبل النصر	جبل النصر	جبل النصر	جبل النصر	\N	\N	جبل النصر جبل النصر عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5d46b089-aca6-405f-ade3-0d784203e378	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	جبل طارق	جبل طارق	جبل طارق	جبل طارق	\N	\N	جبل طارق جبل طارق الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
3512cbc2-1ada-440b-9f26-4c765609d720	Jordan	الأردن	Amman	عمان	عمان	جبل عمان الدوار الاول	جبل عمان الدوار الاول	مدرسه مطران	مدرسه مطران	\N	\N	مدرسه مطران جبل عمان الدوار الاول عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
460a1c6f-784e-4b8f-aa89-52bb9db873d4	Jordan	الأردن	Amman	عمان	عمان	جبل عمان الدوار الثالث	جبل عمان الدوار الثالث	مستشفى عمان الجراحي	مستشفى عمان الجراحي	\N	\N	مستشفى عمان الجراحي جبل عمان الدوار الثالث عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
74efd03a-ca7a-4fae-984f-532a3106037e	Jordan	الأردن	Amman	عمان	عمان	جبل عمان الدوار الثاني	جبل عمان الدوار الثاني	السفاره التركيه	السفاره التركيه	\N	\N	السفاره التركيه جبل عمان الدوار الثاني عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
4dcd6bfb-870a-499e-b4aa-82dd7c1215de	Jordan	الأردن	Irbid	اربد	اربد	جديتا	جديتا	جديتا	جديتا	\N	\N	جديتا جديتا اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
0bdc500a-42b6-477c-9999-17a61ca87098	Jordan	الأردن	Irbid	اربد	اربد	جديد	جديد	مدارس دار العلوم	مدارس دار العلوم	\N	\N	مدارس دار العلوم جديد اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
77a431c9-f779-4d6e-9962-e741eea13f7c	Jordan	الأردن	Jerash	جرش	جرش	جرش	جرش	جرش	جرش	\N	\N	جرش جرش جرش	t	2	3.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
1d54f9fa-b9e7-4208-8e68-a8e2c67307df	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	جريبا	جريبا	جريبا	جريبا	\N	\N	جريبا جريبا الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
59be16f9-4cf6-4459-a02c-2b1830f15e6b	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	جسر الغباوي-ضاحيه ألاميره أيمان	جسر الغباوي-ضاحيه ألاميره أيمان	جسر الغباوي-ضاحيه ألاميره أيمان	جسر الغباوي-ضاحيه ألاميره أيمان	\N	\N	جسر الغباوي-ضاحيه ألاميره أيمان جسر الغباوي-ضاحيه ألاميره أيمان الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
3e0e469b-6761-4eb3-8cb5-4a5722892a61	Jordan	الأردن	Irbid	اربد	اربد	جمحا	جمحا	جمحا	جمحا	\N	\N	جمحا جمحا اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
a8aa1dda-1428-4b62-9802-c95d94db8290	Jordan	الأردن	Aqaba	العقبة	العقبة	جمرك اليتم	جمرك اليتم	جمرك اليتم	جمرك اليتم	\N	\N	جمرك اليتم جمرك اليتم العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
4735ff4c-498a-40a6-a556-6adb512e32d0	Jordan	الأردن	Aqaba	العقبة	العقبة	جمرك وادي عربة	جمرك وادي عربة	جمرك وادي عربة	جمرك وادي عربة	\N	\N	جمرك وادي عربة جمرك وادي عربة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
cd7074c3-7208-4192-9f84-a85bd45202b4	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	جناعه	جناعه	مسجد خالد بن الوليد	مسجد خالد بن الوليد	\N	\N	مسجد خالد بن الوليد جناعه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
70ab437a-9080-4381-a921-d8425a15c369	Jordan	الأردن	Irbid	اربد	اربد	حدائق الملك عبدالله	حدائق الملك عبدالله	حدائق الملك عبدالله	حدائق الملك عبدالله	\N	\N	حدائق الملك عبدالله حدائق الملك عبدالله اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
89db6664-7c2c-45a7-af55-f9de398063c3	Jordan	الأردن	Irbid	اربد	اربد	حرثا	حرثا	حرثا	حرثا	\N	\N	حرثا حرثا اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
7680590f-daa4-4edb-b508-65d7cfc1051c	Jordan	الأردن	Amman	عمان	عمان	حطين	حطين	حطين	حطين	\N	\N	حطين حطين عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
c8669cec-a7e6-47c4-845c-88c6145e7978	Jordan	الأردن	Irbid	اربد	اربد	حكما	حكما	حكما	حكما	\N	\N	حكما حكما اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
4cec6a26-c643-49f9-a991-b2c3f8ccd2d0	Jordan	الأردن	Irbid	اربد	اربد	حنينا	حنينا	مسجد الصفا و النور	مسجد الصفا و النور	\N	\N	مسجد الصفا و النور حنينا اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e0b600d9-b7ba-42f2-9990-b1eeae77ce47	Jordan	الأردن	Irbid	اربد	اربد	حواره	حواره	حوارة	حوارة	\N	\N	حوارة حواره اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
dd98a0ac-a388-49e0-aee2-fc07468fd947	Jordan	الأردن	Irbid	اربد	اربد	حوفا	حوفا	حوفا	حوفا	\N	\N	حوفا حوفا اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
3078b5a6-c739-4750-83c8-43250e3fc218	Jordan	الأردن	Irbid	اربد	اربد	حي الابرار	حي الابرار	مسجد علي بن ابي طالب	مسجد علي بن ابي طالب	\N	\N	مسجد علي بن ابي طالب حي الابرار اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
453f89b2-bedb-4135-b9ef-27a8c53ce891	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	حي الاسكان	حي الاسكان	حي الاسكان	حي الاسكان	\N	\N	حي الاسكان حي الاسكان الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
a0a64789-6925-4700-a55d-b31655921115	Jordan	الأردن	Irbid	اربد	اربد	حي الاطباء	حي الاطباء	مسجد خالد بن الوليد	مسجد خالد بن الوليد	\N	\N	مسجد خالد بن الوليد حي الاطباء اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
2d75985e-6874-482e-9df1-034d43b3a0fb	Jordan	الأردن	Irbid	اربد	اربد	حي الافراح	حي الافراح	مدرسه المثنى	مدرسه المثنى	\N	\N	مدرسه المثنى حي الافراح اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
4b8deb03-069e-4f13-bb01-daf1b61275ab	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	حي الامير عبدالله	حي الامير عبدالله	الزرقاء حي الامير عبدالله	الزرقاء حي الامير عبدالله	\N	\N	الزرقاء حي الامير عبدالله حي الامير عبدالله الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
40e3f5ee-c62e-4a9c-afdf-fd18e3a754d3	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	حي الامير محمد	حي الامير محمد	صيدليه الشحرور	صيدليه الشحرور	\N	\N	صيدليه الشحرور حي الامير محمد الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
d0ebc818-e531-4d67-a6cb-92f7c7c225c3	Jordan	الأردن	Irbid	اربد	اربد	حي التركمان	حي التركمان	حي التركمان	حي التركمان	\N	\N	حي التركمان حي التركمان اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
fb474080-79e9-4827-833c-0e956d45fd34	Jordan	الأردن	Irbid	اربد	اربد	حي التلول	حي التلول	حي التلول	حي التلول	\N	\N	حي التلول حي التلول اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
488b63e3-7f2d-4ded-9e35-723687beea55	Jordan	الأردن	Amman	عمان	عمان	حي الجندويل	حي الجندويل	المدينه الطبيه	المدينه الطبيه	\N	\N	المدينه الطبيه حي الجندويل عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
a10b8324-7ce5-4dc3-b582-de9c139db180	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	حي الجندي	حي الجندي	حي الجندي	حي الجندي	\N	\N	حي الجندي حي الجندي الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
ed0394f9-402a-4087-989e-20c5b420009e	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	حي الحسين	حي الحسين	حي الحسين	حي الحسين	\N	\N	حي الحسين حي الحسين الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
6d516356-b337-4147-ade6-6ea24cdd31fa	Jordan	الأردن	Amman	عمان	عمان	حي الديار	حي الديار	حي الديار	حي الديار	\N	\N	حي الديار حي الديار عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
354ead02-e796-4821-9972-62d1da8b18a8	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	حي الرشيد-الرصيفه	حي الرشيد-الرصيفه	حي الرشيد	حي الرشيد	\N	\N	حي الرشيد حي الرشيد-الرصيفه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
85e77161-4f0e-42a8-a686-cc528cfb7a8b	Jordan	الأردن	Irbid	اربد	اربد	حي الزهور	حي الزهور	حي الزهور	حي الزهور	\N	\N	حي الزهور حي الزهور اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
bb16992d-b5c3-4171-9790-9e8cdc030d35	Jordan	الأردن	Irbid	اربد	اربد	حي القصيله	حي القصيله	حي القصيلة	حي القصيلة	\N	\N	حي القصيلة حي القصيله اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e483a954-d90d-402a-96f7-89e18226fa79	Jordan	الأردن	Irbid	اربد	اربد	حي القفيلة	حي القفيلة	حي القفيلة	حي القفيلة	\N	\N	حي القفيلة حي القفيلة اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
59ceb62d-7dd0-4d5a-bcf7-af50ab3097ca	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	حي المعصوم	حي المعصوم	حي المعصوم	حي المعصوم	\N	\N	حي المعصوم حي المعصوم الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
aad0f99d-b861-489a-bd1e-4157f104797e	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	حي النزهه	حي النزهه	محطه سمير الجمزواي لزيوت السيارات	محطه سمير الجمزواي لزيوت السيارات	\N	\N	محطه سمير الجمزواي لزيوت السيارات حي النزهه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
fca0f67c-492d-42f4-afed-ab19fc5eca22	Jordan	الأردن	Irbid	اربد	اربد	حي الورود	حي الورود	قصر العدل	قصر العدل	\N	\N	قصر العدل حي الورود اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
11636662-a1fb-4006-ba6f-6d043ddbb1a0	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	حي جعفر الطيار	حي جعفر الطيار	حي جعفر الطيار	حي جعفر الطيار	\N	\N	حي جعفر الطيار حي جعفر الطيار الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
72c349b3-0843-404f-bfdf-3341f8fc9719	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	حي رمزي	حي رمزي	حي رمزي	حي رمزي	\N	\N	حي رمزي حي رمزي الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
84abbb33-1437-46f3-8195-02bbd77b24b5	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	حي شاكر	حي شاكر	حي شاكر	حي شاكر	\N	\N	حي شاكر حي شاكر الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
512abe72-aa12-4788-be2f-edf048860118	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	حي شبيب	حي شبيب	الزرقاء قصر شبيب	الزرقاء قصر شبيب	\N	\N	الزرقاء قصر شبيب حي شبيب الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
8359811c-a43e-4aed-93cd-0078970e5450	Jordan	الأردن	Irbid	اربد	اربد	حي طوال	حي طوال	حي طوال	حي طوال	\N	\N	حي طوال حي طوال اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
efea9fdf-cd07-4cf7-91e0-5cef41f9606a	Jordan	الأردن	Irbid	اربد	اربد	حي عاليه	حي عاليه	حي عالية	حي عالية	\N	\N	حي عالية حي عاليه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
46440777-72a9-49a4-b632-f77f15047594	Jordan	الأردن	Amman	عمان	عمان	حي نزال	حي نزال	مستشفى الحياه	مستشفى الحياه	\N	\N	مستشفى الحياه حي نزال عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
cab3082f-7f07-471c-a666-0f90af838803	Jordan	الأردن	Irbid	اربد	اربد	خربه قاسم	خربه قاسم	خربه قاسم	خربه قاسم	\N	\N	خربه قاسم خربه قاسم اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
bf7d31c5-6967-44dc-aedc-034503e95d9a	Jordan	الأردن	Irbid	اربد	اربد	خرجا	خرجا	خرجا	خرجا	\N	\N	خرجا خرجا اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
239a24ea-1f2f-46f3-af90-cf9940946fb5	Jordan	الأردن	Amman	عمان	عمان	خريبه السوق او خربه السوق	خريبه السوق او خربه السوق	سوبر ماركت 911	سوبر ماركت 911	\N	\N	سوبر ماركت 911 خريبه السوق او خربه السوق عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e0e07c22-7f17-4a0e-81c9-321ec4b2376f	Jordan	الأردن	Amman	عمان	عمان	خلدا	خلدا	الخالدين كارفور	الخالدين كارفور	\N	\N	الخالدين كارفور خلدا عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
fb4a81fa-bdf6-4403-be2d-3ffe8f4142bc	Jordan	الأردن	Irbid	اربد	اربد	خلف السيفوي	خلف السيفوي	خلف السيفوي	خلف السيفوي	\N	\N	خلف السيفوي خلف السيفوي اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
d5f74eda-24d5-486a-842e-010dbb1b3d36	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	خو	خو	خو	خو	\N	\N	خو خو الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
9e63b7c6-7ad8-439c-bc13-eb8a3c874b88	Jordan	الأردن	Amman	عمان	عمان	دابوق	دابوق	صيدليه دابوق	صيدليه دابوق	\N	\N	صيدليه دابوق دابوق عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
09385806-5702-48ac-a36a-e4540ad1b081	Jordan	الأردن	Irbid	اربد	اربد	دوار الثقافه	دوار الثقافه	دوار الثقافة	دوار الثقافة	\N	\N	دوار الثقافة دوار الثقافه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
b649ddf5-ed1d-4297-b0d0-bf3847ab26d8	Jordan	الأردن	Irbid	اربد	اربد	دوار الدره	دوار الدره	دوار الدرة	دوار الدرة	\N	\N	دوار الدرة دوار الدره اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
cbd1c14b-2a2c-4524-b3d6-ffdfb81267c2	Jordan	الأردن	Irbid	اربد	اربد	دوار العيادات	دوار العيادات	دوار العيادات	دوار العيادات	\N	\N	دوار العيادات دوار العيادات اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
ebd3c21b-cfc3-48c4-8cf6-b12263f5c7c2	Jordan	الأردن	Irbid	اربد	اربد	دوار القبه	دوار القبه	دوار القبة	دوار القبة	\N	\N	دوار القبة دوار القبه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
10e121b6-4777-4375-8688-808e65f9429e	Jordan	الأردن	Irbid	اربد	اربد	دوار القيروان	دوار القيروان	دوار القيروان	دوار القيروان	\N	\N	دوار القيروان دوار القيروان اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
b77e554b-f3e6-42a9-b240-dfdfa7fb68e0	Jordan	الأردن	Irbid	اربد	اربد	دوار الكساسبه	دوار الكساسبه	دوار الكساسبه	دوار الكساسبه	\N	\N	دوار الكساسبه دوار الكساسبه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
0f57e3b6-88f8-4314-bb9c-6df21c121cb0	Jordan	الأردن	Irbid	اربد	اربد	دوار اللوازم	دوار اللوازم	دوار اللوازم	دوار اللوازم	\N	\N	دوار اللوازم دوار اللوازم اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e36a9ace-c4ce-4166-8998-49ed9696a4b8	Jordan	الأردن	Irbid	اربد	اربد	دوار المغسله	دوار المغسله	دوار المغسله	دوار المغسله	\N	\N	دوار المغسله دوار المغسله اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
61e73334-4cd9-43f4-bfb8-7f50bec8a588	Jordan	الأردن	Irbid	اربد	اربد	دوار النسيم	دوار النسيم	دوار النسيم	دوار النسيم	\N	\N	دوار النسيم دوار النسيم اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
3ed9d11a-1478-4fbe-bfed-f99aff39a1e0	Jordan	الأردن	Irbid	اربد	اربد	دوار بديعة	دوار بديعة	دوار بديعة	دوار بديعة	\N	\N	دوار بديعة دوار بديعة اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
40921a3b-be76-4322-927a-23e4c33e3a1b	Jordan	الأردن	Irbid	اربد	اربد	دوار سال	دوار سال	دوار سال	دوار سال	\N	\N	دوار سال دوار سال اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
f5085bba-9bf2-48ba-8667-68bea26387b6	Jordan	الأردن	Irbid	اربد	اربد	دوار شركه الكهرباء	دوار شركه الكهرباء	دوار شركه الكهرباء	دوار شركه الكهرباء	\N	\N	دوار شركه الكهرباء دوار شركه الكهرباء اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
658002f1-4227-4ea6-a46b-20815676cb53	Jordan	الأردن	Irbid	اربد	اربد	دوار صحارى	دوار صحارى	دوار صحارى	دوار صحارى	\N	\N	دوار صحارى دوار صحارى اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
76418978-0cf3-4257-a115-0c57f3975454	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	دوقره	دوقره	دوقرة	دوقرة	\N	\N	دوقرة دوقره الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
78f24cb1-f03c-49f2-be61-b3e312fd161d	Jordan	الأردن	Irbid	اربد	اربد	دير أبي سعيد	دير أبي سعيد	دير أبي سعيد	دير أبي سعيد	\N	\N	دير أبي سعيد دير أبي سعيد اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
b0379603-91ea-4421-8df1-99ef8ab1587f	Jordan	الأردن	Irbid	اربد	اربد	دير السعنه	دير السعنه	دير السعنة	دير السعنة	\N	\N	دير السعنة دير السعنه اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
e26427b4-0ea9-4cdb-b516-12ab81b4c8f7	Jordan	الأردن	Amman	عمان	عمان	دير غبار	دير غبار	فندق شجره الزيتون	فندق شجره الزيتون	\N	\N	فندق شجره الزيتون دير غبار عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
5d365144-d89c-44e9-8d1d-e1dc42ca631d	Jordan	الأردن	Amman	عمان	عمان	راس العين	راس العين	بنك الاسكان  اشارات حي نزال	بنك الاسكان  اشارات حي نزال	\N	\N	بنك الاسكان  اشارات حي نزال راس العين عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
c43cd895-6635-4c48-a43b-3892c9d7e23b	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	رجم الشوك	رجم الشوك	رجم الشوك	رجم الشوك	\N	\N	رجم الشوك رجم الشوك الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
adb989b2-0416-416e-b1bc-18e23a65e173	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	رحمة	رحمة	الزرقاء جبل رحمة	الزرقاء جبل رحمة	\N	\N	الزرقاء جبل رحمة رحمة الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e83f8a14-010d-4caf-8810-d77de3605aa6	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	رمزي	رمزي	مكتبه الجذور	مكتبه الجذور	\N	\N	مكتبه الجذور رمزي الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
bda47c97-1069-4d75-b26f-ce0610a5d9e9	Jordan	الأردن	Irbid	اربد	اربد	زبده	زبده	زبدة	زبدة	\N	\N	زبدة زبده اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
a1383afc-5b00-40ea-9d8b-44b22419bf2d	Jordan	الأردن	Irbid	اربد	اربد	زوبيا	زوبيا	زوبيا	زوبيا	\N	\N	زوبيا زوبيا اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
17c459d4-7bf9-4871-9746-b86f5081c001	Jordan	الأردن	Aqaba	العقبة	العقبة	ساحة 4	ساحة 4	ساحة 4	ساحة 4	\N	\N	ساحة 4 ساحة 4 العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
38b9073b-0655-48ed-8c3c-079ddb46098f	Jordan	الأردن	Amman	عمان	عمان	سحاب	سحاب	المستنده	المستنده	\N	\N	المستنده سحاب عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
052e8e9d-3ef9-4be0-a864-326738465402	Jordan	الأردن	Irbid	اربد	اربد	سحم	سحم	سحم	سحم	\N	\N	سحم سحم اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
2c32b25c-b94f-4f04-8244-036fb4a12c23	Jordan	الأردن	Irbid	اربد	اربد	سموع	سموع	سموع	سموع	\N	\N	سموع سموع اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
1ed94ed8-1075-467a-b5cd-0b724d9eaf00	Jordan	الأردن	Aqaba	العقبة	العقبة	سيتي سنتر	سيتي سنتر	سيتي سنتر	سيتي سنتر	\N	\N	سيتي سنتر سيتي سنتر العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
7acd93bd-6f70-480e-b102-715f17a0e351	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	شارع 16	شارع 16	شارع 16	شارع 16	\N	\N	شارع 16 شارع 16 الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
3d590221-8df9-42ca-903c-9054f7369c0a	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	شارع 26	شارع 26	شارع 26	شارع 26	\N	\N	شارع 26 شارع 26 الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
a6f86cd2-547f-4883-8a0d-146fcab62018	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	شارع 36	شارع 36	شارع 36	شارع 36	\N	\N	شارع 36 شارع 36 الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5ec42074-b000-4c88-8790-039a190f3f41	Jordan	الأردن	Amman	عمان	عمان	شارع الاردن	شارع الاردن	شارع الاردن	شارع الاردن	\N	\N	شارع الاردن شارع الاردن عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
2691e6db-b8f9-4c4d-8f1c-61e97713df88	Jordan	الأردن	Irbid	اربد	اربد	شارع البارحه	شارع البارحه	شارع البارحة	شارع البارحة	\N	\N	شارع البارحة شارع البارحه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
9c146950-a6e9-4424-b7c8-18b11af396fb	Jordan	الأردن	Irbid	اربد	اربد	شارع البتراء	شارع البتراء	شارع البتراء	شارع البتراء	\N	\N	شارع البتراء شارع البتراء اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
92197960-fe60-46a4-b412-59e7391aec99	Jordan	الأردن	Irbid	اربد	اربد	شارع الثلاثين	شارع الثلاثين	شارع الثلاثين	شارع الثلاثين	\N	\N	شارع الثلاثين شارع الثلاثين اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
b47159e2-88cb-4e17-985b-b0f28850bf72	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	شارع الثلاثين	شارع الثلاثين	شارع الثلاثين	شارع الثلاثين	\N	\N	شارع الثلاثين شارع الثلاثين الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
93ccc06f-ac1e-4e99-96f3-926d38c64943	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	شارع الجيش	شارع الجيش	شارع الجيش	شارع الجيش	\N	\N	شارع الجيش شارع الجيش الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
fc590215-8898-41d9-b56e-22add6d6f269	Jordan	الأردن	Irbid	اربد	اربد	شارع الحصن	شارع الحصن	شارع الحصن	شارع الحصن	\N	\N	شارع الحصن شارع الحصن اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
9e7805d9-fe3f-456b-adc9-b4bb43ab7a2b	Jordan	الأردن	Aqaba	العقبة	العقبة	شارع السعاده (العقبة)	شارع السعاده (العقبة)	شارع السعاده (العقبة)	شارع السعاده (العقبة)	\N	\N	شارع السعاده (العقبة) شارع السعاده (العقبة) العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
1ed7aaab-4c6a-44b2-bdf5-64fc52b3ab51	Jordan	الأردن	Irbid	اربد	اربد	شارع القدس	شارع القدس	شارع القدس	شارع القدس	\N	\N	شارع القدس شارع القدس اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
2ff58e8c-b1e9-4a81-b713-7ffbc4d42a37	Jordan	الأردن	Amman	عمان	عمان	شارع المدينه المنوره	شارع المدينه المنوره	حلويات نفيسه	حلويات نفيسه	\N	\N	حلويات نفيسه شارع المدينه المنوره عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
e0459f20-07a0-4083-9c98-661c3bf2d048	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	شارع المصفاه	شارع المصفاه	شارع المصفاة	شارع المصفاة	\N	\N	شارع المصفاة شارع المصفاه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e92f3ba8-03c8-4e55-aa73-d3e7dadb503b	Jordan	الأردن	Irbid	اربد	اربد	شارع حكما	شارع حكما	شارع حكما	شارع حكما	\N	\N	شارع حكما شارع حكما اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
6b99d2a6-6805-44fe-a854-3e2be716be9a	Jordan	الأردن	Amman	عمان	عمان	شارع عبدالله غوشه	شارع عبدالله غوشه	شارع عبدالله غوشه	شارع عبدالله غوشه	\N	\N	شارع عبدالله غوشه شارع عبدالله غوشه عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
69fad4bd-e48b-41b3-9fbe-ca5fb8656a12	Jordan	الأردن	Irbid	اربد	اربد	شارع فلسطين	شارع فلسطين	شارع فلسطين	شارع فلسطين	\N	\N	شارع فلسطين شارع فلسطين اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
f087a013-e976-4296-942d-7be95abec147	Jordan	الأردن	Irbid	اربد	اربد	شارع فوعره	شارع فوعره	شارع فوعرة	شارع فوعرة	\N	\N	شارع فوعرة شارع فوعره اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
d79f7515-570c-4df1-a084-1faf5bdbcd26	Jordan	الأردن	Amman	عمان	عمان	شارع مكه	شارع مكه	شارع مكه	شارع مكه	\N	\N	شارع مكه شارع مكه عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
0709eec6-df1a-462a-9370-fd76091d9d2d	Jordan	الأردن	Aqaba	العقبة	العقبة	شط الغندور العقبة	شط الغندور العقبة	شط الغندور العقبة	شط الغندور العقبة	\N	\N	شط الغندور العقبة شط الغندور العقبة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
14ddcae7-c9ad-4002-bd7e-1adad24c43d1	Jordan	الأردن	Irbid	اربد	اربد	شطنا	شطنا	شطنا	شطنا	\N	\N	شطنا شطنا اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
9662bd8a-0f8f-4bca-817a-7f2c93220a00	Jordan	الأردن	Amman	عمان	عمان	شفا بدران	شفا بدران	حي الكوم  اشاره الكوم	حي الكوم  اشاره الكوم	\N	\N	حي الكوم  اشاره الكوم شفا بدران عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
50bbc887-fd88-4985-90e7-667e98ecd601	Jordan	الأردن	Aqaba	العقبة	العقبة	شويخ مول - العقبة	شويخ مول - العقبة	شويخ مول - العقبة	شويخ مول - العقبة	\N	\N	شويخ مول - العقبة شويخ مول - العقبة العقبة	t	1	3.50	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
ebd17416-4a6a-46c2-903f-0cd6e896ef94	Jordan	الأردن	Amman	عمان	عمان	صالحيه العابد	صالحيه العابد	صالحيه العابد	صالحيه العابد	\N	\N	صالحيه العابد صالحيه العابد عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
9aec51de-3ad5-4615-9dab-a3977f25c598	Jordan	الأردن	Irbid	اربد	اربد	صاله الشرق	صاله الشرق	صاله الشرق	صاله الشرق	\N	\N	صاله الشرق صاله الشرق اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e2fa464a-e0b9-4da5-808e-be6a4b4f624c	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	صروت	صروت	صروت	صروت	\N	\N	صروت صروت الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
0ab0cc24-5fbf-47cd-ab2a-45bba0aca83f	Jordan	الأردن	Aqaba	العقبة	العقبة	صلاح الدين	صلاح الدين	صلاح الدين	صلاح الدين	\N	\N	صلاح الدين صلاح الدين العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
f77f6d06-4a53-463b-8b39-093cfb95cc12	Jordan	الأردن	Irbid	اربد	اربد	صما	صما	صما	صما	\N	\N	صما صما اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
34f2e3af-7aa5-47ae-8fc4-4094c4333da1	Jordan	الأردن	Amman	عمان	عمان	صويلح	صويلح	كازيه جوبيترول صويلح	كازيه جوبيترول صويلح	\N	\N	كازيه جوبيترول صويلح صويلح عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
01b43666-9429-4cc3-a579-8c5028ba078a	Jordan	الأردن	Irbid	اربد	اربد	صيدور	صيدور	صيدور	صيدور	\N	\N	صيدور صيدور اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
e4be8626-0f9e-421f-b0f3-9a42a7caeb64	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	ضاحيه الأميره هيا	ضاحيه الأميره هيا	ضاحيه الأميره هيا	ضاحيه الأميره هيا	\N	\N	ضاحيه الأميره هيا ضاحيه الأميره هيا الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
c541104a-bd13-47eb-b0c7-46ed5a8d79f9	Jordan	الأردن	Amman	عمان	عمان	ضاحيه الاستقلال	ضاحيه الاستقلال	ضاحيه الاستقلال	ضاحيه الاستقلال	\N	\N	ضاحيه الاستقلال ضاحيه الاستقلال عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
9e583ff5-da13-4b11-a4ec-8a1004f13782	Jordan	الأردن	Amman	عمان	عمان	ضاحيه الاقصى	ضاحيه الاقصى	شرطه الاحداث	شرطه الاحداث	\N	\N	شرطه الاحداث ضاحيه الاقصى عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e9456ca2-89f8-45fe-9d71-6a6999c78be9	Jordan	الأردن	Amman	عمان	عمان	ضاحيه الامير حسن	ضاحيه الامير حسن	ضاحيه الامير حسن	ضاحيه الامير حسن	\N	\N	ضاحيه الامير حسن ضاحيه الامير حسن عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e639d739-d4d5-43b0-8470-578849aa34bf	Jordan	الأردن	Irbid	اربد	اربد	ضاحيه الامير راشد	ضاحيه الامير راشد	مجمع الداود او المطاعم	مجمع الداود او المطاعم	\N	\N	مجمع الداود او المطاعم ضاحيه الامير راشد اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
b5926801-482c-4a57-9713-55c1d50a31e0	Jordan	الأردن	Amman	عمان	عمان	ضاحيه الامير راشد	ضاحيه الامير راشد	مجمع الداود او المطاعم	مجمع الداود او المطاعم	\N	\N	مجمع الداود او المطاعم ضاحيه الامير راشد عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
72296cc7-2a68-4b05-9865-7a7a12f437e5	Jordan	الأردن	Amman	عمان	عمان	ضاحيه الحاج حسن	ضاحيه الحاج حسن	مسجد الامام مسلم	مسجد الامام مسلم	\N	\N	مسجد الامام مسلم ضاحيه الحاج حسن عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
dcf589c6-87f1-463a-9780-c552ce4495d6	Jordan	الأردن	Irbid	اربد	اربد	ضاحيه الحسين	ضاحيه الحسين	ضاحيه الحسين	ضاحيه الحسين	\N	\N	ضاحيه الحسين ضاحيه الحسين اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
83ee2ede-ed14-4b5b-abab-7cb74e942e9b	Jordan	الأردن	Amman	عمان	عمان	ضاحيه الحسين	ضاحيه الحسين	ضاحيه الحسين	ضاحيه الحسين	\N	\N	ضاحيه الحسين ضاحيه الحسين عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
f88bedee-f785-4d25-a5ce-190c1dc78f43	Jordan	الأردن	Amman	عمان	عمان	ضاحيه الرشيد	ضاحيه الرشيد	مدارس دار الارقم الاساسيه للبنين	مدارس دار الارقم الاساسيه للبنين	\N	\N	مدارس دار الارقم الاساسيه للبنين ضاحيه الرشيد عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
1ba05969-258a-46f7-8f2c-aaa6e45ea465	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	ضاحيه المدينه المنوره	ضاحيه المدينه المنوره	مؤسسه جلنار	مؤسسه جلنار	\N	\N	مؤسسه جلنار ضاحيه المدينه المنوره الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
4c98e287-22ff-4468-b2ce-af80b0d28741	Jordan	الأردن	Amman	عمان	عمان	ضاحيه الياسمين	ضاحيه الياسمين	دوار الخريطه	دوار الخريطه	\N	\N	دوار الخريطه ضاحيه الياسمين عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
0ec09d2a-20b2-4c72-97c9-20d75a0810e1	Jordan	الأردن	Amman	عمان	عمان	طريق المطار	طريق المطار	طريق المطار	طريق المطار	\N	\N	طريق المطار طريق المطار عمان	t	4	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
135389db-5db9-44c6-9fa0-b6b3599939cb	Jordan	الأردن	Aqaba	العقبة	العقبة	طريق المطار \\ العقبة	طريق المطار \\ العقبة	طريق المطار \\ العقبة	طريق المطار \\ العقبة	\N	\N	طريق المطار \\ العقبة طريق المطار \\ العقبة العقبة	t	4	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
ad2b41c4-b579-4291-ad4e-e4c4172e8990	Jordan	الأردن	Amman	عمان	عمان	عبدون	عبدون	عبدون الشمالي المركز الطبي العربي	عبدون الشمالي المركز الطبي العربي	\N	\N	عبدون الشمالي المركز الطبي العربي عبدون عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
84af3774-22b9-4ee4-bc46-ee6bc48078a1	Jordan	الأردن	Amman	عمان	عمان	عرجان	عرجان	عرجان فندق ريجينسي بالاس	عرجان فندق ريجينسي بالاس	\N	\N	عرجان فندق ريجينسي بالاس عرجان عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
24feabf5-04db-4d27-871a-366f899fa7e4	Jordan	الأردن	Irbid	اربد	اربد	عنبه	عنبه	عنبة	عنبة	\N	\N	عنبة عنبه اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
14c6dfcd-0e46-4bb8-a5c5-7e5ed72fd5ce	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	عوجان	عوجان	العيساوي للمواد التموينية	العيساوي للمواد التموينية	\N	\N	العيساوي للمواد التموينية عوجان الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
fb7f6322-4cff-4054-ad75-12bbdbd02925	Jordan	الأردن	Amman	عمان	عمان	عين الباشا	عين الباشا	عين الباشا	عين الباشا	\N	\N	عين الباشا عين الباشا عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
971f9c4d-4d4a-49f4-a85e-ec939ac1240f	Jordan	الأردن	Amman	عمان	عمان	عين غزال	عين غزال	صاله فلوريدا	صاله فلوريدا	\N	\N	صاله فلوريدا عين غزال عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e1763aa2-c994-4b81-88ca-e573cdaa7f5b	Jordan	الأردن	Irbid	اربد	اربد	غرفه التجاره	غرفه التجاره	غرفه التجارة	غرفه التجارة	\N	\N	غرفه التجارة غرفه التجاره اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
31754820-19b7-4d37-845b-e64c0bd03534	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	غريسا	غريسا	غريسا	غريسا	\N	\N	غريسا غريسا الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
d7dcb1c7-bc72-472c-b71f-50e18c736cac	Jordan	الأردن	Irbid	اربد	اربد	فندق الجود	فندق الجود	فندق الجود	فندق الجود	\N	\N	فندق الجود فندق الجود اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
21404093-6b3d-4522-b3b2-55318f184b27	Jordan	الأردن	Irbid	اربد	اربد	قديم MK	قديم MK	قديم MK	قديم MK	\N	\N	قديم mk قديم mk اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
61fd55df-30f2-4855-bfcd-07cb9f0873b3	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	قرطبه	قرطبه	قرطبه	قرطبه	\N	\N	قرطبه قرطبه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
19786716-7543-4859-a945-798724603fa0	Jordan	الأردن	Irbid	اربد	اربد	قرية الطيبة	قرية الطيبة	قرية الطيبة	قرية الطيبة	\N	\N	قرية الطيبة قرية الطيبة اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
a3ee8d23-1d5a-40cf-9f9f-e522864a78f4	Jordan	الأردن	Irbid	اربد	اربد	قريه حاتم	قريه حاتم	قريه حاتم	قريه حاتم	\N	\N	قريه حاتم قريه حاتم اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
10f3835b-85c3-473a-9c48-460c438e83f9	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	قصر الحلابات الشرقي	قصر الحلابات الشرقي	قصر الحلابات الشرقي	قصر الحلابات الشرقي	\N	\N	قصر الحلابات الشرقي قصر الحلابات الشرقي الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
0a71a2e5-171d-4e18-82a8-b8dc90cb2968	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	قصر الحلابات الغربي	قصر الحلابات الغربي	قصر الحلابات الغربي	قصر الحلابات الغربي	\N	\N	قصر الحلابات الغربي قصر الحلابات الغربي الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
7065a11d-405f-4df6-966d-836860659847	Jordan	الأردن	Amman	البلقاء	البلقاء	قطنه	قطنه	قطنة	قطنة	\N	\N	قطنة قطنه البلقاء	t	2	3.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
ed408801-f9d4-4d83-b0f0-f94c1efdc9df	Jordan	الأردن	Balqa	السلط	السلط	قطنه	قطنه	قطنة	قطنة	\N	\N	قطنة قطنه السلط	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
85f507ae-03d8-4e11-af68-f317cf24467f	Jordan	الأردن	Irbid	اربد	اربد	قم	قم	قم	قم	\N	\N	قم قم اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
363508f1-c67e-4bd3-b12e-535d4f6ec114	Jordan	الأردن	Irbid	اربد	اربد	قميم	قميم	قميم	قميم	\N	\N	قميم قميم اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
054b377a-4a78-425c-bfab-1913912f2dab	Jordan	الأردن	Irbid	اربد	اربد	كفر أسد	كفر أسد	كفر أسد	كفر أسد	\N	\N	كفر أسد كفر أسد اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
cbb166ea-fbce-44b0-b790-8125ecea93e0	Jordan	الأردن	Irbid	اربد	اربد	كفر ابيل	كفر ابيل	كفر ابيل	كفر ابيل	\N	\N	كفر ابيل كفر ابيل اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
2539f34e-5433-4924-93b7-4e0d7be782b1	Jordan	الأردن	Irbid	اربد	اربد	كفر الماء	كفر الماء	كفر الماء	كفر الماء	\N	\N	كفر الماء كفر الماء اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
f6ef142f-72eb-4048-911d-4fcc0060cef7	Jordan	الأردن	Irbid	اربد	اربد	كفر راكب	كفر راكب	كفر راكب	كفر راكب	\N	\N	كفر راكب كفر راكب اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
b04b272d-2317-4555-9d66-1406adf2077f	Jordan	الأردن	Irbid	اربد	اربد	كفر صوم	كفر صوم	كفر صوم	كفر صوم	\N	\N	كفر صوم كفر صوم اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
08916756-6cc1-454a-a7ae-7067e33309b9	Jordan	الأردن	Irbid	اربد	اربد	كفرعوان	كفرعوان	كفرعوان	كفرعوان	\N	\N	كفرعوان كفرعوان اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
d3a3130d-689f-45b7-a0a5-a20d6326fabb	Jordan	الأردن	Irbid	اربد	اربد	كفر يوبا	كفر يوبا	كفر يوبا	كفر يوبا	\N	\N	كفر يوبا كفر يوبا اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
d932cd72-3aee-426b-8a43-16b4597d4e62	Jordan	الأردن	Aqaba	العقبة	العقبة	كلية العقبة	كلية العقبة	كلية العقبة	كلية العقبة	\N	\N	كلية العقبة كلية العقبة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
856487d1-5c3e-44ba-84cf-239353f8d027	Jordan	الأردن	Irbid	اربد	اربد	كليه بنات اربد	كليه بنات اربد	كليه بنات اربد	كليه بنات اربد	\N	\N	كليه بنات اربد كليه بنات اربد اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
74d9d27e-212e-41fb-bdb1-59cb9aedba11	Jordan	الأردن	Irbid	اربد	اربد	لواء الطيبه	لواء الطيبه	لواء الطيبة	لواء الطيبة	\N	\N	لواء الطيبة لواء الطيبه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
21156962-72b6-4ae7-9f74-8021747c9b8b	Jordan	الأردن	Amman	البلقاء	البلقاء	ماحص	ماحص	ماحص	ماحص	\N	\N	ماحص ماحص البلقاء	t	2	3.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
97ccfb99-377d-49ce-abaf-d6ad21b09dbb	Jordan	الأردن	Balqa	السلط	السلط	ماحص	ماحص	ماحص	ماحص	\N	\N	ماحص ماحص السلط	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e402251f-506b-4862-a9ae-f032bf1b05be	Jordan	الأردن	Amman	عمان	عمان	مادبا	مادبا	طريق المطار - جسر مادبا	طريق المطار - جسر مادبا	\N	\N	طريق المطار - جسر مادبا مادبا عمان	t	4	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
ce229f43-7cd6-4c0c-8f8c-1097ef5aa79c	Jordan	الأردن	Amman	عمان	عمان	ماركا الجنوبيه	ماركا الجنوبيه	شارع الفداء	شارع الفداء	\N	\N	شارع الفداء ماركا الجنوبيه عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
7f8f95de-88e8-41a2-a21b-af0d6ad46800	Jordan	الأردن	Amman	عمان	عمان	ماركا الشماليه	ماركا الشماليه	مصنع حموده	مصنع حموده	\N	\N	مصنع حموده ماركا الشماليه عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
247ae30f-757d-48d0-a1cd-5994ac3ebdc2	Jordan	الأردن	Irbid	اربد	اربد	مجمع الاغوار الجديد	مجمع الاغوار الجديد	مجمع الاغوار الجديد	مجمع الاغوار الجديد	\N	\N	مجمع الاغوار الجديد مجمع الاغوار الجديد اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
ed792d40-0b9b-4165-9723-d3ac60f3598e	Jordan	الأردن	Irbid	اربد	اربد	مجمع الشمال	مجمع الشمال	مجمع الشمال	مجمع الشمال	\N	\N	مجمع الشمال مجمع الشمال اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
fcd0b819-6eab-439d-9485-38dfc8ad9d95	Jordan	الأردن	Irbid	اربد	اربد	مجمع الشيخ خليل	مجمع الشيخ خليل	مجمع الشيخ خليل	مجمع الشيخ خليل	\N	\N	مجمع الشيخ خليل مجمع الشيخ خليل اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5ecad927-47ac-474b-82ce-694a180894f7	Jordan	الأردن	Amman	عمان	عمان	مجمع رغدان	مجمع رغدان	المحطه	المحطه	\N	\N	المحطه مجمع رغدان عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
2950097e-6227-4b19-b5ef-5c8ecb22b5ed	Jordan	الأردن	Irbid	اربد	اربد	مجمع عمان الجديد	مجمع عمان الجديد	مجمع عمان الجديد	مجمع عمان الجديد	\N	\N	مجمع عمان الجديد مجمع عمان الجديد اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
5affd9cb-7741-4ad7-9476-387e887019b7	Jordan	الأردن	Aqaba	العقبة	العقبة	محطة المناصير - العقبة	محطة المناصير - العقبة	محطة المناصير - العقبة	محطة المناصير - العقبة	\N	\N	محطة المناصير - العقبة محطة المناصير - العقبة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
b275e8be-1576-44b5-95c2-a6a588daf5e4	Jordan	الأردن	Irbid	اربد	اربد	مخربا	مخربا	مخربا	مخربا	\N	\N	مخربا مخربا اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
2af42c4b-f3d6-4bb2-9deb-698f56807043	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	مدينه الشرق	مدينه الشرق	كليه الامير حسن للعلوم الاسلامية	كليه الامير حسن للعلوم الاسلامية	\N	\N	كليه الامير حسن للعلوم الاسلامية مدينه الشرق الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
9a36b32e-a729-4e43-8bed-e0625dd435e7	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	مربع المسلخ	مربع المسلخ	مربع المسلخ	مربع المسلخ	\N	\N	مربع المسلخ مربع المسلخ الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
8968b440-6429-4e74-9b4f-6506efe461bf	Jordan	الأردن	Amman	عمان	عمان	مرج الحمام	مرج الحمام	شارع ام عبهره	شارع ام عبهره	\N	\N	شارع ام عبهره مرج الحمام عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
1d94e31f-548d-4104-9620-f2fe163742ef	Jordan	الأردن	Irbid	اربد	اربد	مرو	مرو	مرو	مرو	\N	\N	مرو مرو اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
c56a9763-a459-47e8-ac21-38686857a5fb	Jordan	الأردن	Irbid	اربد	اربد	مستشفى الأميره بسمه	مستشفى الأميره بسمه	مستشفى الأميره بسمة	مستشفى الأميره بسمة	\N	\N	مستشفى الأميره بسمة مستشفى الأميره بسمه اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
57fc68b0-2747-4a7b-9362-bbaee97718f6	Jordan	الأردن	Aqaba	العقبة	العقبة	مستشفى الامير هاشم - العقبة	مستشفى الامير هاشم - العقبة	مستشفى الامير هاشم - العقبة	مستشفى الامير هاشم - العقبة	\N	\N	مستشفى الامير هاشم - العقبة مستشفى الامير هاشم - العقبة العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
1ab9c807-cc13-4462-abb3-b3d427753552	Jordan	الأردن	Irbid	اربد	اربد	مستشفى الملك عبدالله	مستشفى الملك عبدالله	مستشفى الملك عبدالله	مستشفى الملك عبدالله	\N	\N	مستشفى الملك عبدالله مستشفى الملك عبدالله اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
0b15976a-d00a-4ede-acbc-6f5c5237e2bc	Jordan	الأردن	Irbid	اربد	اربد	مستشفى ايدون العسكري	مستشفى ايدون العسكري	مستشفى ايدون العسكري	مستشفى ايدون العسكري	\N	\N	مستشفى ايدون العسكري مستشفى ايدون العسكري اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
66d6cbfa-4682-44db-8984-8df6d8a432bd	Jordan	الأردن	Irbid	اربد	اربد	مستشفى بديعة	مستشفى بديعة	مستشفى بديعة	مستشفى بديعة	\N	\N	مستشفى بديعة مستشفى بديعة اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
d2f467db-228d-4a49-a59c-d8a301ba123a	Jordan	الأردن	Aqaba	العقبة	العقبة	مستشفي العقبة الحديث	مستشفي العقبة الحديث	مستشفي العقبة الحديث	مستشفي العقبة الحديث	\N	\N	مستشفي العقبة الحديث مستشفي العقبة الحديث العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
efc59ed3-0cd2-4b85-9459-e146dfdfa2c7	Jordan	الأردن	Irbid	اربد	اربد	مسجد حسن التل	مسجد حسن التل	مسجد حسن التل	مسجد حسن التل	\N	\N	مسجد حسن التل مسجد حسن التل اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
642bb8b0-b837-45c1-9ae1-d58551915fa8	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	مصفاه البترول	مصفاه البترول	مصفاه البترول	مصفاه البترول	\N	\N	مصفاه البترول مصفاه البترول الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
e0f295ea-db8b-49eb-a636-339e57b95a4f	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	مكه المكرمه	مكه المكرمه	مطعم ابو الهيجاء	مطعم ابو الهيجاء	\N	\N	مطعم ابو الهيجاء مكه المكرمه الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
633d1816-811d-4b2c-b871-74252bb3e49f	Jordan	الأردن	Irbid	اربد	اربد	ملكا	ملكا	ملكا	ملكا	\N	\N	ملكا ملكا اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
12e772cd-e4f4-4fbd-bb68-17611a7ffc6e	Jordan	الأردن	Irbid	اربد	اربد	مندح	مندح	مندح	مندح	\N	\N	مندح مندح اربد	t	2	3.00	2025-09-01 06:15:38.961	2025-09-01 06:15:38.961
404cf624-b259-42f8-aeaa-67492d767ad4	Jordan	الأردن	Aqaba	العقبة	العقبة	منطقة الشامية	منطقة الشامية	منطقة الشامية	منطقة الشامية	\N	\N	منطقة الشامية منطقة الشامية العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
fa072306-423d-4517-9bd9-ede653fa8d71	Jordan	الأردن	Aqaba	العقبة	العقبة	منطقة الشامية(العقبة)	منطقة الشامية(العقبة)	منطقة الشامية(العقبة)	منطقة الشامية(العقبة)	\N	\N	منطقة الشامية(العقبة) منطقة الشامية(العقبة) العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
2393eb75-7660-4faa-8aef-4514a8d25a07	Jordan	الأردن	Amman	عمان	عمان	موبص	موبص	موبص	موبص	\N	\N	موبص موبص عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
eeaf71ef-8868-44c7-999c-1ed25fed475e	Jordan	الأردن	Aqaba	العقبة	العقبة	موسى زايد (قرية الراحه)	موسى زايد (قرية الراحه)	موسى زايد (قرية الراحه)	موسى زايد (قرية الراحه)	\N	\N	موسى زايد (قرية الراحه) موسى زايد (قرية الراحه) العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
a0fb16fc-eee2-406c-b4ba-fae22a9e994d	Jordan	الأردن	Aqaba	العقبة	العقبة	ميناء الحاوية	ميناء الحاوية	ميناء الحاوية	ميناء الحاوية	\N	\N	ميناء الحاوية ميناء الحاوية العقبة	t	2	4.00	2025-09-01 06:15:38.718	2025-09-01 06:15:38.718
1155ab39-0b18-4f33-a92d-84beaa6bc3a4	Jordan	الأردن	Amman	عمان	عمان	ناعور	ناعور	السامك	السامك	\N	\N	السامك ناعور عمان	t	2	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
092123e5-53f0-4bf5-802a-45c0be3abea1	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	نصار	نصار	مدرسه حي نصار الاساسيه	مدرسه حي نصار الاساسيه	\N	\N	مدرسه حي نصار الاساسيه نصار الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
51d53b93-4c6b-4375-b3aa-873e84e50bcd	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	وادي الحجر	وادي الحجر	وادي الحجر	وادي الحجر	\N	\N	وادي الحجر وادي الحجر الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
4d7748ac-e021-4d92-88e2-7a2352fda98b	Jordan	الأردن	Amman	عمان	عمان	وادي الحداده	وادي الحداده	اشاره مخيم الحسين	اشاره مخيم الحسين	\N	\N	اشاره مخيم الحسين وادي الحداده عمان	t	4	2.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
ecf321ee-2e92-40c3-81e3-18e5deb25247	Jordan	الأردن	Amman	عمان	عمان	وادي الرمم	وادي الرمم	اشاره بيتنا	اشاره بيتنا	\N	\N	اشاره بيتنا وادي الرمم عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
40e898b3-4d17-4441-887e-16cdebb09612	Jordan	الأردن	Amman	عمان	عمان	وادي السير	وادي السير	عراق الامير	عراق الامير	\N	\N	عراق الامير وادي السير عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
1c56ebac-d3ad-48a2-aac5-d2aa059028ba	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	وادي العش	وادي العش	وادي العش	وادي العش	\N	\N	وادي العش وادي العش الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
d239309f-da06-4c88-9bfd-5ea6d266e66b	Jordan	الأردن	Amman	عمان	عمان	وادي صقره	وادي صقره	وادي صقره	وادي صقره	\N	\N	وادي صقره وادي صقره عمان	t	2	2.50	2025-09-01 06:15:38.224	2025-09-01 06:15:38.224
7264d81c-f0d8-4587-932d-2b542b71d940	Jordan	الأردن	Irbid	اربد	اربد	وسط البلد اربد	وسط البلد اربد	Downtown	وسط البلد	\N	\N	وسط البلد وسط البلد اربد اربد	t	2	3.00	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
d5c00035-513d-48c2-89e8-d6e180a4ef62	Jordan	الأردن	Zarqa	الزرقاء	الزرقاء	ياجوز	ياجوز	ياجوز	ياجوز	\N	\N	ياجوز ياجوز الزرقاء	t	2	3.50	2025-09-01 06:15:38.448	2025-09-01 06:15:38.448
\.


--
-- Data for Name: delivery_zones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_zones (id, branch_id, "zoneName", zone_name_slug, delivery_fee, priority_level, is_active, polygon, center_lat, center_lng, radius, created_at, updated_at, deleted_at, created_by, updated_by, global_location_id, average_delivery_time_mins) FROM stdin;
2c8dd661-9445-4c32-b2ca-885adcd8f66b	40f863e7-b719-4142-8e94-724572002d9b	{"ar": "وسط عمان", "en": "Downtown Amman"}	downtown-amman-002d9b	\N	1	t	\N	31.95390000	35.91060000	3.00	2025-09-01 05:22:28.463	2025-09-01 05:22:28.463	\N	\N	\N	\N	\N
e9500a10-751a-4d4b-9237-834e9626a295	40f863e7-b719-4142-8e94-724572002d9b	{"ar": "منطقة العبدلي التجارية", "en": "Abdali Business District"}	abdali-business-district-002d9b	\N	1	t	\N	31.96280000	35.90940000	2.50	2025-09-01 05:22:28.469	2025-09-01 05:22:28.469	\N	\N	\N	\N	\N
720af279-921a-4a02-8c9c-1ba9b3875c37	40f863e7-b719-4142-8e94-724572002d9b	{"ar": "الصويفية التجاري", "en": "Sweifieh Commercial"}	sweifieh-commercial-002d9b	\N	2	t	\N	31.93420000	35.87560000	4.00	2025-09-01 05:22:28.473	2025-09-01 05:22:28.473	\N	\N	\N	\N	\N
a294cda2-056c-443c-a032-7bf38bcb8d0d	40f863e7-b719-4142-8e94-724572002d9b	{"ar": "جبل عمان السكني", "en": "Jabal Amman Residential"}	jabal-amman-residential-002d9b	\N	2	t	\N	31.95150000	35.92390000	3.50	2025-09-01 05:22:28.478	2025-09-01 05:22:28.478	\N	\N	\N	\N	\N
cace098b-d2a2-4a50-8505-fc20306b8ebc	40f863e7-b719-4142-8e94-724572002d9b	{"ar": "الشميساني التجاري", "en": "Shmeisani Business"}	shmeisani-business-002d9b	\N	1	t	\N	31.96060000	35.90350000	2.00	2025-09-01 05:22:28.482	2025-09-01 05:22:28.482	\N	\N	\N	\N	\N
081262c2-a224-4ac8-83eb-4a0ab93fb943	b558e6c0-0866-4acd-9693-7c0a502e9df7	{"ar": "الزرقاء الصناعي", "en": "Zarqa Industrial"}	zarqa-industrial-2e9df7	\N	3	t	\N	32.07280000	36.08800000	6.00	2025-09-01 05:22:28.486	2025-09-01 05:22:28.486	\N	\N	\N	\N	\N
92994d59-25fd-41dd-b76b-655b0c117c90	b558e6c0-0866-4acd-9693-7c0a502e9df7	{"ar": "منطقة مطار ماركا", "en": "Marka Airport Area"}	marka-airport-area-2e9df7	\N	3	t	\N	31.97220000	35.99280000	4.50	2025-09-01 05:22:28.492	2025-09-01 05:22:28.492	\N	\N	\N	\N	\N
5967605c-c910-4d5b-8b7b-2c0d7b8fb2d9	c91db38e-ef89-44c6-8f7d-57de5e91d903	{"ar": "منطقة الجبيهة الجامعية", "en": "Jubeiha University Area"}	jubeiha-university-area-91d903	\N	2	t	\N	32.01350000	35.87150000	3.00	2025-09-01 05:22:28.496	2025-09-01 05:22:28.496	\N	\N	\N	\N	\N
5b0cae92-72b8-4be7-a8c8-ea7b97387c51	c91db38e-ef89-44c6-8f7d-57de5e91d903	{"ar": "طريق المطار التجاري", "en": "Airport Road Commercial"}	airport-road-commercial-91d903	\N	2	t	\N	31.89750000	35.94420000	5.00	2025-09-01 05:22:28.5	2025-09-01 05:22:28.5	\N	\N	\N	\N	\N
f9d20c16-5aad-41d1-8b60-d45784d9330d	40f863e7-b719-4142-8e94-724572002d9b	{"ar": "السلط المدينة التاريخية", "en": "Salt Historic City"}	salt-historic-city-002d9b	\N	4	f	\N	32.03890000	35.72780000	3.00	2025-09-01 05:22:28.504	2025-09-01 05:22:28.504	\N	\N	\N	\N	\N
759609cc-6333-4102-8e66-afd0078f6272	40f863e7-b719-4142-8e94-724572002d9b	{"ar": "وادي صقرة السكني", "en": "Wadi Saqra Residential"}	wadi-saqra-residential-002d9b	\N	2	t	\N	31.97000000	35.89000000	2.80	2025-09-01 05:22:28.508	2025-09-01 05:22:28.508	\N	\N	\N	\N	\N
1bd44e4a-f1b1-4e5b-906b-b5b3d232e7e7	b558e6c0-0866-4acd-9693-7c0a502e9df7	{"ar": "منطقة الجامعة الأردنية", "en": "Jordan University Area"}	jordan-university-area-2e9df7	\N	2	t	\N	32.01030000	35.87290000	2.50	2025-09-01 05:22:28.512	2025-09-01 05:22:28.512	\N	\N	\N	\N	\N
223418fc-a5fb-406a-b22b-18b449c8f166	f97ceb38-c797-4d1c-9ff4-89d9f8da5235	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 12:15:29.932	2025-09-01 12:59:57.078	2025-09-01 12:59:57.076	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
852c2b1a-b628-43c1-b222-7b893a850d49	40f863e7-b719-4142-8e94-724572002d9b	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 12:16:22.221	2025-09-01 12:59:58.981	2025-09-01 12:59:58.98	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
c257ccaa-0e13-4128-8b61-a276c15d3084	eb4d5daa-c58c-4369-a454-047db8ac3f50	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 12:16:46.894	2025-09-01 12:59:59.878	2025-09-01 12:59:59.877	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
0e197718-597e-4b26-9a9a-0fd34af62e89	b558e6c0-0866-4acd-9693-7c0a502e9df7	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 12:16:57.618	2025-09-01 13:00:00.992	2025-09-01 13:00:00.991	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
bb35f35a-c373-4796-b06b-ffc36b83ddd5	eb4d5daa-c58c-4369-a454-047db8ac3f50	{"ar": "العبدلي", "en": "Abdali"}	abdali	\N	2	f	\N	\N	\N	\N	2025-09-01 12:15:40.937	2025-09-01 13:00:27.656	2025-09-01 13:00:27.655	\N	\N	ae696579-c67c-4b6f-8e7f-5d04effb32cb	30
7ca54dfa-9edf-4b8d-9d81-2403973ecf7c	40f863e7-b719-4142-8e94-724572002d9b	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 13:04:21.789	2025-09-01 13:04:25.94	2025-09-01 13:04:25.939	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
65546c9f-d260-42b4-9459-760fcb40066c	f97ceb38-c797-4d1c-9ff4-89d9f8da5235	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 13:04:21.791	2025-09-01 13:06:38.257	2025-09-01 13:06:38.256	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
b6e6c1c9-e891-4e25-b770-dfeeb5001b71	f3d4114a-0e39-43fd-aa98-01b57df7efd0	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 13:04:21.795	2025-09-01 13:07:46.99	2025-09-01 13:07:46.989	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
146dce61-eeb6-4de6-a9d0-c11754a34613	f97ceb38-c797-4d1c-9ff4-89d9f8da5235	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 13:11:29.755	2025-09-01 13:11:36.787	2025-09-01 13:11:36.786	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
9b1056fe-338f-45d2-93c9-0bdbcbdeedab	40f863e7-b719-4142-8e94-724572002d9b	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 13:11:29.759	2025-09-01 13:11:39.153	2025-09-01 13:11:39.151	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
e3faf21e-6d25-4b7f-91ca-7ed85828a7c4	f97ceb38-c797-4d1c-9ff4-89d9f8da5235	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 13:12:02.427	2025-09-01 13:22:01.108	2025-09-01 13:22:01.107	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
e8b07ccd-97a2-494f-9b75-f402d6db57c5	b558e6c0-0866-4acd-9693-7c0a502e9df7	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 13:12:42.351	2025-09-01 13:28:27.043	2025-09-01 13:28:27.042	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
7102eabb-d0ec-40ef-b3a0-fc3fa01ac55d	c91db38e-ef89-44c6-8f7d-57de5e91d903	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 13:12:02.428	2025-09-01 13:28:29.225	2025-09-01 13:28:29.223	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
a73898f1-23e8-4eaa-9f27-3e1a31b8ff7b	eb4d5daa-c58c-4369-a454-047db8ac3f50	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 13:12:02.428	2025-09-01 13:28:30.36	2025-09-01 13:28:30.359	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
062c0ee7-91d2-4291-8c32-bf7a2a565402	40f863e7-b719-4142-8e94-724572002d9b	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 13:12:02.437	2025-09-01 13:28:31.095	2025-09-01 13:28:31.094	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
b035fec0-9db5-446c-8031-6531d67947f2	f3d4114a-0e39-43fd-aa98-01b57df7efd0	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 13:12:32.741	2025-09-01 13:28:32.08	2025-09-01 13:28:32.079	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
0eb6737c-a727-444e-ab58-cd4d51e4bfa9	f97ceb38-c797-4d1c-9ff4-89d9f8da5235	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 13:40:23.172	2025-09-01 14:21:57.229	2025-09-01 14:21:57.228	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
5ef06b70-dd9f-48de-8a9e-9bb7916bc880	eb4d5daa-c58c-4369-a454-047db8ac3f50	{"ar": " اشارات اليوسفي", "en": " اشارات اليوسفي"}		\N	2	f	\N	\N	\N	\N	2025-09-01 13:40:23.176	2025-09-01 14:21:58.051	2025-09-01 14:21:58.05	\N	\N	05ec80fe-9967-4ad2-b5ab-2b6c3da038ff	30
34b36485-0ab3-4c21-9bb6-940afaeb294e	40f863e7-b719-4142-8e94-724572002d9b	{"ar": "test121", "en": "test121"}	test121	\N	2	t	\N	\N	\N	\N	2025-09-01 16:04:16.57	2025-09-01 16:04:16.57	\N	\N	\N	6048c956-17fa-40a2-9bd8-1a8beee329c7	30
b41e548b-9f05-45b2-bc95-6958d5dc275b	f97ceb38-c797-4d1c-9ff4-89d9f8da5235	{"ar": "test121", "en": "test121"}	test121	\N	2	t	\N	\N	\N	\N	2025-09-01 16:04:16.571	2025-09-01 16:04:16.571	\N	\N	\N	6048c956-17fa-40a2-9bd8-1a8beee329c7	30
d7bc2458-a12a-4363-b7e5-81ae0d012824	f3d4114a-0e39-43fd-aa98-01b57df7efd0	{"ar": "test121", "en": "test121"}	test121	\N	2	t	\N	\N	\N	\N	2025-09-01 16:04:16.572	2025-09-01 16:04:16.572	\N	\N	\N	6048c956-17fa-40a2-9bd8-1a8beee329c7	30
\.


--
-- Data for Name: license_audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.license_audit_logs (id, license_id, action, old_data, new_data, user_id, "timestamp") FROM stdin;
1	d6a803ce-c7a3-496c-b460-c26fcd8e59be	UPDATE	{"id": "d6a803ce-c7a3-496c-b460-c26fcd8e59be", "status": "active", "features": ["basic"], "company_id": "b4830b4e-be20-4bba-8b3e-a0f0d2213749", "created_at": "2025-08-30T18:41:30.022", "created_by": null, "expires_at": "2025-09-29T18:41:30.02", "renewed_at": null, "start_date": "2025-08-30T18:41:30.02", "total_days": 30, "updated_at": "2025-08-30T18:41:30.022", "updated_by": null, "last_checked": "2025-08-30T18:41:30.02", "days_remaining": 30}	{"id": "d6a803ce-c7a3-496c-b460-c26fcd8e59be", "status": "active", "features": ["basic"], "company_id": "b4830b4e-be20-4bba-8b3e-a0f0d2213749", "created_at": "2025-08-30T18:41:30.022", "created_by": null, "expires_at": "2025-09-29T18:41:30.02", "renewed_at": null, "start_date": "2025-08-30T18:41:30.02", "total_days": 30, "updated_at": "2025-09-01T00:00:00.034", "updated_by": null, "last_checked": "2025-09-01T00:00:00.033", "days_remaining": 29}	\N	2025-09-01 00:00:00.034464
2	eef7b459-8a50-41b9-85f9-824b7c276ea6	UPDATE	{"id": "eef7b459-8a50-41b9-85f9-824b7c276ea6", "status": "active", "features": ["basic"], "company_id": "a13343e5-3109-4dc7-8f75-77982f0cfc7a", "created_at": "2025-08-30T18:41:53.168", "created_by": null, "expires_at": "2025-09-29T18:41:53.167", "renewed_at": null, "start_date": "2025-08-30T18:41:53.167", "total_days": 30, "updated_at": "2025-08-30T18:41:53.168", "updated_by": null, "last_checked": "2025-08-30T18:41:53.167", "days_remaining": 30}	{"id": "eef7b459-8a50-41b9-85f9-824b7c276ea6", "status": "active", "features": ["basic"], "company_id": "a13343e5-3109-4dc7-8f75-77982f0cfc7a", "created_at": "2025-08-30T18:41:53.168", "created_by": null, "expires_at": "2025-09-29T18:41:53.167", "renewed_at": null, "start_date": "2025-08-30T18:41:53.167", "total_days": 30, "updated_at": "2025-09-01T00:00:00.045", "updated_by": null, "last_checked": "2025-09-01T00:00:00.044", "days_remaining": 29}	\N	2025-09-01 00:00:00.045163
3	a91c9849-509f-4213-aef4-907bd1b2d050	UPDATE	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["analytics", "multi_location"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2027-01-27T18:50:18.37", "renewed_at": "2025-08-30T21:25:38.802", "start_date": "2025-08-30T18:50:18.37", "total_days": 515, "updated_at": "2025-08-30T21:25:38.805", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T21:25:38.802", "days_remaining": 515}	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["analytics", "multi_location"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2027-01-27T18:50:18.37", "renewed_at": "2025-08-30T21:25:38.802", "start_date": "2025-08-30T18:50:18.37", "total_days": 515, "updated_at": "2025-09-01T00:00:00.047", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-01T00:00:00.046", "days_remaining": 514}	\N	2025-09-01 00:00:00.047152
4	38da34d2-3e21-4e14-a8c5-6b39c4cdde31	UPDATE	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-03-27T19:08:57.106", "renewed_at": "2025-08-30T21:25:42.664", "start_date": "2025-08-29T19:08:57.106", "total_days": 210, "updated_at": "2025-08-30T21:25:42.666", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T21:25:42.664", "days_remaining": 209}	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-03-27T19:08:57.106", "renewed_at": "2025-08-30T21:25:42.664", "start_date": "2025-08-29T19:08:57.106", "total_days": 210, "updated_at": "2025-09-01T00:00:00.049", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-01T00:00:00.048", "days_remaining": 208}	\N	2025-09-01 00:00:00.048771
5	4452ed54-28a6-446e-9281-651e6b5b0ec2	UPDATE	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-02-05T13:54:01.426", "renewed_at": "2025-08-30T21:25:46.155", "start_date": "2025-08-09T13:54:01.426", "total_days": 180, "updated_at": "2025-08-30T21:25:46.163", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-30T21:25:46.155", "days_remaining": 159}	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-02-05T13:54:01.426", "renewed_at": "2025-08-30T21:25:46.155", "start_date": "2025-08-09T13:54:01.426", "total_days": 180, "updated_at": "2025-09-01T00:00:00.05", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-01T00:00:00.049", "days_remaining": 158}	\N	2025-09-01 00:00:00.050333
6	b037f11f-b98e-4dd2-a5e6-b8cc37cf58b7	UPDATE	{"id": "b037f11f-b98e-4dd2-a5e6-b8cc37cf58b7", "status": "active", "features": ["analytics", "multi_location"], "company_id": "5b7c4bdc-5649-49bd-9f6e-3a87a583d750", "created_at": "2025-08-29T19:25:04.687", "created_by": null, "expires_at": "2026-12-27T19:25:04.684", "renewed_at": "2025-08-29T19:25:23.164", "start_date": "2025-08-29T19:25:04.684", "total_days": 485, "updated_at": "2025-08-31T00:00:00.046", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-31T00:00:00.041", "days_remaining": 484}	{"id": "b037f11f-b98e-4dd2-a5e6-b8cc37cf58b7", "status": "active", "features": ["analytics", "multi_location"], "company_id": "5b7c4bdc-5649-49bd-9f6e-3a87a583d750", "created_at": "2025-08-29T19:25:04.687", "created_by": null, "expires_at": "2026-12-27T19:25:04.684", "renewed_at": "2025-08-29T19:25:23.164", "start_date": "2025-08-29T19:25:04.684", "total_days": 485, "updated_at": "2025-09-01T00:00:00.053", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-01T00:00:00.051", "days_remaining": 483}	\N	2025-09-01 00:00:00.053569
7	lic_sample_001	UPDATE	{"id": "lic_sample_001", "status": "active", "features": ["pos_integration", "analytics", "multi_branch"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2024-09-13T17:15:55.124", "created_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "expires_at": "2026-10-23T17:15:55.124", "renewed_at": "2025-08-29T18:24:23.816", "start_date": "2024-09-13T17:15:55.124", "total_days": 770, "updated_at": "2025-08-31T00:00:00.072", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-08-31T00:00:00.069", "days_remaining": 419}	{"id": "lic_sample_001", "status": "active", "features": ["pos_integration", "analytics", "multi_branch"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2024-09-13T17:15:55.124", "created_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "expires_at": "2026-10-23T17:15:55.124", "renewed_at": "2025-08-29T18:24:23.816", "start_date": "2024-09-13T17:15:55.124", "total_days": 770, "updated_at": "2025-09-01T00:00:00.055", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-01T00:00:00.054", "days_remaining": 418}	\N	2025-09-01 00:00:00.055462
8	adaaf5c8-28f7-402f-843a-029e1e297f45	UPDATE	{"id": "adaaf5c8-28f7-402f-843a-029e1e297f45", "status": "active", "features": ["basic"], "company_id": "ee1b200f-bd2b-4d23-a3ff-1ce80ef90a0a", "created_at": "2025-08-29T19:07:13.199", "created_by": null, "expires_at": "2025-09-28T19:07:13.198", "renewed_at": null, "start_date": "2025-08-29T19:07:13.198", "total_days": 30, "updated_at": "2025-08-31T00:00:00.084", "updated_by": null, "last_checked": "2025-08-31T00:00:00.082", "days_remaining": 29}	{"id": "adaaf5c8-28f7-402f-843a-029e1e297f45", "status": "active", "features": ["basic"], "company_id": "ee1b200f-bd2b-4d23-a3ff-1ce80ef90a0a", "created_at": "2025-08-29T19:07:13.199", "created_by": null, "expires_at": "2025-09-28T19:07:13.198", "renewed_at": null, "start_date": "2025-08-29T19:07:13.198", "total_days": 30, "updated_at": "2025-09-01T00:00:00.057", "updated_by": null, "last_checked": "2025-09-01T00:00:00.056", "days_remaining": 28}	\N	2025-09-01 00:00:00.056953
9	4452ed54-28a6-446e-9281-651e6b5b0ec2	UPDATE	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-02-05T13:54:01.426", "renewed_at": "2025-08-30T21:25:46.155", "start_date": "2025-08-09T13:54:01.426", "total_days": 180, "updated_at": "2025-09-01T00:00:00.05", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-01T00:00:00.049", "days_remaining": 158}	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-02-06T13:54:01.426", "renewed_at": "2025-09-01T11:34:58.82", "start_date": "2025-08-09T13:54:01.426", "total_days": 181, "updated_at": "2025-09-01T11:34:58.821", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-01T11:34:58.82", "days_remaining": 159}	\N	2025-09-01 11:34:58.821567
10	a91c9849-509f-4213-aef4-907bd1b2d050	UPDATE	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["analytics", "multi_location"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2027-01-27T18:50:18.37", "renewed_at": "2025-08-30T21:25:38.802", "start_date": "2025-08-30T18:50:18.37", "total_days": 515, "updated_at": "2025-09-01T00:00:00.047", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-01T00:00:00.046", "days_remaining": 514}	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["analytics", "multi_location"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2027-02-26T18:50:18.37", "renewed_at": "2025-09-02T16:42:53.865", "start_date": "2025-08-30T18:50:18.37", "total_days": 545, "updated_at": "2025-09-02T16:42:53.867", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-02T16:42:53.865", "days_remaining": 543}	\N	2025-09-02 16:42:53.867799
11	38da34d2-3e21-4e14-a8c5-6b39c4cdde31	UPDATE	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-03-27T19:08:57.106", "renewed_at": "2025-08-30T21:25:42.664", "start_date": "2025-08-29T19:08:57.106", "total_days": 210, "updated_at": "2025-09-01T00:00:00.049", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-01T00:00:00.048", "days_remaining": 208}	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-04-26T19:08:57.106", "renewed_at": "2025-09-02T16:42:58.062", "start_date": "2025-08-29T19:08:57.106", "total_days": 240, "updated_at": "2025-09-02T16:42:58.064", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-02T16:42:58.062", "days_remaining": 237}	\N	2025-09-02 16:42:58.064694
12	4452ed54-28a6-446e-9281-651e6b5b0ec2	UPDATE	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-02-06T13:54:01.426", "renewed_at": "2025-09-01T11:34:58.82", "start_date": "2025-08-09T13:54:01.426", "total_days": 181, "updated_at": "2025-09-01T11:34:58.821", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-01T11:34:58.82", "days_remaining": 159}	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-03-08T13:54:01.426", "renewed_at": "2025-09-02T16:43:08.363", "start_date": "2025-08-09T13:54:01.426", "total_days": 211, "updated_at": "2025-09-02T16:43:08.366", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-02T16:43:08.363", "days_remaining": 187}	\N	2025-09-02 16:43:08.366805
13	4452ed54-28a6-446e-9281-651e6b5b0ec2	UPDATE	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-03-08T13:54:01.426", "renewed_at": "2025-09-02T16:43:08.363", "start_date": "2025-08-09T13:54:01.426", "total_days": 211, "updated_at": "2025-09-02T16:43:08.366", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-02T16:43:08.363", "days_remaining": 187}	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["basic"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-03-08T13:54:01.426", "renewed_at": "2025-09-02T16:43:08.363", "start_date": "2025-08-09T13:54:01.426", "total_days": 211, "updated_at": "2025-09-02T16:43:16.572", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-02T16:43:08.363", "days_remaining": 187}	\N	2025-09-02 16:43:16.56397
14	4452ed54-28a6-446e-9281-651e6b5b0ec2	UPDATE	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["basic"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-03-08T13:54:01.426", "renewed_at": "2025-09-02T16:43:08.363", "start_date": "2025-08-09T13:54:01.426", "total_days": 211, "updated_at": "2025-09-02T16:43:16.572", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-02T16:43:08.363", "days_remaining": 187}	{"id": "4452ed54-28a6-446e-9281-651e6b5b0ec2", "status": "active", "features": ["analytics", "multi_location"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2025-08-09T13:54:01.426", "created_by": null, "expires_at": "2026-03-08T13:54:01.426", "renewed_at": "2025-09-02T16:43:08.363", "start_date": "2025-08-09T13:54:01.426", "total_days": 211, "updated_at": "2025-09-02T16:43:23.275", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-02T16:43:08.363", "days_remaining": 187}	\N	2025-09-02 16:43:23.261453
15	7e86bed0-2f03-4f32-a812-ad81316b34f3	INSERT	\N	{"id": "7e86bed0-2f03-4f32-a812-ad81316b34f3", "status": "active", "features": ["basic"], "company_id": "aa896a02-e087-40a9-b981-d30c49a5c0a6", "created_at": "2025-09-02T20:41:23.087", "created_by": null, "expires_at": "2025-10-02T20:41:23.085", "renewed_at": null, "start_date": "2025-09-02T20:41:23.085", "total_days": 30, "updated_at": "2025-09-02T20:41:23.087", "updated_by": null, "last_checked": "2025-09-02T20:41:23.085", "days_remaining": 30}	\N	2025-09-02 20:41:23.081334
16	7e86bed0-2f03-4f32-a812-ad81316b34f3	UPDATE	{"id": "7e86bed0-2f03-4f32-a812-ad81316b34f3", "status": "active", "features": ["basic"], "company_id": "aa896a02-e087-40a9-b981-d30c49a5c0a6", "created_at": "2025-09-02T20:41:23.087", "created_by": null, "expires_at": "2025-10-02T20:41:23.085", "renewed_at": null, "start_date": "2025-09-02T20:41:23.085", "total_days": 30, "updated_at": "2025-09-02T20:41:23.087", "updated_by": null, "last_checked": "2025-09-02T20:41:23.085", "days_remaining": 30}	{"id": "7e86bed0-2f03-4f32-a812-ad81316b34f3", "status": "active", "features": ["basic"], "company_id": "aa896a02-e087-40a9-b981-d30c49a5c0a6", "created_at": "2025-09-02T20:41:23.087", "created_by": null, "expires_at": "2025-10-02T20:41:23.085", "renewed_at": null, "start_date": "2025-09-02T20:41:23.085", "total_days": 30, "updated_at": "2025-09-02T20:41:30.113", "updated_by": null, "last_checked": "2025-09-02T20:41:23.085", "days_remaining": 30}	\N	2025-09-02 20:41:30.101911
17	7e86bed0-2f03-4f32-a812-ad81316b34f3	UPDATE	{"id": "7e86bed0-2f03-4f32-a812-ad81316b34f3", "status": "active", "features": ["basic"], "company_id": "aa896a02-e087-40a9-b981-d30c49a5c0a6", "created_at": "2025-09-02T20:41:23.087", "created_by": null, "expires_at": "2025-10-02T20:41:23.085", "renewed_at": null, "start_date": "2025-09-02T20:41:23.085", "total_days": 30, "updated_at": "2025-09-02T20:41:30.113", "updated_by": null, "last_checked": "2025-09-02T20:41:23.085", "days_remaining": 30}	{"id": "7e86bed0-2f03-4f32-a812-ad81316b34f3", "status": "active", "features": ["basic"], "company_id": "aa896a02-e087-40a9-b981-d30c49a5c0a6", "created_at": "2025-09-02T20:41:23.087", "created_by": null, "expires_at": "2025-10-02T20:41:23.085", "renewed_at": null, "start_date": "2025-09-02T20:41:23.085", "total_days": 30, "updated_at": "2025-09-02T20:41:33.69", "updated_by": null, "last_checked": "2025-09-02T20:41:23.085", "days_remaining": 30}	\N	2025-09-02 20:41:33.683342
18	b037f11f-b98e-4dd2-a5e6-b8cc37cf58b7	UPDATE	{"id": "b037f11f-b98e-4dd2-a5e6-b8cc37cf58b7", "status": "active", "features": ["analytics", "multi_location"], "company_id": "5b7c4bdc-5649-49bd-9f6e-3a87a583d750", "created_at": "2025-08-29T19:25:04.687", "created_by": null, "expires_at": "2026-12-27T19:25:04.684", "renewed_at": "2025-08-29T19:25:23.164", "start_date": "2025-08-29T19:25:04.684", "total_days": 485, "updated_at": "2025-09-01T00:00:00.053", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-01T00:00:00.051", "days_remaining": 483}	{"id": "b037f11f-b98e-4dd2-a5e6-b8cc37cf58b7", "status": "active", "features": ["analytics", "multi_location"], "company_id": "5b7c4bdc-5649-49bd-9f6e-3a87a583d750", "created_at": "2025-08-29T19:25:04.687", "created_by": null, "expires_at": "2026-12-27T19:25:04.684", "renewed_at": "2025-08-29T19:25:23.164", "start_date": "2025-08-29T19:25:04.684", "total_days": 485, "updated_at": "2025-09-03T00:00:00.029", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-03T00:00:00.028", "days_remaining": 481}	\N	2025-09-03 00:00:00.02972
19	d6a803ce-c7a3-496c-b460-c26fcd8e59be	UPDATE	{"id": "d6a803ce-c7a3-496c-b460-c26fcd8e59be", "status": "active", "features": ["basic"], "company_id": "b4830b4e-be20-4bba-8b3e-a0f0d2213749", "created_at": "2025-08-30T18:41:30.022", "created_by": null, "expires_at": "2025-09-29T18:41:30.02", "renewed_at": null, "start_date": "2025-08-30T18:41:30.02", "total_days": 30, "updated_at": "2025-09-01T00:00:00.034", "updated_by": null, "last_checked": "2025-09-01T00:00:00.033", "days_remaining": 29}	{"id": "d6a803ce-c7a3-496c-b460-c26fcd8e59be", "status": "active", "features": ["basic"], "company_id": "b4830b4e-be20-4bba-8b3e-a0f0d2213749", "created_at": "2025-08-30T18:41:30.022", "created_by": null, "expires_at": "2025-09-29T18:41:30.02", "renewed_at": null, "start_date": "2025-08-30T18:41:30.02", "total_days": 30, "updated_at": "2025-09-03T00:00:00.034", "updated_by": null, "last_checked": "2025-09-03T00:00:00.033", "days_remaining": 27}	\N	2025-09-03 00:00:00.034324
20	eef7b459-8a50-41b9-85f9-824b7c276ea6	UPDATE	{"id": "eef7b459-8a50-41b9-85f9-824b7c276ea6", "status": "active", "features": ["basic"], "company_id": "a13343e5-3109-4dc7-8f75-77982f0cfc7a", "created_at": "2025-08-30T18:41:53.168", "created_by": null, "expires_at": "2025-09-29T18:41:53.167", "renewed_at": null, "start_date": "2025-08-30T18:41:53.167", "total_days": 30, "updated_at": "2025-09-01T00:00:00.045", "updated_by": null, "last_checked": "2025-09-01T00:00:00.044", "days_remaining": 29}	{"id": "eef7b459-8a50-41b9-85f9-824b7c276ea6", "status": "active", "features": ["basic"], "company_id": "a13343e5-3109-4dc7-8f75-77982f0cfc7a", "created_at": "2025-08-30T18:41:53.168", "created_by": null, "expires_at": "2025-09-29T18:41:53.167", "renewed_at": null, "start_date": "2025-08-30T18:41:53.167", "total_days": 30, "updated_at": "2025-09-03T00:00:00.036", "updated_by": null, "last_checked": "2025-09-03T00:00:00.035", "days_remaining": 27}	\N	2025-09-03 00:00:00.036393
21	lic_sample_001	UPDATE	{"id": "lic_sample_001", "status": "active", "features": ["pos_integration", "analytics", "multi_branch"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2024-09-13T17:15:55.124", "created_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "expires_at": "2026-10-23T17:15:55.124", "renewed_at": "2025-08-29T18:24:23.816", "start_date": "2024-09-13T17:15:55.124", "total_days": 770, "updated_at": "2025-09-01T00:00:00.055", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-01T00:00:00.054", "days_remaining": 418}	{"id": "lic_sample_001", "status": "active", "features": ["pos_integration", "analytics", "multi_branch"], "company_id": "dc3c6a10-96c6-4467-9778-313af66956af", "created_at": "2024-09-13T17:15:55.124", "created_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "expires_at": "2026-10-23T17:15:55.124", "renewed_at": "2025-08-29T18:24:23.816", "start_date": "2024-09-13T17:15:55.124", "total_days": 770, "updated_at": "2025-09-03T00:00:00.038", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-03T00:00:00.037", "days_remaining": 416}	\N	2025-09-03 00:00:00.038514
22	adaaf5c8-28f7-402f-843a-029e1e297f45	UPDATE	{"id": "adaaf5c8-28f7-402f-843a-029e1e297f45", "status": "active", "features": ["basic"], "company_id": "ee1b200f-bd2b-4d23-a3ff-1ce80ef90a0a", "created_at": "2025-08-29T19:07:13.199", "created_by": null, "expires_at": "2025-09-28T19:07:13.198", "renewed_at": null, "start_date": "2025-08-29T19:07:13.198", "total_days": 30, "updated_at": "2025-09-01T00:00:00.057", "updated_by": null, "last_checked": "2025-09-01T00:00:00.056", "days_remaining": 28}	{"id": "adaaf5c8-28f7-402f-843a-029e1e297f45", "status": "active", "features": ["basic"], "company_id": "ee1b200f-bd2b-4d23-a3ff-1ce80ef90a0a", "created_at": "2025-08-29T19:07:13.199", "created_by": null, "expires_at": "2025-09-28T19:07:13.198", "renewed_at": null, "start_date": "2025-08-29T19:07:13.198", "total_days": 30, "updated_at": "2025-09-03T00:00:00.04", "updated_by": null, "last_checked": "2025-09-03T00:00:00.039", "days_remaining": 26}	\N	2025-09-03 00:00:00.04065
23	a91c9849-509f-4213-aef4-907bd1b2d050	UPDATE	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["analytics", "multi_location"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2027-02-26T18:50:18.37", "renewed_at": "2025-09-02T16:42:53.865", "start_date": "2025-08-30T18:50:18.37", "total_days": 545, "updated_at": "2025-09-02T16:42:53.867", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-02T16:42:53.865", "days_remaining": 543}	{"id": "a91c9849-509f-4213-aef4-907bd1b2d050", "status": "active", "features": ["analytics", "multi_location"], "company_id": "bef6f0cf-40b3-491e-915c-40e4b0d9fed7", "created_at": "2025-08-30T18:50:18.372", "created_by": null, "expires_at": "2027-02-26T18:50:18.37", "renewed_at": "2025-09-02T16:42:53.865", "start_date": "2025-08-30T18:50:18.37", "total_days": 545, "updated_at": "2025-09-03T00:00:00.042", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-03T00:00:00.041", "days_remaining": 542}	\N	2025-09-03 00:00:00.042759
24	38da34d2-3e21-4e14-a8c5-6b39c4cdde31	UPDATE	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-04-26T19:08:57.106", "renewed_at": "2025-09-02T16:42:58.062", "start_date": "2025-08-29T19:08:57.106", "total_days": 240, "updated_at": "2025-09-02T16:42:58.064", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-02T16:42:58.062", "days_remaining": 237}	{"id": "38da34d2-3e21-4e14-a8c5-6b39c4cdde31", "status": "active", "features": ["analytics", "multi_location"], "company_id": "c382fdd5-1a60-4481-ad5f-65b575729b2c", "created_at": "2025-08-29T19:08:57.109", "created_by": null, "expires_at": "2026-04-26T19:08:57.106", "renewed_at": "2025-09-02T16:42:58.062", "start_date": "2025-08-29T19:08:57.106", "total_days": 240, "updated_at": "2025-09-03T00:00:00.046", "updated_by": "1ec02dec-9a81-473a-9cdf-31454e2e959a", "last_checked": "2025-09-03T00:00:00.044", "days_remaining": 236}	\N	2025-09-03 00:00:00.046098
\.


--
-- Data for Name: license_invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.license_invoices (id, license_id, invoice_number, amount, currency, status, created_at, due_date, paid_at, payment_method, company_id, duration_days, issued_at, due_at, metadata, created_by) FROM stdin;
1	a91c9849-509f-4213-aef4-907bd1b2d050	INV-202509-0001	99.00	USD	paid	2025-09-02 16:42:53.885836	\N	\N	\N	bef6f0cf-40b3-491e-915c-40e4b0d9fed7	30	2025-09-02 16:42:53.865	2025-10-02 16:42:53.865	{"renewalType": "extension", "newExpiryDate": "2027-02-26T18:50:18.370Z", "originalExpiryDate": "2027-01-27T18:50:18.370Z"}	1ec02dec-9a81-473a-9cdf-31454e2e959a
2	38da34d2-3e21-4e14-a8c5-6b39c4cdde31	INV-202509-0002	99.00	USD	paid	2025-09-02 16:42:58.086227	\N	\N	\N	c382fdd5-1a60-4481-ad5f-65b575729b2c	30	2025-09-02 16:42:58.062	2025-10-02 16:42:58.062	{"renewalType": "extension", "newExpiryDate": "2026-04-26T19:08:57.106Z", "originalExpiryDate": "2026-03-27T19:08:57.106Z"}	1ec02dec-9a81-473a-9cdf-31454e2e959a
3	4452ed54-28a6-446e-9281-651e6b5b0ec2	INV-202509-0003	99.00	USD	paid	2025-09-02 16:43:08.399196	\N	\N	\N	dc3c6a10-96c6-4467-9778-313af66956af	30	2025-09-02 16:43:08.363	2025-10-02 16:43:08.363	{"renewalType": "extension", "newExpiryDate": "2026-03-08T13:54:01.426Z", "originalExpiryDate": "2026-02-06T13:54:01.426Z"}	1ec02dec-9a81-473a-9cdf-31454e2e959a
\.


--
-- Data for Name: licenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.licenses (id, company_id, status, start_date, expires_at, features, created_at, updated_at, created_by, updated_by, days_remaining, last_checked, renewed_at, total_days) FROM stdin;
4452ed54-28a6-446e-9281-651e6b5b0ec2	dc3c6a10-96c6-4467-9778-313af66956af	active	2025-08-09 13:54:01.426	2026-03-08 13:54:01.426	["analytics", "multi_location"]	2025-08-09 13:54:01.426	2025-09-02 16:43:23.275	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	187	2025-09-02 16:43:08.363	2025-09-02 16:43:08.363	211
7e86bed0-2f03-4f32-a812-ad81316b34f3	aa896a02-e087-40a9-b981-d30c49a5c0a6	active	2025-09-02 20:41:23.085	2025-10-02 20:41:23.085	["basic"]	2025-09-02 20:41:23.087	2025-09-02 20:41:33.69	\N	\N	30	2025-09-02 20:41:23.085	\N	30
b037f11f-b98e-4dd2-a5e6-b8cc37cf58b7	5b7c4bdc-5649-49bd-9f6e-3a87a583d750	active	2025-08-29 19:25:04.684	2026-12-27 19:25:04.684	["analytics", "multi_location"]	2025-08-29 19:25:04.687	2025-09-03 00:00:00.029	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	481	2025-09-03 00:00:00.028	2025-08-29 19:25:23.164	485
d6a803ce-c7a3-496c-b460-c26fcd8e59be	b4830b4e-be20-4bba-8b3e-a0f0d2213749	active	2025-08-30 18:41:30.02	2025-09-29 18:41:30.02	["basic"]	2025-08-30 18:41:30.022	2025-09-03 00:00:00.034	\N	\N	27	2025-09-03 00:00:00.033	\N	30
eef7b459-8a50-41b9-85f9-824b7c276ea6	a13343e5-3109-4dc7-8f75-77982f0cfc7a	active	2025-08-30 18:41:53.167	2025-09-29 18:41:53.167	["basic"]	2025-08-30 18:41:53.168	2025-09-03 00:00:00.036	\N	\N	27	2025-09-03 00:00:00.035	\N	30
lic_sample_001	dc3c6a10-96c6-4467-9778-313af66956af	active	2024-09-13 17:15:55.124	2026-10-23 17:15:55.124	["pos_integration", "analytics", "multi_branch"]	2024-09-13 17:15:55.124	2025-09-03 00:00:00.038	1ec02dec-9a81-473a-9cdf-31454e2e959a	1ec02dec-9a81-473a-9cdf-31454e2e959a	416	2025-09-03 00:00:00.037	2025-08-29 18:24:23.816	770
adaaf5c8-28f7-402f-843a-029e1e297f45	ee1b200f-bd2b-4d23-a3ff-1ce80ef90a0a	active	2025-08-29 19:07:13.198	2025-09-28 19:07:13.198	["basic"]	2025-08-29 19:07:13.199	2025-09-03 00:00:00.04	\N	\N	26	2025-09-03 00:00:00.039	\N	30
a91c9849-509f-4213-aef4-907bd1b2d050	bef6f0cf-40b3-491e-915c-40e4b0d9fed7	active	2025-08-30 18:50:18.37	2027-02-26 18:50:18.37	["analytics", "multi_location"]	2025-08-30 18:50:18.372	2025-09-03 00:00:00.042	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	542	2025-09-03 00:00:00.041	2025-09-02 16:42:53.865	545
38da34d2-3e21-4e14-a8c5-6b39c4cdde31	c382fdd5-1a60-4481-ad5f-65b575729b2c	active	2025-08-29 19:08:57.106	2026-04-26 19:08:57.106	["analytics", "multi_location"]	2025-08-29 19:08:57.109	2025-09-03 00:00:00.046	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	236	2025-09-03 00:00:00.044	2025-09-02 16:42:58.062	240
\.


--
-- Data for Name: menu_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.menu_categories (id, company_id, name, description, image, display_number, is_active, created_at, updated_at, deleted_at, created_by, updated_by) FROM stdin;
0d819024-b6c2-47ac-aa0f-177f020665cc	dc3c6a10-96c6-4467-9778-313af66956af	{"ar": "المقبلات", "en": "Appetizers"}	{"ar": "مقبلات لذيذة", "en": "Delicious starters"}	\N	1	t	2025-08-30 05:24:22.847	2025-08-31 10:46:16.521	\N	\N	\N
c6baef0a-278d-4eef-881e-48ab68911dfe	dc3c6a10-96c6-4467-9778-313af66956af	{"ar": "الأطباق الرئيسية", "en": "Main Dishes"}	{"ar": "أطباقنا الرئيسية المميزة", "en": "Our signature main courses"}	\N	2	t	2025-08-30 05:24:22.847	2025-08-31 10:46:18.019	\N	\N	\N
f11f4a8e-1797-40c7-8a97-86e2da02b15d	dc3c6a10-96c6-4467-9778-313af66956af	{"ar": "3", "en": "3"}	\N	\N	4	t	2025-08-30 09:58:39.315	2025-09-01 19:39:28.927	\N	\N	\N
44444444-4444-4444-4444-444444444444	82b4039a-f9f3-4648-b3e1-23397d83af61	{"ar": "حلويات", "en": "Desserts"}	{"ar": "حلويات لذيذة", "en": "Sweet desserts"}	\N	4	f	2025-08-29 23:21:26.675	2025-08-30 12:08:39.254	\N	\N	\N
33333333-3333-3333-3333-333333333333	82b4039a-f9f3-4648-b3e1-23397d83af61	{"ar": "مشروبات", "en": "Beverages"}	{"ar": "مشروبات باردة وساخنة", "en": "Cold and hot drinks"}	\N	3	f	2025-08-29 23:21:26.675	2025-08-30 12:08:40.136	\N	\N	\N
22222222-2222-2222-2222-222222222222	82b4039a-f9f3-4648-b3e1-23397d83af61	{"ar": "بيتزا", "en": "Pizza"}	{"ar": "بيتزا طازجة", "en": "Fresh pizza"}	\N	2	f	2025-08-29 23:21:26.675	2025-08-30 12:08:40.844	\N	\N	\N
11111111-1111-1111-1111-111111111111	82b4039a-f9f3-4648-b3e1-23397d83af61	{"ar": "برجر", "en": "Burgers"}	{"ar": "برجر لذيذ", "en": "Delicious burgers"}	\N	1	f	2025-08-29 23:21:26.675	2025-08-30 12:08:41.358	\N	\N	\N
\.


--
-- Data for Name: menu_products; Type: TABLE DATA; Schema: public; Owner: -
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
cccccccc-cccc-cccc-cccc-cccccccccccc	82b4039a-f9f3-4648-b3e1-23397d83af61	22222222-2222-2222-2222-222222222222	{"ar": "بيتزا مارجريتا", "en": "Margherita Pizza"}	{"ar": "طماطم طازجة، موتزاريلا، ريحان", "en": "Fresh tomato, mozzarella, basil"}	\N	\N	18.99	{"website": 18.99, "doordash": 20.99}	0.00	0	1	20	1	1	{vegetarian,popular}	2025-08-29 23:22:08.065	2025-08-30 15:10:24.687	\N	\N	\N	{}
eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee	82b4039a-f9f3-4648-b3e1-23397d83af61	33333333-3333-3333-3333-333333333333	{"ar": "عصير برتقال طازج", "en": "Fresh Orange Juice"}	{"ar": "عصير برتقال معصور طازجاً", "en": "Freshly squeezed orange juice"}	\N	\N	4.99	{"website": 4.99, "uber_eats": 5.99}	0.00	0	1	2	1	1	{fresh,vitamin-c}	2025-08-29 23:22:08.065	2025-08-30 15:10:24.687	\N	\N	\N	{}
3d687360-7de7-4bc9-95bf-e3a3861a64a9	dc3c6a10-96c6-4467-9778-313af66956af	0d819024-b6c2-47ac-aa0f-177f020665cc	{"ar": "ss", "en": "ss"}	{"ar": "ss", "en": "ss"}	\N	\N	1.00	{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1, "customChannels": []}	0.00	1	1	15	1	1	{}	2025-08-30 21:29:09.926	2025-08-30 21:29:09.926	\N	\N	\N	{}
55a75146-4c09-4054-8983-015a3395d9d0	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "ewr", "en": "rew"}	{"ar": "werew", "en": "werwer"}	\N	\N	1.00	{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1}	0.00	1	1	12	1	1	{}	2025-08-30 23:22:11.753	2025-08-30 23:22:11.753	\N	\N	\N	{}
c5eff27f-5957-42de-a900-15e029bfbfc7	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "12qwe", "en": "231"}	{"ar": "qweqweqd", "en": "qweq"}	\N	\N	1.00	{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1}	0.00	1	4	12	1	1	{12}	2025-08-30 23:30:00.059	2025-08-30 23:30:00.059	\N	\N	\N	{}
9150eb46-ae7f-488a-8697-9f80508c1017	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "1111111111111111111", "en": "1111111111111111111"}	{"ar": "111111111111111111111", "en": "111111111111111"}	\N	\N	9.98	{"careem": 9.98, "talabat": 9.98, "website": 9.98, "callcenter": 9.98}	0.00	1	111	15	1	1	{11}	2025-08-30 23:33:33.904	2025-08-30 23:33:33.904	\N	\N	\N	{}
af24a45e-61b3-48b0-90fa-55d9a6433d21	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "2222222222222222", "en": "2222222222222222"}	{"ar": "11111111111111111111111", "en": "11111111111111111"}	\N	\N	2.00	{"careem": 2, "talabat": 2, "website": 2, "callcenter": 2}	0.00	1	2	12	1	1	{3}	2025-08-30 23:34:28.267	2025-08-30 23:34:28.267	\N	\N	\N	{}
82485606-7240-4f87-a2c7-e7fa65a4bc0b	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "tteeeeessssssssssstttt", "en": "test222222222222222222222222"}	{"ar": "tttt", "en": "qwdqwdqwdqwd"}	/uploads/products/temp_1756597133068.webp	\N	1.00	{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1}	0.00	1	123	12	1	1	{}	2025-08-30 23:38:53.107	2025-08-30 23:38:53.107	\N	\N	\N	{/uploads/products/temp_1756597133068.webp}
503749b4-d191-40ba-8fb8-64bfca712fd3	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "9999999999999", "en": "9999999999999"}	{"ar": "999999999999", "en": "99999999999999999"}	/uploads/products/temp_1756597765869.webp	\N	9.00	{"careem": 9, "talabat": 9, "website": 9, "callcenter": 9}	0.00	1	99	15	1	1	{}	2025-08-30 23:49:25.915	2025-08-30 23:49:25.915	\N	\N	\N	{/uploads/products/temp_1756597765869.webp}
f4880c90-6b50-4da7-a1ca-a452fa6537cf	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "ssssss", "en": "sssssss"}	{"ar": "ssss", "en": "ssss"}	/uploads/products/temp_1756597928787.webp	\N	0.99	{"careem": 0.99, "talabat": 0.99, "website": 0.99, "callcenter": 0.99}	0.00	1	220	12	1	1	{11111}	2025-08-30 23:52:08.828	2025-08-30 23:52:08.828	\N	\N	\N	{/uploads/products/temp_1756597928787.webp}
ee435138-7c2f-4356-bc18-7a987fd9c97e	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "3333333333333333333", "en": "3333333333333"}	{"ar": "33333333333", "en": "33333333333"}	/uploads/products/temp_1756598253797.webp	\N	33.00	{"careem": 33, "talabat": 33, "website": 33, "callcenter": 33}	0.00	1	3	23	1	1	{33333}	2025-08-30 23:57:33.837	2025-08-30 23:57:33.865	\N	\N	\N	{/uploads/products/temp_1756598253797.webp}
72926ac6-4d6d-458d-aba9-ea4a0780d85f	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "5555555555555", "en": "555555555"}	{"ar": "555555555555", "en": "555555555"}	/uploads/products/temp_1756598458392.webp	\N	5.00	{"careem": 5, "talabat": 5, "website": 5, "callcenter": 5}	0.00	1	5	12	1	1	{}	2025-08-31 00:00:58.457	2025-08-31 00:00:58.502	\N	\N	\N	{/uploads/products/temp_1756598458392.webp}
a56948cb-504b-43af-b334-34850efaf11c	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "this one", "en": "this one"}	\N	/uploads/products/temp_1756626491132.webp	\N	1.00	{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1}	0.00	1	999	12	1	1	{}	2025-08-31 07:48:11.163	2025-08-31 07:48:11.191	\N	\N	\N	{/uploads/products/temp_1756626491132.webp}
3d5368ab-1112-4665-963c-12055934327f	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "11", "en": "11"}	{"ar": "11", "en": "11"}	/uploads/products/temp_1756626890689.webp	\N	1.00	{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1, "customChannels": []}	0.00	1	11	15	1	1	{}	2025-08-31 07:54:50.724	2025-08-31 07:54:50.724	\N	\N	\N	{/uploads/products/temp_1756626890689.webp}
72b13cab-b109-47e3-b700-6e749aea8f9e	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "", "en": "1"}	{"ar": "", "en": ""}	\N	\N	10.00	{"careem": 10, "talabat": 10, "website": 10, "callcenter": 10, "customChannels": []}	0.00	1	28	15	1	1	{}	2025-08-31 08:00:47.585	2025-08-31 08:00:47.585	\N	\N	\N	{}
884a5fe3-fd82-4d1b-9811-48be0302987f	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "1", "en": "1"}	{"ar": "1", "en": "1"}	\N	\N	1.00	{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1, "customChannels": []}	0.00	1	1	15	1	1	{}	2025-08-31 08:12:37.603	2025-08-31 08:12:37.603	\N	\N	\N	{}
15e53669-7ebe-4eaf-bce7-47c2802eb13f	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "1", "en": "1"}	{"ar": "", "en": ""}	\N	\N	1.00	{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1, "customChannels": []}	0.00	1	1	15	1	1	{}	2025-08-31 08:15:11.048	2025-08-31 08:15:11.048	\N	\N	\N	{}
292f4b8f-2597-429c-a7ae-eddba9b39d43	dc3c6a10-96c6-4467-9778-313af66956af	0d819024-b6c2-47ac-aa0f-177f020665cc	{"ar": "21", "en": "121"}	{"ar": "", "en": ""}	\N	\N	1.00	{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1, "customChannels": []}	0.00	1	1	15	1	1	{}	2025-08-31 08:39:19.293	2025-08-31 08:39:19.293	\N	\N	\N	{}
d2c28a5f-33ff-45db-9c41-13fdbe1f8bf9	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "312312", "en": "12312"}	{"ar": "123", "en": "21312"}	\N	\N	1.00	{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1, "customChannels": [{"id": "3rod", "name": "3rod", "price": 0, "enabled": true}]}	0.00	1	19	15	1	1	{offers}	2025-08-31 11:30:18.626	2025-08-31 11:30:18.626	\N	\N	\N	{}
aa3da288-dda0-4e80-b075-61ca7e9b8419	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "312312", "en": "12312", "tr": "dqw"}	{"ar": "123", "en": "21312", "tr": "test"}	\N	\N	1.00	{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1, "customChannels": [{"id": "3rod", "name": "3rod", "price": 0, "enabled": true}]}	0.00	1	19	15	1	1	{offers}	2025-08-31 12:19:30.823	2025-08-31 12:19:30.823	\N	\N	\N	{}
93785ebe-23be-4a6b-9f5b-a229282715cd	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "312312", "en": "12312", "tr": "dqw"}	{"ar": "123", "en": "21312", "tr": "test"}	\N	\N	1.00	{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1, "customChannels": [{"id": "3rod", "name": "3rod", "price": 0, "enabled": true}]}	0.00	1	19	15	1	1	{offers}	2025-08-31 12:32:51.985	2025-08-31 12:32:51.985	\N	\N	\N	{}
dc31a945-32a8-4ad9-8bef-91ab57097a5f	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "11", "en": "11", "ku": "drgd"}	{"ar": "111", "en": "11", "ku": "dffdb"}	\N	\N	1.00	{"careem": 1, "talabat": 1, "website": 1.2, "callcenter": 0.5, "customChannels": []}	0.00	1	1	15	1	1	{}	2025-09-01 19:09:53.663	2025-09-01 19:09:53.663	\N	\N	\N	{}
64e98f8f-e97a-44ea-8230-12540196f5b2	dc3c6a10-96c6-4467-9778-313af66956af	f11f4a8e-1797-40c7-8a97-86e2da02b15d	{"ar": "test", "en": "tesr"}	{"ar": "wsdfghyj", "en": "sdcfvhbjk"}	/uploads/products/temp_1756755241972.webp	\N	1.00	{"careem": 1, "talabat": 1, "website": 1, "callcenter": 1, "customChannels": [{"id": "menu_secret", "name": "menu secret", "price": 5225, "enabled": true}, {"id": "jhli", "name": "jhli", "price": 0.48, "enabled": true}]}	0.00	1	1	15	1	1	{offer}	2025-09-01 19:34:01.997	2025-09-01 19:34:01.997	\N	\N	\N	{/uploads/products/temp_1756755241972.webp}
\.


--
-- Data for Name: modifier_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.modifier_categories (id, company_id, name, description, display_number, image, created_at, updated_at, deleted_at, is_required, max_selections, min_selections, selection_type) FROM stdin;
a2c86b1e-4784-4712-a25d-69cce631aefa	dc3c6a10-96c6-4467-9778-313af66956af	{"ar": "test", "en": "test1"}	{"ar": "", "en": ""}	1	\N	2025-08-31 12:32:19.966	2025-08-31 12:32:19.966	\N	f	1	0	single
e8e3a9be-0436-4549-befb-0c84116184de	dc3c6a10-96c6-4467-9778-313af66956af	{"ar": "", "en": "1"}	{"ar": "", "en": ""}	1	\N	2025-08-31 12:52:04.912	2025-08-31 12:52:04.912	\N	f	1	0	single
bd60ec8a-3d5f-48cf-afb1-4bdbacd7e06f	dc3c6a10-96c6-4467-9778-313af66956af	{"ar": "drinks", "en": "drinks"}	{"ar": "...", "en": "...."}	1	\N	2025-09-01 19:38:40.514	2025-09-01 19:39:11.626	\N	f	10	0	counter
\.


--
-- Data for Name: modifiers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.modifiers (id, modifier_category_id, company_id, name, description, base_price, pricing, cost, status, display_number, created_at, updated_at, deleted_at, image, is_default) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_number, branch_id, delivery_zone_id, delivery_provider_id, customer_name, customer_phone, customer_email, delivery_address, delivery_lat, delivery_lng, order_type, status, subtotal, delivery_fee, tax_amount, total_amount, payment_method, payment_status, estimated_delivery_time, actual_delivery_time, provider_order_id, provider_tracking_url, driver_info, notes, created_at, updated_at, delivered_at, cancelled_at, cancellation_reason) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price, modifiers, special_requests, created_at) FROM stdin;
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotions (id, company_id, name, description, promotion_type, start_date, end_date, is_active, auto_revert, platforms, min_profit_margin, original_pricing_snapshot, created_at, updated_at, created_by) FROM stdin;
\.


--
-- Data for Name: price_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.price_history (id, entity_type, entity_id, promotion_id, old_price, new_price, change_reason, platform, created_at, created_by) FROM stdin;
\.


--
-- Data for Name: printers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.printers (id, name, type, connection, ip, port, manufacturer, model, location, "paperWidth", "assignedTo", is_default, status, capabilities, last_seen, company_id, branch_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, phone, avatar_url, password_hash, pin, email_verified_at, role, status, company_id, branch_id, language, timezone, last_login_at, last_login_ip, failed_login_attempts, locked_until, must_change_password, created_at, updated_at, deleted_at, created_by, updated_by, first_name, last_name, username) FROM stdin;
9caee1f8-547d-435c-9c66-885a52ac373a	Issa Dalu Shawerma 3a saj	962795943016_1756456703665@placeholder.local	+962795943016	\N	$2a$10$Zrz1NmogqnMzv9IMXVuCHOepv8lNWYlSPgKlT6YoTFmtOwInfRPCS	\N	\N	company_owner	active	dc3c6a10-96c6-4467-9778-313af66956af	\N	en	Asia/Amman	\N	\N	0	\N	f	2025-08-29 08:38:23.666	2025-08-29 08:56:37.471	2025-08-29 08:56:37.471	1ec02dec-9a81-473a-9cdf-31454e2e959a	1ec02dec-9a81-473a-9cdf-31454e2e959a	Issa Dalu	Shawerma 3a saj	\N
dfed55fa-5890-426d-9960-8ee49318d18a	test2	step2@criptext.com	+962795943016	\N	$2a$10$GB9FEmwSzH9ToXVbeZc06uK3klhyZgKIy3HipHI2nW/puLDYoGRHC	\N	\N	company_owner	active	dc3c6a10-96c6-4467-9778-313af66956af	\N	en	Asia/Amman	\N	\N	0	\N	f	2025-08-29 09:34:55.462	2025-08-29 09:34:55.462	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	\N	\N	issadalu2
ded34072-ae63-4a84-8f11-3a5dcd4bcb9a	test2	step3@criptext.com	+962795943016	\N	$2a$10$tpT7qI93474TQSH7PzYFlu7RJE6iah4g2tjXQCS0n8Dsv5F6ltuX2	\N	\N	call_center	active	c382fdd5-1a60-4481-ad5f-65b575729b2c	\N	en	Asia/Amman	2025-08-29 19:28:07.428	\N	0	\N	f	2025-08-29 19:27:53.731	2025-08-29 19:28:07.429	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	\N	\N	issa2
ff25b5d8-036a-4ed9-b909-e001addf1141	ejewp owie	962694358332_1756417011721@placeholder.local	+962694358332	\N	$2a$10$DqPdz8ZyZSxsi4iV.jtLfOvFTJEAr3LlVXVRWpA1xkxE4k4Dgltlq	\N	\N	call_center	active	dc3c6a10-96c6-4467-9778-313af66956af	\N	en	Asia/Amman	\N	\N	0	\N	f	2025-08-28 21:36:51.723	2025-08-29 20:36:33.549	2025-08-29 20:36:33.549	1ec02dec-9a81-473a-9cdf-31454e2e959a	3131d1ef-ca70-4385-b142-770727c8d5a7	ejewp	owie	\N
4fcb92e6-d1c2-4583-8ce7-172227a2a4e8	Super Admin	admin@platform.com	\N	\N	$2b$12$4vT0Z4.ZXgpKxqn1O4b3Ve5jCO/i5lSbExDsOxT7Iz6J1Jx2E/UOS	\N	\N	super_admin	active	82b4039a-f9f3-4648-b3e1-23397d83af61	\N	en	Asia/Amman	\N	\N	0	\N	f	2025-08-30 05:07:35.457	2025-08-30 05:07:35.457	\N	\N	\N	\N	\N	\N
e4282c30-b3b9-4168-bdb1-cb2a7bfcd20b	Main Office	a1dmin@restau1rantplatform.com	+962444444444	\N	$2a$10$ijLhRFTauQToagV08ArQHe4EeGQus2w7AQzQrXdie4lq0ai8LfEhK	\N	\N	branch_manager	active	dc3c6a10-96c6-4467-9778-313af66956af	\N	en	Asia/Amman	\N	\N	0	\N	f	2025-08-30 12:04:22.129	2025-08-30 12:04:37.007	2025-08-30 12:04:37.007	1ec02dec-9a81-473a-9cdf-31454e2e959a	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	\N	addas
test-menu-user-001	Test Menu User	test@menu.com	\N	\N	$2a$12$UYp5LE7.oSp9E83LWcxBCuBwmP8SSwuv0VbTPJeMBGJqihgyMKrMC	\N	\N	company_owner	active	82b4039a-f9f3-4648-b3e1-23397d83af61	\N	en	Asia/Amman	2025-08-30 12:07:54.682	\N	0	\N	f	2025-08-29 23:32:49.478	2025-08-30 12:07:54.683	\N	\N	\N	Test	User	testuser
86cf1cd3-0213-4671-bfa5-917c781d7871	reziq	riz@gmail.com	+962566666666	\N	$2a$10$IMCgZu/ccda/ZgdjfdRQeOx6Y9Y2H6ttCc2tlC1pFpzRrHUrK/RDq	\N	\N	call_center	active	82b4039a-f9f3-4648-b3e1-23397d83af61	\N	en	Asia/Amman	2025-08-30 12:11:33.119	\N	0	\N	f	2025-08-30 12:11:01.201	2025-08-30 12:11:33.12	\N	test-menu-user-001	\N	\N	\N	reziq
3ff50f61-1d76-4660-b390-fd8dc12cf0ed	test	a213dmin@restaurantplatform.com	+962444444443	\N	$2a$10$W2rfYoozJ/B.69IOsaSqGu4mH63PichU.cER.F3nuHJzzSnvPOpTC	\N	\N	super_admin	active	dc3c6a10-96c6-4467-9778-313af66956af	\N	en	Asia/Amman	\N	\N	0	\N	f	2025-08-30 18:26:31.855	2025-08-30 18:26:31.855	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	\N	\N	5325rewf
3131d1ef-ca70-4385-b142-770727c8d5a7	Main Office	step1@criptext.com	+962795943016	\N	$2a$10$nk8iFUSE2RLFP2EleGaAN.JtouhEgBwiBXcA2w0I0OsNgg753zj4O	\N	\N	company_owner	active	dc3c6a10-96c6-4467-9778-313af66956af	\N	en	Asia/Amman	2025-08-31 13:11:52.963	\N	0	\N	f	2025-08-29 09:00:09.037	2025-08-31 13:11:52.964	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	\N	\N	jess
d9136bdc-392e-445e-8ed8-60d8b0c979b6	Company B Owner	owner@companyb.com	\N	\N	$2a$12$vkPBZ/RKiS6xY/fwj/QiU.ixOJN4sxpbg7QjKAtu5Bz2K83GIBDQm	\N	\N	company_owner	active	82b4039a-f9f3-4648-b3e1-23397d83af61	\N	en	Asia/Amman	2025-08-31 14:00:20.604	::1	0	\N	f	2025-08-29 08:32:29.076	2025-08-31 14:00:20.61	2025-08-29 08:59:42.945	\N	1ec02dec-9a81-473a-9cdf-31454e2e959a	\N	\N	\N
1ec02dec-9a81-473a-9cdf-31454e2e959a	System Administrator	admin@restaurantplatform.com	\N	\N	$2a$12$vkPBZ/RKiS6xY/fwj/QiU.ixOJN4sxpbg7QjKAtu5Bz2K83GIBDQm	\N	2025-08-27 09:04:10.179	super_admin	active	dc3c6a10-96c6-4467-9778-313af66956af	40f863e7-b719-4142-8e94-724572002d9b	en	Asia/Amman	2025-09-03 03:17:00.934	::1	0	\N	t	2025-08-27 09:04:10.179	2025-09-03 03:17:00.936	\N	\N	\N	System	Administrator	\N
\.


--
-- Data for Name: print_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.print_jobs (id, type, printer_id, content, status, priority, order_id, company_id, branch_id, user_id, attempts, processing_time, error, created_at, updated_at, started_at, completed_at, failed_at) FROM stdin;
\.


--
-- Data for Name: print_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.print_templates (id, name, type, template, is_default, company_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_images (id, product_id, filename, original_name, url, size, width, height, mime_type, created_at, updated_at) FROM stdin;
fe27703e-d813-408e-a505-5fc2ba42f317	82485606-7240-4f87-a2c7-e7fa65a4bc0b	temp_1756597133068.webp	test.jpg	/uploads/products/temp_1756597133068.webp	82806	612	408	image/webp	2025-08-30 23:38:53.071	2025-08-30 23:38:53.134
99bd94ad-3fe0-4015-8344-ea0b4d50f863	503749b4-d191-40ba-8fb8-64bfca712fd3	temp_1756597765869.webp	test.jpg	/uploads/products/temp_1756597765869.webp	82806	612	408	image/webp	2025-08-30 23:49:25.874	2025-08-30 23:49:25.938
c448245e-2d60-4988-8fc7-ea2810e34901	f4880c90-6b50-4da7-a1ca-a452fa6537cf	temp_1756597928787.webp	test.jpg	/uploads/products/temp_1756597928787.webp	82806	612	408	image/webp	2025-08-30 23:52:08.79	2025-08-30 23:52:08.855
69e899f7-b5dd-41d0-9fdc-60794a364e83	ee435138-7c2f-4356-bc18-7a987fd9c97e	temp_1756598253797.webp	test.jpg	/uploads/products/temp_1756598253797.webp	82806	612	408	image/webp	2025-08-30 23:57:33.801	2025-08-30 23:57:33.862
71413f06-3949-4852-aad9-0473cf22aa81	72926ac6-4d6d-458d-aba9-ea4a0780d85f	temp_1756598458392.webp	test.jpg	/uploads/products/temp_1756598458392.webp	82806	612	408	image/webp	2025-08-31 00:00:58.4	2025-08-31 00:00:58.497
6a9bcc58-f9cd-4385-89f0-6700d6317502	a56948cb-504b-43af-b334-34850efaf11c	temp_1756626491132.webp	test.jpg	/uploads/products/temp_1756626491132.webp	82806	612	408	image/webp	2025-08-31 07:48:11.136	2025-08-31 07:48:11.189
71085ea9-5f8c-43b2-b95e-9dadd8a66c19	\N	temp_1756626890689.webp	test.jpg	/uploads/products/temp_1756626890689.webp	82806	612	408	image/webp	2025-08-31 07:54:50.694	2025-08-31 07:54:50.694
d052971a-257a-4fd4-8848-60cc56577380	\N	temp_1756755241972.webp	test.jpg	/uploads/products/temp_1756755241972.webp	82806	612	408	image/webp	2025-09-01 19:34:01.975	2025-09-01 19:34:01.975
\.


--
-- Data for Name: product_modifier_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_modifier_categories (id, product_id, modifier_category_id, min_quantity, max_quantity, price_override, is_required, display_order, created_at) FROM stdin;
44fb8698-6d27-46d8-b82f-5bd586dab3ea	93785ebe-23be-4a6b-9f5b-a229282715cd	e8e3a9be-0436-4549-befb-0c84116184de	0	1	\N	f	1	2025-08-31 12:52:22.037
01065757-6787-40db-a3ed-9d69aebb437e	64e98f8f-e97a-44ea-8230-12540196f5b2	bd60ec8a-3d5f-48cf-afb1-4bdbacd7e06f	0	1	\N	f	1	2025-09-01 19:39:18.401
\.


--
-- Data for Name: promotion_modifier_markups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotion_modifier_markups (id, promotion_id, product_id, modifier_id, markup_percentage, original_price, marked_up_price, profit_margin, business_reason, created_at) FROM stdin;
\.


--
-- Data for Name: promotion_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotion_products (id, promotion_id, product_id, base_discount_type, base_discount_value, created_at) FROM stdin;
\.


--
-- Data for Name: provider_order_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_order_logs (id, company_provider_config_id, branch_id, order_id, provider_order_id, order_status, request_payload, response_payload, webhook_payload, error_message, processing_time_ms, api_endpoint, http_status_code, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_activity_logs (id, user_id, action, resource_type, resource_id, description, ip_address, user_agent, success, error_message, "timestamp") FROM stdin;
7ccb86de-573c-46c1-91d3-dfdd9c4ca5fe	d9136bdc-392e-445e-8ed8-60d8b0c979b6	login_success	\N	\N	User logged in successfully	::1	curl/8.15.0	t	\N	2025-08-31 13:33:20.771
917f1c9b-043b-4d2e-b796-4fe2ff3fd007	d9136bdc-392e-445e-8ed8-60d8b0c979b6	logout	\N	\N	User logged out	::1	curl/8.15.0	t	\N	2025-08-31 13:36:03.206
cd23a839-68a7-4ed9-b3ef-c06ab0b2e8fa	d9136bdc-392e-445e-8ed8-60d8b0c979b6	login_success	\N	\N	User logged in successfully	::1	curl/8.15.0	t	\N	2025-08-31 14:00:20.719
a672eace-00f3-4657-8c99-3a39b6d521e8	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-08-31 23:40:18.12
ac85c1fa-51d4-4791-bd50-5f23352fe34c	4fcb92e6-d1c2-4583-8ce7-172227a2a4e8	login_failed	\N	\N	Failed login attempt - invalid password	::1	curl/8.15.0	f	\N	2025-09-01 07:09:17.683
ec12dfc8-38f9-4c91-a2a6-874272923e2e	4fcb92e6-d1c2-4583-8ce7-172227a2a4e8	login_failed	\N	\N	Failed login attempt - invalid password	::1	curl/8.15.0	f	\N	2025-09-01 07:11:00.155
ed9f637b-2fe3-4b43-a667-a5f766efa3cd	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-09-01 07:55:30.859
54fc6722-0537-4395-9bbd-e3dc9a448443	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-09-01 07:55:32.177
a6a69a82-8cba-4de9-8408-c98ee8f1be85	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-09-01 07:55:36.254
0ce18aeb-89cb-4acc-96c5-5c9f9a948335	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-09-01 11:32:46.11
931a7107-4230-419d-9604-47d6294a0ffb	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-09-01 13:01:28.141
ada333eb-6eda-4a1e-9aaa-9e1c1cea3a1d	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-09-01 13:02:31.246
be8f82ff-a88d-4fba-afb7-3144f700e581	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-09-01 13:02:35.766
abfefaf0-a517-46a2-b312-b4f8e01f706a	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-09-01 13:27:55.758
9f91f918-5a7c-45dc-a391-42d3e7b3280a	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-09-01 15:33:51.292
6d19429f-7760-472a-9196-1651bf554ae6	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-09-01 19:01:33.514
b7fc9178-0a71-480b-bc20-bb9aa0c796f7	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-09-01 22:02:17.971
b8fbcf1e-5c9a-4c86-9ee9-6e972bd93b1b	4fcb92e6-d1c2-4583-8ce7-172227a2a4e8	login_failed	\N	\N	Failed login attempt - invalid password	::1	curl/8.15.0	f	\N	2025-09-02 07:24:34.269
cda2e0c1-9416-4855-8dae-5577e77dd52e	4fcb92e6-d1c2-4583-8ce7-172227a2a4e8	login_failed	\N	\N	Failed login attempt - invalid password	::1	undici	f	\N	2025-09-02 07:25:18.731
88f856ac-cb6c-434f-854d-41ec2e610724	4fcb92e6-d1c2-4583-8ce7-172227a2a4e8	login_failed	\N	\N	Failed login attempt - invalid password	::1	undici	f	\N	2025-09-02 07:25:19.194
33f8ad42-e5c9-4edb-8115-cbc088deb961	dfed55fa-5890-426d-9960-8ee49318d18a	login_failed	\N	\N	Failed login attempt - invalid password	::1	undici	f	\N	2025-09-02 07:25:19.329
22a6f21e-9a59-44b7-b281-f00af893ffa5	dfed55fa-5890-426d-9960-8ee49318d18a	login_failed	\N	\N	Failed login attempt - invalid password	::1	undici	f	\N	2025-09-02 07:25:19.454
c2a0851d-f219-4152-b0b7-de14489e917b	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-09-02 07:26:31.404
9430977a-410f-4570-b2df-a65c9b26a2f8	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-09-02 07:26:36.837
c4cbd841-dcfe-496e-8655-b9eecc4cb8cf	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-09-03 03:14:44.816
4eb9fbf8-d0ff-4c24-98c1-633c436639aa	1ec02dec-9a81-473a-9cdf-31454e2e959a	login_success	\N	\N	User logged in successfully	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	t	\N	2025-09-03 03:17:01.095
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_sessions (id, user_id, token_hash, refresh_token_hash, expires_at, refresh_expires_at, ip_address, user_agent, device_type, is_active, revoked_at, created_at, last_used_at) FROM stdin;
8ab99823-7c20-4949-bf99-e90a2addb96a	d9136bdc-392e-445e-8ed8-60d8b0c979b6	$2a$10$Anqb4WpXma35DwGHHGLsHu/6Qa4mpQPyUz2EcOlW9OJG70jejD79q	\N	2025-09-30 13:33:20.763	\N	::1	curl/8.15.0	desktop	t	\N	2025-08-31 13:33:20.764	2025-08-31 13:33:20.764
0858cbe5-be8a-40f1-a389-0523f1abb099	d9136bdc-392e-445e-8ed8-60d8b0c979b6	$2a$10$fqlBjN7ocEuUhCC44cxtu.NR84bRPA4zLXf8nWXBYhKzD2dodw11q	\N	2025-09-30 14:00:20.715	\N	::1	curl/8.15.0	desktop	t	\N	2025-08-31 14:00:20.716	2025-08-31 14:00:20.716
7aeb5d5b-3b15-4f36-8418-2528d4f85226	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$DQcpai07rb2aI1PtSIkbCOAmPz4VRVCstVd8zrCHN4SyfkMWv0yq2	\N	2025-09-30 23:40:18.113	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-08-31 23:40:18.114	2025-08-31 23:40:18.114
75d8f3b8-282e-4796-9ec5-b5b60a67ee73	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$vlWQ3eUOJO3ep9iiPvxfxey4T9OpNu1Lmi/rJuIckQB/y4hW2pDhq	\N	2025-10-01 07:55:30.854	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-09-01 07:55:30.855	2025-09-01 07:55:30.855
1603676c-2ee9-43a3-97e3-b4518f56a2d8	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$bmX9di3YVESXaJl0dUjIUuf7jOwIRk71CuUqNOgNyVNwsMEHvmGWa	\N	2025-10-01 07:55:32.173	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-09-01 07:55:32.174	2025-09-01 07:55:32.174
5be7b00b-83cd-4b8d-9b24-ac454a4ad345	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$AcAW551zOnePjVMhhRLFIeZh5IGlYgc6JY8SBcklFnI7VxYuG29h6	\N	2025-10-01 07:55:36.249	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-09-01 07:55:36.25	2025-09-01 07:55:36.25
938fd244-215d-4bbf-8319-68162f71c4f8	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$6hgFqpX.yO8cqe./jZenTeNj4/cDsRNwkBEEzxSRIna8EoyjdrNpq	\N	2025-10-01 11:32:46.1	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-09-01 11:32:46.102	2025-09-01 11:32:46.102
5fb63ac2-9338-4b05-9a04-ed839ef8509e	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$2RZA3Dn3kaKLLTg8b2rnn.OguQhM8jSRs5LyPkrhAj3ZL3ooyfCui	\N	2025-10-01 13:01:28.137	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-09-01 13:01:28.138	2025-09-01 13:01:28.138
26d850d2-a808-4f5a-b6c7-fe9396174e02	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$utMPtAE10RMMUY2qimzfPuPV2JalQ4Ev04kiHJTV.v41m8V8T8JF.	\N	2025-10-01 13:02:31.243	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-09-01 13:02:31.244	2025-09-01 13:02:31.244
8483df82-1ce0-49da-b8ee-6660026f3e8d	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$EMW89BOe89KeWGv3BgYH6eIt.WVXMRSaiKqWLuCV79BJE57FSbaMC	\N	2025-10-01 13:02:35.726	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-09-01 13:02:35.727	2025-09-01 13:02:35.727
1a66af28-5294-43b7-9256-0247934a750b	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$IHfpvzmGKHk4uOWf82zzPu7pDiBSVOihHoBkhqHrlhgeQHBjKi82.	\N	2025-10-01 13:27:55.753	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-09-01 13:27:55.754	2025-09-01 13:27:55.754
cf60f7e3-efcb-42df-a6e5-68fc64c1cec2	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$0RiKkh/mr.XEqfczDjW.luu.DCzbghyb3Aq3xtF.LJOEeMsmSekSO	\N	2025-10-01 15:33:51.288	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-09-01 15:33:51.289	2025-09-01 15:33:51.289
b58607c6-e01e-4fc5-88d2-725b63271031	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$0gYCvbv/2dWF5y9W5E8lKu2LN9t0sEMEmHd./FowyCoaj4uRhbZmO	\N	2025-10-01 19:01:33.508	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-09-01 19:01:33.509	2025-09-01 19:01:33.509
e4df1b94-8ee7-4286-9f2b-b5ddc3482eb8	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$WCunH7qGuin6MO1NS2WzE.N.L8K/WQ95I3eWPKWAo1OrM/5NI.4re	\N	2025-10-01 22:02:17.964	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-09-01 22:02:17.965	2025-09-01 22:02:17.965
975dd66c-4660-4722-b203-4331a1d2e9b7	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$EhKdTdnGuz5CBCu2GVGkXu1c3NB5KS9BbNuEqTDxSFaBE8.ABuwY2	\N	2025-10-02 07:26:31.399	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-09-02 07:26:31.4	2025-09-02 07:26:31.4
ac1870a4-849a-422a-b394-08c834cc5a1c	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$E2UZPipjLTr4ow7yPMVGdOanzUXaH81cphHQtb8s9Hjtco3we/nX2	\N	2025-10-02 07:26:36.832	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-09-02 07:26:36.833	2025-09-02 07:26:36.833
0c5555df-b677-4752-8995-fc2eaf71c39d	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$ZF5euZc/GjUMx6cN2qHw4e3blSoRjLxD9dA4tsr6CQd/KCJ4KUfu2	\N	2025-10-03 03:14:44.807	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-09-03 03:14:44.809	2025-09-03 03:14:44.809
ba7e6a3e-1e40-494b-a84e-01eafbb6709d	1ec02dec-9a81-473a-9cdf-31454e2e959a	$2a$10$AGUquSoHiyvbZ/57CuB3POpU7cT7XAamSC.1YcfCpg4fpwWlbqERC	\N	2025-10-03 03:17:01.087	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	desktop	t	\N	2025-09-03 03:17:01.089	2025-09-03 03:17:01.089
\.


--
-- Data for Name: webhook_delivery_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.webhook_delivery_logs (id, company_id, provider_type, webhook_type, order_id, payload, status, processing_attempts, processed_at, error_message, created_at, updated_at) FROM stdin;
\.


--
-- Name: license_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.license_audit_logs_id_seq', 24, true);


--
-- Name: license_invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.license_invoices_id_seq', 3, true);


--
-- PostgreSQL database dump complete
--

\unrestrict oLAwOA5GJ3C8TLqINWtgvXDHeKamTDaeGxa1LZgHto17ReN59II1DUt7fbCwfxJ

