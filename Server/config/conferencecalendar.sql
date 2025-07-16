--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2025-07-15 17:58:39

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 81984)
-- Name: booking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking (
    id integer NOT NULL,
    name text NOT NULL,
    meeting_name text NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    meeting_purpose text NOT NULL,
    contact_number character varying(15) NOT NULL,
    email text NOT NULL,
    team_category text NOT NULL,
    team_sub_category text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    date date NOT NULL,
    room_id integer,
    status text DEFAULT 'pending'::text
);


ALTER TABLE public.booking OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 81983)
-- Name: booking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_id_seq OWNER TO postgres;

--
-- TOC entry 4943 (class 0 OID 0)
-- Dependencies: 219
-- Name: booking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.booking_id_seq OWNED BY public.booking.id;


--
-- TOC entry 224 (class 1259 OID 98490)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 98489)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 4944 (class 0 OID 0)
-- Dependencies: 223
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 218 (class 1259 OID 65631)
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    location character varying(255) NOT NULL,
    capacity integer NOT NULL,
    floor character varying(50),
    image character varying(1000),
    description text,
    equipment character varying(255)
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 65630)
-- Name: rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rooms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rooms_id_seq OWNER TO postgres;

--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 217
-- Name: rooms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rooms_id_seq OWNED BY public.rooms.id;


--
-- TOC entry 226 (class 1259 OID 98497)
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    category_id integer NOT NULL
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 98496)
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teams_id_seq OWNER TO postgres;

--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 225
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- TOC entry 222 (class 1259 OID 82000)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 81999)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4763 (class 2604 OID 81987)
-- Name: booking id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking ALTER COLUMN id SET DEFAULT nextval('public.booking_id_seq'::regclass);


--
-- TOC entry 4767 (class 2604 OID 98493)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4762 (class 2604 OID 65634)
-- Name: rooms id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms ALTER COLUMN id SET DEFAULT nextval('public.rooms_id_seq'::regclass);


