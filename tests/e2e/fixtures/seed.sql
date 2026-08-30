-- Inferred E2E-only fixture seed.
-- This data is deterministic, disposable, and is not production business data.

INSERT INTO shops (
  name,
  slug,
  region,
  category,
  address,
  notes,
  opentimes,
  deliverycost,
  visibility,
  logo,
  background,
  ordersphonenumber,
  orderswhatsappnumber,
  typeformtoken,
  created_at,
  updated_at
) VALUES (
  'E2E Fixture Shop',
  'e2e-fixture-shop',
  'E2E Region',
  'Comida',
  'E2E Address',
  'E2E fixture shop',
  'E2E hours',
  '0',
  'public',
  NULL,
  NULL,
  '+5491100000000',
  '+5491100000000',
  'e2e-fixture-token',
  '2020-01-01T00:00:00Z',
  '2020-01-01T00:00:00Z'
);

INSERT INTO products (
  shopid,
  name,
  category,
  price,
  description,
  itemnumber,
  created_at,
  updated_at
)
SELECT
  id,
  'E2E Product',
  'E2E Category',
  1000.00,
  'E2E fixture product',
  1,
  '2020-01-01T00:00:00Z',
  '2020-01-01T00:00:00Z'
FROM shops
WHERE slug = 'e2e-fixture-shop';
