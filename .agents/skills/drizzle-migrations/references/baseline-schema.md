# Baseline schema (`0000_init.sql`)

## `shops`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, default `uuid_generate_v1()` |
| name | text | NOT NULL |
| slug | text | NOT NULL, UNIQUE |
| region | text | NOT NULL |
| username | text | |
| category | text | |
| address | text | |
| notes | text | |
| ordersbyphoneorwhatsapp | text | |
| delivery | text | |
| takeaway | text | |
| whatsappnumber | text | |
| phonenumber | text | |
| email | text | |
| submittedat | text | |
| opentimes | text | |
| deliverycost | text | |
| visibility | text | |
| logo | text | |
| background | text | |
| typeformtoken | text | merchant management token |
| ordersphonenumber | text | |
| orderswhatsappnumber | text | order-taking WhatsApp number |
| created_at | timestamp | DEFAULT now() |
| updated_at | timestamp | DEFAULT now(), trigger-maintained |

## `products`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, default `uuid_generate_v1()` |
| category | text | NOT NULL |
| name | text | NOT NULL |
| description | text | |
| price | text | stored as text |
| shopid | uuid | NOT NULL, FK → shops.id |
| itemnumber | integer | |
| created_at | timestamp | DEFAULT now() |
| updated_at | timestamp | DEFAULT now(), trigger-maintained |

## Triggers / functions

- `trigger_set_timestamp()` — sets `updated_at = NOW()` on UPDATE; trigger `set_timestamp` on both tables.
- `rls_auto_enable()` — event-trigger function replicated from prod; the event trigger itself is NOT created in E2E.