--
-- PostgreSQL database dump
--

\restrict SivGcG28jgcKQbzZgKYN1Mdy2CSkqh1x4ihFLOUfszNjLI5s8XXbRxXvTccDE4D

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: clientes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    nome character varying(200) NOT NULL,
    telefone character varying(30),
    whatsapp character varying(30),
    email character varying(200),
    cpf character varying(20),
    endereco text,
    notas text,
    created_at timestamp with time zone DEFAULT now(),
    loja_id integer DEFAULT 1
);


--
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- Name: config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.config (
    key character varying(100) NOT NULL,
    value text,
    updated_at timestamp with time zone DEFAULT now(),
    loja_id integer DEFAULT 1 NOT NULL
);


--
-- Name: haveres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.haveres (
    id integer NOT NULL,
    cliente_id integer,
    valor numeric(10,2) NOT NULL,
    saldo_restante numeric(10,2) NOT NULL,
    descricao text,
    created_at timestamp with time zone DEFAULT now(),
    loja_id integer DEFAULT 1
);


--
-- Name: haveres_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.haveres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: haveres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.haveres_id_seq OWNED BY public.haveres.id;


--
-- Name: lojas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lojas (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    slug character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'ativo'::character varying,
    plano character varying(20) DEFAULT 'basico'::character varying,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: lojas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lojas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lojas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lojas_id_seq OWNED BY public.lojas.id;


--
-- Name: produtos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.produtos (
    id integer NOT NULL,
    marca character varying(100) NOT NULL,
    nome character varying(200) NOT NULL,
    preco numeric(10,2) NOT NULL,
    estoque integer DEFAULT 0,
    img_url text,
    created_at timestamp with time zone DEFAULT now(),
    loja_id integer DEFAULT 1
);


--
-- Name: produtos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.produtos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: produtos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.produtos_id_seq OWNED BY public.produtos.id;


--
-- Name: venda_itens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.venda_itens (
    id integer NOT NULL,
    venda_id integer,
    produto_id integer,
    nome_produto character varying(200),
    marca character varying(100),
    preco_unit numeric(10,2),
    quantidade integer DEFAULT 1
);


--
-- Name: venda_itens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.venda_itens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: venda_itens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.venda_itens_id_seq OWNED BY public.venda_itens.id;


--
-- Name: vendas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendas (
    id integer NOT NULL,
    cliente_id integer,
    total numeric(10,2) NOT NULL,
    forma_pagamento character varying(50) NOT NULL,
    status character varying(30) DEFAULT 'confirmada'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    asaas_id character varying(50),
    asaas_invoice_url text,
    asaas_status character varying(30),
    valor_pago numeric(10,2) DEFAULT 0,
    loja_id integer DEFAULT 1
);


--
-- Name: vendas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendas_id_seq OWNED BY public.vendas.id;


--
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- Name: haveres id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.haveres ALTER COLUMN id SET DEFAULT nextval('public.haveres_id_seq'::regclass);


--
-- Name: lojas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lojas ALTER COLUMN id SET DEFAULT nextval('public.lojas_id_seq'::regclass);


--
-- Name: produtos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produtos ALTER COLUMN id SET DEFAULT nextval('public.produtos_id_seq'::regclass);


--
-- Name: venda_itens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venda_itens ALTER COLUMN id SET DEFAULT nextval('public.venda_itens_id_seq'::regclass);


--
-- Name: vendas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendas ALTER COLUMN id SET DEFAULT nextval('public.vendas_id_seq'::regclass);


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clientes (id, nome, telefone, whatsapp, email, cpf, endereco, notas, created_at, loja_id) FROM stdin;
14	Bruna maxuellen	(93) 99104-6677	(93) 99104-6677		023.911.582-11	Altamira	\N	2026-03-16 16:58:20.053339+00	1
10	Edna						\N	2026-03-16 16:58:24.05105+00	1
8	Kátia Gonçalves						\N	2026-03-16 16:58:28.095439+00	1
16	MARIA DOCICLEIA	(93) 99901-6907	(93) 99901-6907		837.121.002-72		\N	2026-03-16 16:58:32.191911+00	1
17	MARIA LEONAIA	(91) 98020-6090	(91) 98020-6090				\N	2026-03-16 16:58:36.434972+00	1
7	Maria Aparecida Pimentel						\N	2026-03-16 16:58:40.308549+00	1
19	Maria Pimentel teca	(99) 99129-6973	(99) 99129-6973				\N	2026-03-16 16:58:44.755811+00	1
13	Mariza Farias						\N	2026-03-16 16:58:48.730525+00	1
18	Maylan Alves	(93) 98813-5990	(93) 98813-5990				\N	2026-03-16 16:58:52.690032+00	1
2	Tainara linda ♥️	93991253669	93991253669	tainarasilvadeoleliveira10@gmail.com	04021480347		\N	2026-03-16 16:58:56.770222+00	1
5	Tânia Gonçalves						\N	2026-03-16 16:59:00.625255+00	1
15	edinaldo lima de oliveira	(93) 98114-4430	(93) 98114-4430	edinaldolima1981@gmail.com	941.932.583-00		\N	2026-03-16 16:59:04.406365+00	1
6	Áurea Gonçalves						\N	2026-03-16 16:59:08.594824+00	1
\.


--
-- Data for Name: config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.config (key, value, updated_at, loja_id) FROM stdin;
sheets_id	1Q-DqgOe7wnVAqGF-shCCPILFS1f4zGO24XUwQl6PpRQ	2026-03-16 11:47:40.902849+00	1
auth_config	{"admin_password":"flordeliz2024","colaborador_password":"","colaborador_permissions":{}}	2026-03-16 17:01:32.659591+00	1
google_email	polianamulato268@gmail.com	2026-03-16 18:09:05.664629+00	1
\.


--
-- Data for Name: haveres; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.haveres (id, cliente_id, valor, saldo_restante, descricao, created_at, loja_id) FROM stdin;
\.


--
-- Data for Name: lojas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lojas (id, nome, slug, status, plano, created_at) FROM stdin;
1	Flor de Liz	flordeliz	ativo	pro	2026-03-16 14:43:40.745581+00
\.


--
-- Data for Name: produtos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.produtos (id, marca, nome, preco, estoque, img_url, created_at, loja_id) FROM stdin;
\.


--
-- Data for Name: venda_itens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.venda_itens (id, venda_id, produto_id, nome_produto, marca, preco_unit, quantidade) FROM stdin;
\.


--
-- Data for Name: vendas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendas (id, cliente_id, total, forma_pagamento, status, created_at, asaas_id, asaas_invoice_url, asaas_status, valor_pago, loja_id) FROM stdin;
15	19	199.90	a_prazo	fiado	2026-03-16 11:53:00+00	\N	\N	\N	0.00	1
14	18	139.90	a_prazo	fiado	2026-03-16 11:45:00+00	\N	\N	\N	0.00	1
13	17	276.89	a_prazo	fiado	2026-03-16 11:17:00+00	\N	\N	\N	0.00	1
12	16	367.00	a_prazo	fiado	2026-03-16 10:50:00+00	\N	\N	\N	300.00	1
11	14	93.90	a_prazo	fiado	2026-03-15 22:28:00+00	\N	\N	\N	0.00	1
7	13	32.99	a_prazo	fiado	2026-03-15 18:53:00+00	\N	\N	\N	10.00	1
\.


--
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clientes_id_seq', 20, true);


--
-- Name: haveres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.haveres_id_seq', 2, true);


--
-- Name: lojas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lojas_id_seq', 1, true);


--
-- Name: produtos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.produtos_id_seq', 2, true);


--
-- Name: venda_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.venda_itens_id_seq', 3, true);


--
-- Name: vendas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vendas_id_seq', 16, true);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: config config_key_loja_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config
    ADD CONSTRAINT config_key_loja_id_pk PRIMARY KEY (key, loja_id);


--
-- Name: haveres haveres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.haveres
    ADD CONSTRAINT haveres_pkey PRIMARY KEY (id);


--
-- Name: lojas lojas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lojas
    ADD CONSTRAINT lojas_pkey PRIMARY KEY (id);


--
-- Name: produtos produtos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produtos
    ADD CONSTRAINT produtos_pkey PRIMARY KEY (id);


--
-- Name: venda_itens venda_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venda_itens
    ADD CONSTRAINT venda_itens_pkey PRIMARY KEY (id);


--
-- Name: vendas vendas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendas
    ADD CONSTRAINT vendas_pkey PRIMARY KEY (id);


--
-- Name: lojas_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX lojas_slug_key ON public.lojas USING btree (slug);


--
-- PostgreSQL database dump complete
--

\unrestrict SivGcG28jgcKQbzZgKYN1Mdy2CSkqh1x4ihFLOUfszNjLI5s8XXbRxXvTccDE4D

