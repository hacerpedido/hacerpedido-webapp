-- Inferred E2E-only fixture schema.
-- Derived from historical commit 0936238's db/schema.sql.
-- This disposable schema is not a production migration baseline.

CREATE TABLE shops (
  id                    SERIAL PRIMARY KEY,
  name                  TEXT        NOT NULL,
  slug                  TEXT        NOT NULL UNIQUE,
  region                TEXT,
  category              TEXT,
  address               TEXT,
  notes                 TEXT,
  opentimes             TEXT,
  deliverycost          TEXT,
  visibility            TEXT        NOT NULL DEFAULT 'public',
  logo                  TEXT,
  background            TEXT,
  ordersphonenumber     TEXT,
  orderswhatsappnumber  TEXT,
  typeformtoken         TEXT        UNIQUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX shops_category_visibility_idx ON shops (category, visibility);
CREATE INDEX shops_updated_at_idx ON shops (updated_at DESC);

CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  shopid      INTEGER     NOT NULL REFERENCES shops (id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  category    TEXT,
  price       NUMERIC(10, 2) NOT NULL,
  description TEXT,
  itemnumber  INTEGER     NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX products_shopid_itemnumber_idx ON products (shopid, itemnumber);