--
-- TOC entry 4768 (class 2604 OID 98500)
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- TOC entry 4766 (class 2604 OID 82003)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4931 (class 0 OID 81984)
-- Dependencies: 220
-- Data for Name: booking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.booking (id, name, meeting_name, start_time, end_time, meeting_purpose, contact_number, email, team_category, team_sub_category, created_at, date, room_id, status) FROM stdin;
1	Kishore 	Meeting Room	2025-06-26 17:20:00	2025-06-26 18:20:00	qwerty	6379120338	kishore.madhavan@wraptron.com	gdc		2025-06-26 15:21:22.962484	2025-06-26	4	rejected
4	qwerty	qertyty	2025-07-02 16:13:00	2025-07-02 17:00:00	asdghjjk	9087654123	test@gmail.com	cfi_teams	Team Abhyuday	2025-07-02 15:15:32.520834	2025-07-02	5	rejected
3	qwert7u	uygihj	2025-07-03 16:00:00	2025-07-03 17:01:00	uytiokoi	9865432178	test@gmail.com	nirmaan	Machintell_corp	2025-07-02 15:11:06.662306	2025-07-03	4	rejected
2	Jaya Prakash	Meeting Room	2025-07-01 15:26:00	2025-07-01 16:26:00	qwertyuiopljkhgdfas	06379120338	test@gmail.com	gdc		2025-07-01 14:27:13.647142	2025-07-01	2	rejected
7	Jaya Prakash	Angapradhikshanam	2025-07-04 20:00:00	2025-07-04 21:00:00	etwet	06379120338	test@gmail.com	cfi_teams	Team Abhyuday	2025-07-04 17:57:07.482879	2025-07-04	2	rejected
6	Jaya Prakash	ttd	2025-07-04 18:56:00	2025-07-04 19:56:00	eqwrqer	06379120338	test@gmail.com	gdc		2025-07-04 17:55:47.685874	2025-07-04	3	rejected
9	Jaya Prakash	5r	2025-07-11 00:00:00	2025-07-11 01:00:00	rg	06379120338	test@gmail.com	global_engagement		2025-07-05 10:21:11.879992	2025-07-11	2	rejected
8	Jaya Prakash	ttd	2025-07-04 18:00:00	2025-07-04 19:00:00	weef	06379120338	test@gmail.com	iitmaa		2025-07-04 17:57:30.765646	2025-07-04	5	rejected
5	kishore m	qwerty	2025-07-03 18:18:00	2025-07-03 19:18:00	dfgh	8807919181	test@gmail.com	cfi_teams	Team Anveshak	2025-07-03 17:19:15.421249	2025-07-03	2	rejected
10	Santhosh	Wraptron Meeting	2025-07-07 15:30:00	2025-07-07 16:30:00	traktor progress	06379120338	test@gmail.com	nirmaan	Teraclime	2025-07-07 14:29:04.697939	2025-07-07	5	confirmed
13	Santhosh	Wraptron	2025-07-10 15:00:00	2025-07-10 16:00:00	eertyrtrtyu	8796543021	test@gmail.com	1		2025-07-10 09:57:08.989896	2025-07-10	2	confirmed
12	Jaya Prakash	er	2025-07-09 20:45:00	2025-07-09 22:00:00	rtert	06379120338	test@gmail.com	2		2025-07-09 18:01:06.772006	2025-07-09	2	confirmed
14	kishore	qwerty	2025-07-10 19:00:00	2025-07-10 20:00:00	454534	1324565758	test@gmail.com	1		2025-07-10 10:03:17.256442	2025-07-10	3	confirmed
16	kishore	5r	2025-07-12 01:30:00	2025-07-12 02:30:00	424524	5646768333	kishore.madhavan@wraptron.com	1		2025-07-10 10:28:32.125034	2025-07-12	4	pending
19	Jaya Prakashffgdf	Tomorrow meeting	2025-07-16 02:45:00	2025-07-16 03:45:00	wfsd	06379120338	kishore.madhavan@wraptron.com	11	Ewebstore	2025-07-10 16:21:35.064507	2025-07-16	3	pending
15	Jaya Prakash	ereyet	2025-07-11 02:00:00	2025-07-11 03:00:00	3rterye	06379120338	test@gmail.com	2		2025-07-10 10:13:44.878143	2025-07-11	4	confirmed
17	Jaya Prakash	Trktor	2025-07-11 00:30:00	2025-07-11 01:30:00	rterte	06379120338	test@gmail.com	1	fdhdhgh	2025-07-10 11:01:55.708904	2025-07-11	4	confirmed
11	Jaya Prakash	ttd	2025-07-10 00:15:00	2025-07-10 02:30:00	rty	06379120338	test@gmail.com	2		2025-07-09 14:28:17.347545	2025-07-10	4	rejected
18	rishi	Wraptron Meeting	2025-07-15 03:00:00	2025-07-15 04:00:00	453twr	06379120338	test@gmail.com	10	Team Avishkar Hyperloop	2025-07-10 16:15:25.473424	2025-07-15	5	rejected
20	Krish	Birthday party	2025-07-14 12:00:00	2025-07-14 13:15:00	friends all are celebrate	6395281047	krish21498@gmail.com	10	Team Agnirath	2025-07-14 10:11:54.953637	2025-07-14	4	pending
\.


--
-- TOC entry 4935 (class 0 OID 98490)
-- Dependencies: 224
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name) FROM stdin;
9	CFI Club
10	CFI Teams
12	GDC
11	Nirmaan Teams
13	IIT Madras Alumni Association
14	Office of Global Engagement
15	RuTag
\.


--
-- TOC entry 4929 (class 0 OID 65631)
-- Dependencies: 218
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rooms (id, name, location, capacity, floor, image, description, equipment) FROM stdin;
4	Conference Room 101	Sudha & Shankar Innovation Hub	18	1st Floor	https://www.appliedglobal.com/wp-content/uploads/5-Most-Important-Conference-Room-Technologies-2048x1152.png	You Want can u use this room book before 5 hours	Projector, LCD Screen, Whiteboard, HDMI Connectivity, Teleconference
2	Conference Room 102	Sudha & Shakar Innocvation Hub	30	1st Floor	https://s35891.pcdn.co/mallofasia/wp-content/uploads/sites/10/Meeting-Room-1536x1028.jpg.webp	You can use this room beform book this 2 hours	Projector, LCD Screen, Whiteboard
5	Meeting Room 2	Sudha & Shakar Innovation Hub	4	1 st Floor	https://cdn.app.gofloaters.com/images%2F4%20Seater%20Meeting%20Room%20%7C%20Baner_1684149971119?alt=media&token=f24359ad-a365-415d-810f-2d79d2de7801	Use this room for personal use room	Whiteboard, LCD Screen, HDMI Connectivity
3	Meeting Room 1	Sudha & Shankar Innovation Hub	4	1st floor	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0oEVSFD_ps5-1JgW5MU_lQM9yjpo9S5-qRLqWWxrRYWhk360HtpUI866wLYFQc2Kyz4g&usqp=CAU	Use this for personal	LCD Screen, Projector, Whiteboard
\.


