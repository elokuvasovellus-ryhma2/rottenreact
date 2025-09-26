--
-- PostgreSQL database dump
--

\restrict IiidbiE4Fb6nupzYR94nKO8OL3voa9FGLrvHp0qVbelj3SbVJCPbcmAeFpHxGIP

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-25 16:40:34

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
-- TOC entry 2 (class 3079 OID 16744)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5022 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 890 (class 1247 OID 16782)
-- Name: member_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.member_role AS ENUM (
    'member',
    'admin'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 225 (class 1259 OID 16920)
-- Name: group_finnkino_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_finnkino_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    display_text text NOT NULL,
    added_by_user_id uuid NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 16813)
-- Name: group_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_memberships (
    group_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role public.member_role DEFAULT 'member'::public.member_role NOT NULL,
    is_approved boolean DEFAULT false NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 16899)
-- Name: group_pinned_movies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_pinned_movies (
    group_id uuid NOT NULL,
    movie_id text NOT NULL,
    added_by_user_id uuid NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 16797)
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_user_id uuid NOT NULL,
    name text NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 16844)
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    movie_id text NOT NULL,
    user_id uuid NOT NULL,
    rating integer NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    title text,
    CONSTRAINT reviews_stars_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- TOC entry 222 (class 1259 OID 16868)
-- Name: user_favorite_list; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_favorite_list (
    user_id uuid NOT NULL,
    name text DEFAULT 'Omat suosikit'::text NOT NULL,
    share_url text,
    id uuid NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 16883)
-- Name: user_favorite_movies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_favorite_movies (
    movie_id text NOT NULL,
    list_id uuid NOT NULL
);


--
-- TOC entry 218 (class 1259 OID 16787)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL
);


--
-- TOC entry 5016 (class 0 OID 16920)
-- Dependencies: 225
-- Data for Name: group_finnkino_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_finnkino_items (id, group_id, display_text, added_by_user_id) FROM stdin;
\.


--
-- TOC entry 5011 (class 0 OID 16813)
-- Dependencies: 220
-- Data for Name: group_memberships; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_memberships (group_id, user_id, role, is_approved) FROM stdin;
\.


--
-- TOC entry 5015 (class 0 OID 16899)
-- Dependencies: 224
-- Data for Name: group_pinned_movies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_pinned_movies (group_id, movie_id, added_by_user_id) FROM stdin;
\.


--
-- TOC entry 5010 (class 0 OID 16797)
-- Dependencies: 219
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.groups (id, owner_user_id, name) FROM stdin;
\.


--
-- TOC entry 5012 (class 0 OID 16844)
-- Dependencies: 221
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, movie_id, user_id, rating, body, created_at, title) FROM stdin;
0875ae2b-ad47-4a65-8cfc-be07cf7e791d	550	67fa096d-f94f-463b-8043-83c38c232588	5	Visuaalisesti upea ja älykäs.	2025-09-21 15:07:31.361942+03	Klassikko
c66e4959-4893-4abc-b930-f5de2e30e838	603	96403e07-8231-4a4f-86b7-0fe1683c6092	4	Bullet time toimii yhä.	2025-09-21 15:07:31.361942+03	Scifiä parhaimmillaan
d9c6fc7d-4559-4956-a3b4-5269ed7b47d7	266315	fcc1d7bb-b4be-47c3-ae3a-32f8f9eb1769	3	Test review	2025-09-24 20:06:39.447418+03	Test
8f39d195-9a8c-4d57-a42a-ed77c8cc46e4	755898	fcc1d7bb-b4be-47c3-ae3a-32f8f9eb1769	5	Test	2025-09-24 20:16:35.892848+03	Test
e5ef587d-2512-4e8f-ae6d-c0a0b09379d1	987400	fcc1d7bb-b4be-47c3-ae3a-32f8f9eb1769	4	Funny and enterteining	2025-09-25 13:47:04.10352+03	Funny
b1a8f67c-b8f7-40a0-bc61-16d905e7d57a	1009640	fcc1d7bb-b4be-47c3-ae3a-32f8f9eb1769	5	Just Awesome	2025-09-25 13:58:49.404612+03	Wow
\.


--
-- TOC entry 5013 (class 0 OID 16868)
-- Dependencies: 222
-- Data for Name: user_favorite_list; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_favorite_list (user_id, name, share_url, id) FROM stdin;
\.


--
-- TOC entry 5014 (class 0 OID 16883)
-- Dependencies: 223
-- Data for Name: user_favorite_movies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_favorite_movies (movie_id, list_id) FROM stdin;
\.


--
-- TOC entry 5009 (class 0 OID 16787)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash) FROM stdin;
67fa096d-f94f-463b-8043-83c38c232588	user1@example.com	$2a$06$eb94xI09K4W7Op3CASoiBuwXRRAbGwzCDWsvb/zSYtt7RWtA3gP4e
d71eb7e3-b250-4e08-87c5-929372b89ae8	user2@example.com	$2a$06$VoO7OviGmxlJCLoUNibkve5KTPMioC13KDYjH4aomWILx1b6pEbP2
96403e07-8231-4a4f-86b7-0fe1683c6092	user3@example.com	$2a$06$dJL6c3GXGOem3ZvC20G0SubackI.ShS0ltGwc0/rUrr5L53nGcFOy
9be8e49a-4a5e-44ec-8017-7b08990176aa	user4@example.com	$2a$06$2HZgTsQ3nYSDHGT3wruRJ.8jcFyscABrV.jQIwItRp4Fsvdeb/Z7m
d87c884e-87e5-4742-80c5-9bc0cc44fe8e	user5@example.com	$2a$06$PQwN.GXKAhp65Bj6mHO42ebK9I5kRMk/Yn9iBu5khtRrtC8kp.NKm
828048ee-0b89-4f69-afd5-2f3299035cf6	teppo@testi	$2b$10$TiUPd9Wcux3cUbwTOPS55OMX9YdpFT1H8p/CydM0B4QltNEj4I.GG
fcc1d7bb-b4be-47c3-ae3a-32f8f9eb1769	testi@testi.com	$2b$10$ObmYytRgRG.BTG7qefHGUO6W4Cz/iG4Eq3SqENmhRpdoioNxd5B8a
\.


-- Completed on 2025-09-25 16:40:34

--
-- PostgreSQL database dump complete
--

\unrestrict IiidbiE4Fb6nupzYR94nKO8OL3voa9FGLrvHp0qVbelj3SbVJCPbcmAeFpHxGIP

