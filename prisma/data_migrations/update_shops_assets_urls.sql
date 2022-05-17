-- removes old cdn paths from assets and only leaves the filename

ALTER TABLE shops DISABLE TRIGGER set_timestamp;

UPDATE shops
SET background = REGEXP_REPLACE(background, '((http://|https://).*/[0-9]+/)', '')
WHERE background IS NOT NULL;

UPDATE shops
SET logo = REGEXP_REPLACE(logo, '((http://|https://).*/[0-9]+/)', '')
WHERE logo IS NOT NULL;

ALTER TABLE shops ENABLE TRIGGER set_timestamp;