--
-- TOC entry 4937 (class 0 OID 98497)
-- Dependencies: 226
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, name, category_id) FROM stdin;
7	3D Printing Club	9
8	Aero Club	9
9	Electronics Club	9
10	Horizon	9
11	iBot Club	9
13	Product Design Club	9
14	Programming Club	9
15	Team Sahaay	9
16	Team Envisage	9
17	Webops and Blockchain	9
18	AI Club	9
19	Biotech Club	9
20	Mathematics Club	9
21	Cybersecurity Club	9
22	Raftar Formula Racing	10
23	Team Abhiyaan	10
24	Team Anveshak	10
25	Team Avishkar Hyperloop	10
27	Team Abhyuday	10
28	IGEM	10
29	Amogh	10
26	Team Agnirath	10
30	Somfin	11
31	Electra Wheeler	11
32	Tarang	11
33	Machintell Corp	11
34	Teraclime	11
35	Plenome	11
36	Krishaka	11
37	Kendal	11
38	Ewebstore	11
\.


--
-- TOC entry 4933 (class 0 OID 82000)
-- Dependencies: 222
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role) FROM stdin;
6	Manager	manager.ie@imail.iitm.ac.in	$2b$10$kgiUDjY5rgXUjO5R6p.8z.WLUFTRyM.B5oY1CBy4kZ7dQFo48mcQS	admin
7	Test	test@gmail.com	$2b$10$pNFlAgq5ySMo1yWTGhXuCewTn0gHh6LukNYO41taOPbWTi29D9qrC	user
8	JP	kishore.madhavan@wraptron.com	$2b$10$m2q2BQQf9fQRpUD9I/wETOlhrboZi6aXO6oaF0HWUl2zQxBipQ4K.	user
15	Jaya Prakash	jayaprakashtrk8@gmail.com	$2b$10$5yPE46mYP5SxHwvGxaPwhOfTTQBCYFDB1DN9Y4jkJKNfgtledeWU.	admin
23	jpm	jayaprakashmurugan2000@gmail.com	$2b$10$../Nh1NwtzRkI2.Iu9wwZeDu7Jw/wE0Uwi08XV2mowBJ4DdZPa6Iq	user
24	VS13139	vs13139@imail.iitm.ac.in	$2b$10$rsG7g08V51ANvLrtt5p7j.Sw2RzFos4WOGWzW5vPN0VGODWHlghLa	admin
25	Krish	krish21498@gmail.com	$2b$10$TpU5F91YzMwmdycD628lX.NXvbueTN9b184Y5BCgGtph/yJAMog96	user
26	Santhosh	santhoshloganathan19@gmail.com	$2b$10$MaH/DZol60cirk167Q.hFePrv3SPRz5XJE1JoWVwPO7c1fhTTSj2i	user
\.


--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 219
-- Name: booking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.booking_id_seq', 20, true);


--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 223
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 15, true);


--
-- TOC entry 4950 (class 0 OID 0)
-- Dependencies: 217
-- Name: rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rooms_id_seq', 6, true);


--
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 225
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teams_id_seq', 38, true);


--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 26, true);


--
-- TOC entry 4772 (class 2606 OID 81992)
-- Name: booking booking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_pkey PRIMARY KEY (id);


--
-- TOC entry 4778 (class 2606 OID 98495)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4770 (class 2606 OID 65638)
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- TOC entry 4780 (class 2606 OID 98502)
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- TOC entry 4774 (class 2606 OID 82009)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4776 (class 2606 OID 82007)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4781 (class 2606 OID 81993)
-- Name: booking booking_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- TOC entry 4782 (class 2606 OID 98503)
-- Name: teams teams_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


-- Completed on 2025-07-15 17:58:43

--
-- PostgreSQL database dump complete
--

