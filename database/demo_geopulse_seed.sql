/*
 GeoPulse demo GIS seed (PostgreSQL / Supabase SQL Editor)
 -----------------------------------------------------------------------------
 Purpose
   Creates an isolated, repeatable demo dataset for the GeoPulse GIS map.

 Safety properties
   - Creates no tables, migrations, extensions, users, or schema changes.
   - Does not update or delete existing records.
   - Uses a transaction and an advisory lock so a failed run rolls back fully.
   - Uses immutable demo markers and preflight checks to prevent collisions with
     a real farm, zone, or sensor that happens to use a demo-looking value.
   - Leaves farms.farmer_id NULL because the current farmer/user key mismatch is
     intentionally outside the scope of this demo seed.

 Run only the transaction below in Supabase SQL Editor.  Do not run the rollback
 block at the bottom at the same time.
*/

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SET LOCAL search_path TO public, pg_catalog;
SELECT pg_advisory_xact_lock(hashtextextended('geopulse-demo-gis-seed-v1', 0));
LOCK TABLE farms, zones, sensor_devices, sensor_readings, alerts, crop_predictions, fertilizer_predictions IN SHARE ROW EXCLUSIVE MODE;

/*
 Preflight: fail before inserting anything if this database does not match the
 inspected GeoPulse schema, or if a real record would collide with a demo key.
*/
DO $$
DECLARE
    seed_key constant text := 'GeoPulse demo GIS seed v1';
    farm_marker constant text := 'GeoPulse demo GIS seed v1 | farm';
    expected_farm_name constant text := 'GeoPulse Demo Farm';
    boundary_type text;
    zone_id_is_nullable boolean;
    farmer_id_is_nullable boolean;
    has_sensor_code_unique_index boolean;
BEGIN
    IF to_regclass('public.farms') IS NULL
       OR to_regclass('public.zones') IS NULL
       OR to_regclass('public.sensor_devices') IS NULL
       OR to_regclass('public.sensor_readings') IS NULL
       OR to_regclass('public.alerts') IS NULL
       OR to_regclass('public.crop_predictions') IS NULL
       OR to_regclass('public.fertilizer_predictions') IS NULL
       OR to_regclass('public.threshold_settings') IS NULL THEN
        RAISE EXCEPTION 'GeoPulse demo seed stopped: one or more required tables are missing.';
    END IF;

    IF EXISTS (
        SELECT 1
          FROM (
                VALUES
                    ('farms'::text, 'farmer_id'::text),
                    ('zones', 'boundary_geojson'),
                    ('sensor_devices', 'zone_id'),
                    ('sensor_devices', 'sensor_code'),
                    ('sensor_readings', 'validation_notes'),
                    ('alerts', 'acknowledged_at'),
                    ('crop_predictions', 'prediction_status'),
                    ('fertilizer_predictions', 'best_fertilizer'),
                    ('fertilizer_predictions', 'prediction_status')
          ) AS required_column(table_name, column_name)
         WHERE NOT EXISTS (
                SELECT 1
                  FROM information_schema.columns c
                 WHERE c.table_schema = 'public'
                   AND c.table_name = required_column.table_name
                   AND c.column_name = required_column.column_name
         )
    ) THEN
        RAISE EXCEPTION 'GeoPulse demo seed stopped: the live schema is missing a required seed column.';
    END IF;

    SELECT format_type(a.atttypid, a.atttypmod)
      INTO boundary_type
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname = 'zones'
       AND a.attname = 'boundary_geojson'
       AND a.attnum > 0
       AND NOT a.attisdropped;

    IF boundary_type IS DISTINCT FROM 'jsonb' THEN
        RAISE EXCEPTION 'GeoPulse demo seed stopped: zones.boundary_geojson must be jsonb (found: %).', boundary_type;
    END IF;

    SELECT NOT a.attnotnull
      INTO zone_id_is_nullable
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname = 'sensor_devices'
       AND a.attname = 'zone_id'
       AND a.attnum > 0
       AND NOT a.attisdropped;

    IF zone_id_is_nullable IS DISTINCT FROM true THEN
        RAISE EXCEPTION 'GeoPulse demo seed stopped: sensor_devices.zone_id must exist and be nullable.';
    END IF;

    SELECT NOT a.attnotnull
      INTO farmer_id_is_nullable
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname = 'farms'
       AND a.attname = 'farmer_id'
       AND a.attnum > 0
       AND NOT a.attisdropped;

    IF farmer_id_is_nullable IS DISTINCT FROM true THEN
        RAISE EXCEPTION 'GeoPulse demo seed stopped: farms.farmer_id must be nullable; no fake farmer ID will be used.';
    END IF;

    SELECT EXISTS (
        SELECT 1
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON kcu.constraint_catalog = tc.constraint_catalog
           AND kcu.constraint_schema = tc.constraint_schema
           AND kcu.constraint_name = tc.constraint_name
         WHERE tc.table_schema = 'public'
           AND tc.table_name = 'sensor_devices'
           AND tc.constraint_type = 'UNIQUE'
         GROUP BY tc.constraint_name
        HAVING count(*) = 1
           AND max(kcu.column_name) = 'sensor_code'
    ) INTO has_sensor_code_unique_index;

    IF has_sensor_code_unique_index IS DISTINCT FROM true THEN
        RAISE EXCEPTION 'GeoPulse demo seed stopped: sensor_devices.sensor_code needs a unique index for safe idempotency.';
    END IF;

    IF EXISTS (
        SELECT 1
          FROM farms
         WHERE farm_name = expected_farm_name
           AND description IS DISTINCT FROM farm_marker
    ) THEN
        RAISE EXCEPTION 'GeoPulse demo seed stopped: a non-demo farm already uses the name "%".', expected_farm_name;
    END IF;

    IF EXISTS (
        SELECT 1
          FROM farms
         WHERE description = farm_marker
           AND farm_name IS DISTINCT FROM expected_farm_name
    ) OR (SELECT count(*) FROM farms WHERE description = farm_marker) > 1 THEN
        RAISE EXCEPTION 'GeoPulse demo seed stopped: the demo farm marker is inconsistent or duplicated.';
    END IF;

    IF EXISTS (
        WITH expected(zone_name) AS (
            VALUES
                ('Demo Zone A — Tomato'::text),
                ('Demo Zone B — Eggplant'::text),
                ('Demo Zone C — Cabbage'::text),
                ('Demo Zone D — Pechay'::text)
        )
        SELECT 1
          FROM zones z
          JOIN farms f ON f.id = z.farm_id
          JOIN expected e ON e.zone_name = z.name
         WHERE f.description = farm_marker
           AND z.description IS DISTINCT FROM seed_key || ' | zone | ' || e.zone_name
    ) THEN
        RAISE EXCEPTION 'GeoPulse demo seed stopped: a demo-zone name exists without its expected demo marker.';
    END IF;

    IF EXISTS (
        SELECT 1
          FROM zones z
          JOIN farms f ON f.id = z.farm_id
         WHERE f.description = farm_marker
           AND z.description LIKE seed_key || ' | zone | %'
         GROUP BY z.description
        HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'GeoPulse demo seed stopped: duplicate demo-zone markers were found.';
    END IF;

    IF EXISTS (
        WITH expected(sensor_code, serial_number, device_name) AS (
            VALUES
                ('DEMO-001'::text, 'GP-DEMO-GIS-V1-001'::text, 'GeoPulse Demo Soil Sensor DEMO-001'::text),
                ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
                ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
                ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
                ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
                ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
                ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
                ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
        )
        SELECT 1
          FROM sensor_devices d
          JOIN expected e
            ON d.sensor_code = e.sensor_code
            OR d.serial_number = e.serial_number
          LEFT JOIN farms f ON f.id = d.farm_id
         WHERE d.sensor_code IS DISTINCT FROM e.sensor_code
            OR d.serial_number IS DISTINCT FROM e.serial_number
            OR d.device_name IS DISTINCT FROM e.device_name
            OR f.description IS DISTINCT FROM farm_marker
    ) THEN
        RAISE EXCEPTION 'GeoPulse demo seed stopped: a DEMO sensor code or serial number belongs to a non-demo device.';
    END IF;
END $$;

/*
 Farm anchor
   - Reuses the existing demo farm coordinate on a repeat run.
   - Otherwise, uses the first existing non-demo farm coordinate if one exists.
   - This database currently has no farm coordinates, so the final fallback is
     a location in Barangay Munting Indang, Nasugbu, Batangas.
*/
WITH existing_demo_anchor AS (
    SELECT latitude, longitude
      FROM farms
     WHERE description = 'GeoPulse demo GIS seed v1 | farm'
     ORDER BY id
     LIMIT 1
),
existing_farm_anchor AS (
    SELECT latitude, longitude
      FROM farms
     WHERE description IS DISTINCT FROM 'GeoPulse demo GIS seed v1 | farm'
       AND latitude IS NOT NULL
       AND longitude IS NOT NULL
     ORDER BY id
     LIMIT 1
),
anchor AS (
    SELECT COALESCE(
               (SELECT latitude FROM existing_demo_anchor),
               (SELECT latitude FROM existing_farm_anchor),
               14.094500::double precision
           ) AS latitude,
           COALESCE(
               (SELECT longitude FROM existing_demo_anchor),
               (SELECT longitude FROM existing_farm_anchor),
               120.698500::double precision
           ) AS longitude
)
INSERT INTO farms (
    farm_name,
    description,
    address,
    barangay,
    municipality,
    province,
    latitude,
    longitude,
    farm_size,
    farm_size_unit,
    soil_type,
    current_crop,
    irrigation_type,
    status,
    created_at,
    updated_at
)
SELECT
    'GeoPulse Demo Farm',
    'GeoPulse demo GIS seed v1 | farm',
    'Demo-only mapping area near Barangay Munting Indang, Nasugbu, Batangas',
    'Munting Indang',
    'Nasugbu',
    'Batangas',
    anchor.latitude,
    anchor.longitude,
    1.20::double precision,
    'hectare',
    'loamy',
    'Tomato, Eggplant, Cabbage, Pechay',
    'drip',
    'active',
    current_timestamp,
    current_timestamp
FROM anchor
WHERE NOT EXISTS (
    SELECT 1
      FROM farms
     WHERE description = 'GeoPulse demo GIS seed v1 | farm'
)
RETURNING id, latitude, longitude;

/* Four small, adjacent, non-overlapping Polygon zones. GeoJSON uses [longitude, latitude]. */
WITH demo_farm AS (
    SELECT id, latitude, longitude
      FROM farms
     WHERE description = 'GeoPulse demo GIS seed v1 | farm'
),
zone_seed (name, current_crop, west_offset, east_offset, south_offset, north_offset) AS (
    VALUES
        ('Demo Zone A — Tomato'::text,   'Tomato'::text,   -0.00050::double precision,  0.00000::double precision, -0.00050::double precision,  0.00000::double precision),
        ('Demo Zone B — Eggplant'::text, 'Eggplant'::text,  0.00000::double precision,  0.00050::double precision, -0.00050::double precision,  0.00000::double precision),
        ('Demo Zone C — Cabbage'::text,  'Cabbage'::text,  -0.00050::double precision,  0.00000::double precision,  0.00000::double precision,  0.00050::double precision),
        ('Demo Zone D — Pechay'::text,   'Pechay'::text,    0.00000::double precision,  0.00050::double precision,  0.00000::double precision,  0.00050::double precision)
)
INSERT INTO zones (
    farm_id,
    name,
    description,
    soil_type,
    current_crop,
    area,
    area_unit,
    boundary_geojson,
    center_latitude,
    center_longitude,
    created_at,
    updated_at
)
SELECT
    f.id,
    z.name,
    'GeoPulse demo GIS seed v1 | zone | ' || z.name,
    'loamy',
    z.current_crop,
    0.30::double precision,
    'hectare',
    jsonb_build_object(
        'type', 'Polygon',
        'coordinates', jsonb_build_array(
            jsonb_build_array(
                jsonb_build_array(f.longitude + z.west_offset, f.latitude + z.south_offset),
                jsonb_build_array(f.longitude + z.east_offset, f.latitude + z.south_offset),
                jsonb_build_array(f.longitude + z.east_offset, f.latitude + z.north_offset),
                jsonb_build_array(f.longitude + z.west_offset, f.latitude + z.north_offset),
                jsonb_build_array(f.longitude + z.west_offset, f.latitude + z.south_offset)
            )
        )
    ),
    f.latitude + ((z.south_offset + z.north_offset) / 2.0),
    f.longitude + ((z.west_offset + z.east_offset) / 2.0),
    current_timestamp,
    current_timestamp
FROM demo_farm f
CROSS JOIN zone_seed z
WHERE NOT EXISTS (
    SELECT 1
      FROM zones existing_zone
     WHERE existing_zone.farm_id = f.id
       AND existing_zone.description = 'GeoPulse demo GIS seed v1 | zone | ' || z.name
)
RETURNING id, name;

/* Validate the generated JSONB is a closed GeoJSON Polygon before continuing. */
DO $$
DECLARE
    seed_key constant text := 'GeoPulse demo GIS seed v1';
BEGIN
    IF (SELECT count(*)
          FROM zones z
          JOIN farms f ON f.id = z.farm_id
         WHERE f.description = seed_key || ' | farm'
           AND z.description LIKE seed_key || ' | zone | %') <> 4 THEN
        RAISE EXCEPTION 'GeoPulse demo seed stopped: exactly four marked demo zones are required.';
    END IF;

    IF EXISTS (
        SELECT 1
          FROM zones z
          JOIN farms f ON f.id = z.farm_id
         WHERE f.description = seed_key || ' | farm'
           AND z.description LIKE seed_key || ' | zone | %'
           AND (
               CASE
                   WHEN z.boundary_geojson ->> 'type' IS DISTINCT FROM 'Polygon' THEN false
                   WHEN jsonb_typeof(z.boundary_geojson -> 'coordinates') IS DISTINCT FROM 'array' THEN false
                   WHEN jsonb_array_length(z.boundary_geojson -> 'coordinates') <> 1 THEN false
                   WHEN jsonb_typeof(z.boundary_geojson -> 'coordinates' -> 0) IS DISTINCT FROM 'array' THEN false
                   WHEN jsonb_array_length(z.boundary_geojson -> 'coordinates' -> 0) < 4 THEN false
                   WHEN (z.boundary_geojson -> 'coordinates' -> 0 -> 0)
                        IS DISTINCT FROM
                        (z.boundary_geojson -> 'coordinates' -> 0 -> (jsonb_array_length(z.boundary_geojson -> 'coordinates' -> 0) - 1)) THEN false
                   WHEN EXISTS (
                       SELECT 1
                         FROM jsonb_array_elements(z.boundary_geojson -> 'coordinates' -> 0) AS point
                        WHERE CASE
                            WHEN jsonb_typeof(point) IS DISTINCT FROM 'array' THEN true
                            WHEN jsonb_array_length(point) <> 2 THEN true
                            ELSE false
                        END
                   ) THEN false
                   ELSE true
               END
           ) IS NOT TRUE
    ) THEN
        RAISE EXCEPTION 'GeoPulse demo seed stopped: generated zone geometry is not a valid closed GeoJSON Polygon.';
    END IF;
END $$;

/* Two in-zone devices per zone. No IDs are assumed; farm and zone IDs are resolved by markers. */
WITH demo_farm AS (
    SELECT id, latitude, longitude
      FROM farms
     WHERE description = 'GeoPulse demo GIS seed v1 | farm'
),
demo_zones AS (
    SELECT z.id, z.name
      FROM zones z
      JOIN demo_farm f ON f.id = z.farm_id
     WHERE z.description LIKE 'GeoPulse demo GIS seed v1 | zone | %'
),
sensor_seed (
    sensor_code,
    serial_number,
    device_name,
    zone_name,
    latitude_offset,
    longitude_offset,
    battery,
    signal,
    connection_type,
    status,
    installation_status,
    is_active,
    installed_days_ago,
    last_seen_offset
) AS (
    VALUES
        ('DEMO-001'::text, 'GP-DEMO-GIS-V1-001'::text, 'GeoPulse Demo Soil Sensor DEMO-001'::text, 'Demo Zone A — Tomato'::text,   -0.00038::double precision, -0.00038::double precision, 96::double precision, 92::integer, 'wifi'::text,    'healthy'::text,     'deployed'::text,    true,  60::integer, interval '2 minutes'),
        ('DEMO-002',       'GP-DEMO-GIS-V1-002',       'GeoPulse Demo Soil Sensor DEMO-002',       'Demo Zone A — Tomato',   -0.00016::double precision, -0.00018::double precision, 93::double precision, 89::integer, 'wifi',            'healthy',             'deployed',          true,  54::integer, interval '4 minutes'),
        ('DEMO-003',       'GP-DEMO-GIS-V1-003',       'GeoPulse Demo Soil Sensor DEMO-003',       'Demo Zone B — Eggplant', -0.00038::double precision,  0.00016::double precision, 74::double precision, 75::integer, 'wifi',            'warning',             'deployed',          true,  49::integer, interval '6 minutes'),
        ('DEMO-004',       'GP-DEMO-GIS-V1-004',       'GeoPulse Demo Soil Sensor DEMO-004',       'Demo Zone B — Eggplant', -0.00014::double precision,  0.00038::double precision, 82::double precision, 83::integer, 'wifi',            'healthy',             'deployed',          true,  43::integer, interval '8 minutes'),
        ('DEMO-005',       'GP-DEMO-GIS-V1-005',       'GeoPulse Demo Soil Sensor DEMO-005',       'Demo Zone C — Cabbage',   0.00017::double precision, -0.00038::double precision, 88::double precision, 86::integer, 'lora',            'healthy',             'deployed',          true,  67::integer, interval '5 minutes'),
        ('DEMO-006',       'GP-DEMO-GIS-V1-006',       'GeoPulse Demo Soil Sensor DEMO-006',       'Demo Zone C — Cabbage',   0.00039::double precision, -0.00016::double precision, 85::double precision, 80::integer, 'lora',            'healthy',             'deployed',          true,  58::integer, interval '7 minutes'),
        ('DEMO-007',       'GP-DEMO-GIS-V1-007',       'GeoPulse Demo Soil Sensor DEMO-007',       'Demo Zone D — Pechay',    0.00017::double precision,  0.00016::double precision, 48::double precision,  0::integer, 'offline',         'offline',             'deployed',         false, 39::integer, interval '26 hours'),
        ('DEMO-008',       'GP-DEMO-GIS-V1-008',       'GeoPulse Demo Soil Sensor DEMO-008',       'Demo Zone D — Pechay',    0.00039::double precision,  0.00038::double precision, 66::double precision,  0::integer, 'offline',         'maintenance',         'maintenance',      false, 31::integer, interval '2 days')
)
INSERT INTO sensor_devices (
    farm_id,
    zone_id,
    sensor_code,
    device_name,
    device_model,
    serial_number,
    latitude,
    longitude,
    battery,
    signal,
    firmware_version,
    connection_type,
    status,
    installation_status,
    is_active,
    installed_at,
    last_seen_at,
    created_at,
    updated_at
)
SELECT
    f.id,
    z.id,
    s.sensor_code,
    s.device_name,
    'GeoPulse Soil Node v1',
    s.serial_number,
    f.latitude + s.latitude_offset,
    f.longitude + s.longitude_offset,
    s.battery,
    s.signal,
    'demo-1.0.0',
    s.connection_type,
    s.status,
    s.installation_status,
    s.is_active,
    current_timestamp - make_interval(days => s.installed_days_ago),
    current_timestamp - s.last_seen_offset,
    current_timestamp,
    current_timestamp
FROM sensor_seed s
JOIN demo_farm f ON true
JOIN demo_zones z ON z.name = s.zone_name
ON CONFLICT (sensor_code) DO NOTHING
RETURNING id, sensor_code, zone_id;

/* A conflict can only be a previously created, exact demo device. Verify that before adding dependent rows. */
DO $$
DECLARE
    seed_key constant text := 'GeoPulse demo GIS seed v1';
BEGIN
    IF (SELECT count(*)
          FROM sensor_devices d
          JOIN farms f ON f.id = d.farm_id
         WHERE f.description = seed_key || ' | farm'
           AND d.sensor_code IN ('DEMO-001', 'DEMO-002', 'DEMO-003', 'DEMO-004', 'DEMO-005', 'DEMO-006', 'DEMO-007', 'DEMO-008')) <> 8 THEN
        RAISE EXCEPTION 'GeoPulse demo seed stopped: exactly eight demo devices are required.';
    END IF;

    IF EXISTS (
        WITH expected(sensor_code, serial_number, device_name, zone_name) AS (
            VALUES
                ('DEMO-001'::text, 'GP-DEMO-GIS-V1-001'::text, 'GeoPulse Demo Soil Sensor DEMO-001'::text, 'Demo Zone A — Tomato'::text),
                ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002', 'Demo Zone A — Tomato'),
                ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003', 'Demo Zone B — Eggplant'),
                ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004', 'Demo Zone B — Eggplant'),
                ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005', 'Demo Zone C — Cabbage'),
                ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006', 'Demo Zone C — Cabbage'),
                ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007', 'Demo Zone D — Pechay'),
                ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008', 'Demo Zone D — Pechay')
        )
        SELECT 1
          FROM expected e
          LEFT JOIN sensor_devices d ON d.sensor_code = e.sensor_code
          LEFT JOIN farms f ON f.id = d.farm_id
          LEFT JOIN zones z ON z.id = d.zone_id
         WHERE d.id IS NULL
            OR f.description IS DISTINCT FROM seed_key || ' | farm'
            OR d.serial_number IS DISTINCT FROM e.serial_number
            OR d.device_name IS DISTINCT FROM e.device_name
            OR z.name IS DISTINCT FROM e.zone_name
    ) THEN
        RAISE EXCEPTION 'GeoPulse demo seed stopped: a DEMO device does not match the expected marker, farm, or zone.';
    END IF;
END $$;

/* Six readings per device: five historical readings plus sample 6, the newest for latestOfMany(). */
WITH reading_seed (
    sensor_code,
    latest_soil_moisture,
    latest_soil_temperature,
    latest_air_temperature,
    latest_humidity,
    latest_ph,
    latest_nitrogen,
    latest_phosphorus,
    latest_potassium,
    latest_status,
    latest_offset
) AS (
    VALUES
        ('DEMO-001'::text, 62::double precision, 28.1::double precision, 30.2::double precision, 72::double precision, 6.5::double precision, 44::bigint, 24::bigint, 58::bigint, 'normal'::text,   interval '2 minutes'),
        ('DEMO-002',       60::double precision, 27.8::double precision, 29.9::double precision, 70::double precision, 6.6::double precision, 41::bigint, 22::bigint, 54::bigint, 'normal',         interval '4 minutes'),
        ('DEMO-003',       24::double precision, 29.0::double precision, 31.3::double precision, 61::double precision, 6.2::double precision, 30::bigint, 18::bigint, 38::bigint, 'warning',        interval '6 minutes'),
        ('DEMO-004',       28::double precision, 28.7::double precision, 31.0::double precision, 63::double precision, 6.3::double precision, 31::bigint, 18::bigint, 40::bigint, 'warning',        interval '8 minutes'),
        ('DEMO-005',       46::double precision, 28.9::double precision, 31.5::double precision, 65::double precision, 5.1::double precision, 16::bigint, 10::bigint, 20::bigint, 'critical',       interval '5 minutes'),
        ('DEMO-006',       49::double precision, 28.4::double precision, 30.8::double precision, 66::double precision, 5.4::double precision, 18::bigint, 11::bigint, 22::bigint, 'critical',       interval '7 minutes'),
        ('DEMO-007',       35::double precision, 28.0::double precision, 30.0::double precision, 68::double precision, 6.2::double precision, 32::bigint, 19::bigint, 42::bigint, 'warning',        interval '26 hours'),
        ('DEMO-008',       39::double precision, 27.7::double precision, 29.5::double precision, 70::double precision, 6.4::double precision, 35::bigint, 20::bigint, 44::bigint, 'warning',        interval '2 days')
),
sample_seed (sample_number, historical_offset) AS (
    VALUES
        (1::integer, interval '13 days'),
        (2::integer, interval '10 days'),
        (3::integer, interval '7 days'),
        (4::integer, interval '4 days'),
        (5::integer, interval '2 days'),
        (6::integer, interval '0 seconds')
),
reading_payload AS (
    SELECT
        d.id AS sensor_id,
        r.sensor_code,
        s.sample_number,
        CASE
            WHEN s.sample_number = 6 THEN r.latest_soil_moisture
            ELSE r.latest_soil_moisture + ((7 - s.sample_number) * 1.2)
        END AS soil_moisture,
        CASE
            WHEN s.sample_number = 6 THEN r.latest_soil_temperature
            ELSE r.latest_soil_temperature - ((7 - s.sample_number) * 0.15)
        END AS soil_temperature,
        CASE
            WHEN s.sample_number = 6 THEN r.latest_air_temperature
            ELSE r.latest_air_temperature - ((7 - s.sample_number) * 0.10)
        END AS air_temperature,
        CASE
            WHEN s.sample_number = 6 THEN r.latest_humidity
            ELSE r.latest_humidity + ((7 - s.sample_number) * 0.8)
        END AS humidity,
        CASE
            WHEN s.sample_number = 6 THEN r.latest_ph
            WHEN r.sensor_code IN ('DEMO-005', 'DEMO-006') THEN r.latest_ph + ((7 - s.sample_number) * 0.12)
            ELSE r.latest_ph - ((7 - s.sample_number) * 0.03)
        END AS ph,
        (r.latest_nitrogen + ((7 - s.sample_number) * 2))::bigint AS nitrogen,
        (r.latest_phosphorus + ((7 - s.sample_number) * 1))::bigint AS phosphorus,
        (r.latest_potassium + ((7 - s.sample_number) * 2))::bigint AS potassium,
        CASE WHEN s.sample_number = 6 THEN r.latest_status ELSE 'normal' END AS reading_status,
        CASE
            WHEN s.sample_number = 6 THEN current_timestamp - r.latest_offset
            ELSE current_timestamp - s.historical_offset
        END AS recorded_at
    FROM reading_seed r
    JOIN sensor_devices d ON d.sensor_code = r.sensor_code
    CROSS JOIN sample_seed s
)
INSERT INTO sensor_readings (
    sensor_id,
    soil_moisture,
    soil_temperature,
    air_temperature,
    humidity,
    ph,
    nitrogen,
    phosphorus,
    potassium,
    reading_status,
    data_source,
    is_valid,
    validation_notes,
    recorded_at,
    created_at
)
SELECT
    p.sensor_id,
    p.soil_moisture,
    p.soil_temperature,
    p.air_temperature,
    p.humidity,
    p.ph,
    p.nitrogen,
    p.phosphorus,
    p.potassium,
    p.reading_status,
    'sensor',
    true,
    'GeoPulse demo GIS seed v1 | reading | ' || p.sensor_code || ' | sample ' || p.sample_number,
    p.recorded_at,
    p.recorded_at
FROM reading_payload p
WHERE NOT EXISTS (
    SELECT 1
      FROM sensor_readings existing_reading
     WHERE existing_reading.sensor_id = p.sensor_id
       AND existing_reading.validation_notes = 'GeoPulse demo GIS seed v1 | reading | ' || p.sensor_code || ' | sample ' || p.sample_number
)
RETURNING id, sensor_id, recorded_at;

/* Alert data deliberately exercises the zone-status calculation: warning, critical, and inactive/offline. */
WITH latest_demo_readings AS (
    SELECT DISTINCT ON (d.id)
        d.id AS sensor_id,
        d.sensor_code,
        d.farm_id,
        r.id AS reading_id,
        r.soil_moisture,
        r.ph
      FROM sensor_devices d
      JOIN sensor_readings r ON r.sensor_id = d.id
      JOIN farms f ON f.id = d.farm_id
     WHERE f.description = 'GeoPulse demo GIS seed v1 | farm'
       AND d.sensor_code IN ('DEMO-003', 'DEMO-005', 'DEMO-007')
       AND r.validation_notes LIKE 'GeoPulse demo GIS seed v1 | reading | %'
     ORDER BY d.id, r.recorded_at DESC, r.id DESC
),
alert_seed (sensor_code, alert_type, severity, title, parameter_name, threshold_value, alert_status) AS (
    VALUES
        ('DEMO-003'::text, 'low_soil_moisture'::text, 'warning'::text,  'Low soil moisture in Demo Zone B'::text, 'soil_moisture'::text, 30::double precision, 'unresolved'::text),
        ('DEMO-005',       'soil_ph_critical',         'critical',       'Critical soil pH in Demo Zone C',       'ph',                    5.5::double precision, 'unresolved'),
        ('DEMO-007',       'device_offline',           'info',           'Demo Zone D sensor is offline',          NULL::text,              NULL::double precision, 'acknowledged')
)
INSERT INTO alerts (
    farm_id,
    sensor_id,
    reading_id,
    alert_type,
    severity,
    title,
    message,
    parameter_name,
    parameter_value,
    threshold_value,
    status,
    acknowledged_at,
    created_at,
    updated_at
)
SELECT
    r.farm_id,
    r.sensor_id,
    r.reading_id,
    a.alert_type,
    a.severity,
    a.title,
    'GeoPulse demo GIS seed v1 | alert | ' || a.sensor_code || ' | ' || a.alert_type,
    a.parameter_name,
    CASE a.parameter_name
        WHEN 'soil_moisture' THEN r.soil_moisture
        WHEN 'ph' THEN r.ph
        ELSE NULL
    END,
    a.threshold_value,
    a.alert_status,
    CASE WHEN a.alert_status = 'acknowledged' THEN current_timestamp ELSE NULL END,
    current_timestamp,
    current_timestamp
FROM alert_seed a
JOIN latest_demo_readings r ON r.sensor_code = a.sensor_code
WHERE NOT EXISTS (
    SELECT 1
      FROM alerts existing_alert
     WHERE existing_alert.sensor_id = r.sensor_id
       AND existing_alert.message = 'GeoPulse demo GIS seed v1 | alert | ' || a.sensor_code || ' | ' || a.alert_type
)
RETURNING id, sensor_id, severity, status;

/* One crop prediction for the newest reading from each demo sensor. */
WITH latest_demo_readings AS (
    SELECT DISTINCT ON (d.id)
        d.id AS sensor_id,
        d.sensor_code,
        d.farm_id,
        r.id AS reading_id
      FROM sensor_devices d
      JOIN sensor_readings r ON r.sensor_id = d.id
      JOIN farms f ON f.id = d.farm_id
     WHERE f.description = 'GeoPulse demo GIS seed v1 | farm'
       AND d.sensor_code LIKE 'DEMO-%'
       AND r.validation_notes LIKE 'GeoPulse demo GIS seed v1 | reading | %'
     ORDER BY d.id, r.recorded_at DESC, r.id DESC
),
prediction_seed (sensor_code, best_crop, confidence_score, recommendations, alternative_crops) AS (
    VALUES
        ('DEMO-001'::text, 'Tomato'::text,   91.2::double precision, '["Maintain soil moisture between 55% and 65%.", "Continue the current drip-irrigation schedule."]'::jsonb, '["Eggplant", "Pechay"]'::jsonb),
        ('DEMO-002',       'Tomato',          89.4::double precision, '["Keep mulch in place to retain moisture.", "Monitor phosphorus before flowering."]'::jsonb, '["Eggplant", "Cabbage"]'::jsonb),
        ('DEMO-003',       'Eggplant',        78.1::double precision, '["Irrigate promptly; moisture is below the preferred range.", "Recheck the sensor after irrigation."]'::jsonb, '["Tomato", "Pechay"]'::jsonb),
        ('DEMO-004',       'Eggplant',        82.7::double precision, '["Maintain even irrigation across the bed.", "Apply compost before the next growth stage."]'::jsonb, '["Tomato", "Cabbage"]'::jsonb),
        ('DEMO-005',       'Cabbage',         71.3::double precision, '["Correct acidic soil before the next fertilizer application.", "Confirm pH after lime incorporation."]'::jsonb, '["Pechay", "Eggplant"]'::jsonb),
        ('DEMO-006',       'Cabbage',         73.5::double precision, '["Apply a staged soil-acidity correction.", "Maintain adequate potassium while pH is corrected."]'::jsonb, '["Pechay", "Tomato"]'::jsonb),
        ('DEMO-007',       'Pechay',          61.0::double precision, '["Reconnect the device before acting on this stale reading.", "Inspect the power supply and signal path."]'::jsonb, '["Cabbage", "Tomato"]'::jsonb),
        ('DEMO-008',       'Pechay',          59.6::double precision, '["Wait for a fresh sensor reading before changing the fertilizer plan.", "Schedule a device maintenance visit."]'::jsonb, '["Cabbage", "Eggplant"]'::jsonb)
)
INSERT INTO crop_predictions (
    reading_id,
    sensor_id,
    farm_id,
    best_crop,
    confidence_score,
    recommendations,
    alternative_crops,
    model_name,
    model_version,
    prediction_status,
    created_at
)
SELECT
    r.reading_id,
    r.sensor_id,
    r.farm_id,
    p.best_crop,
    p.confidence_score,
    p.recommendations,
    p.alternative_crops,
    'GeoPulse Demo Crop Model',
    '1.0-demo',
    'generated',
    current_timestamp
FROM prediction_seed p
JOIN latest_demo_readings r ON r.sensor_code = p.sensor_code
WHERE NOT EXISTS (
    SELECT 1
      FROM crop_predictions existing_prediction
     WHERE existing_prediction.reading_id = r.reading_id
       AND existing_prediction.model_name = 'GeoPulse Demo Crop Model'
       AND existing_prediction.model_version = '1.0-demo'
)
RETURNING id, reading_id, sensor_id;

/* Fertilizer predictions are linked to the matching demo crop prediction and newest reading. */
WITH latest_demo_context AS (
    SELECT DISTINCT ON (d.id)
        d.id AS sensor_id,
        d.sensor_code,
        d.farm_id,
        r.id AS reading_id,
        c.id AS crop_prediction_id,
        c.best_crop
      FROM sensor_devices d
      JOIN sensor_readings r ON r.sensor_id = d.id
      JOIN farms f ON f.id = d.farm_id
      JOIN crop_predictions c
        ON c.reading_id = r.id
       AND c.sensor_id = d.id
       AND c.model_name = 'GeoPulse Demo Crop Model'
       AND c.model_version = '1.0-demo'
     WHERE f.description = 'GeoPulse demo GIS seed v1 | farm'
       AND d.sensor_code LIKE 'DEMO-%'
       AND r.validation_notes LIKE 'GeoPulse demo GIS seed v1 | reading | %'
     ORDER BY d.id, r.recorded_at DESC, r.id DESC
),
fertilizer_seed (sensor_code, fertilizer_name, application_rate, application_unit, confidence_score, recommendations, alternative_fertilizers) AS (
    VALUES
        ('DEMO-001'::text, 'Balanced NPK 14-14-14'::text,       45::double precision,   'kg/ha'::text, 88.5::double precision, '["Apply in two light side-dressings.", "Keep fertilizer away from the stem base."]'::jsonb, '["Composted poultry manure"]'::jsonb),
        ('DEMO-002',       'Compost plus NPK 14-14-14',          40::double precision,   'kg/ha',       85.8::double precision, '["Incorporate compost before the next watering cycle.", "Use a light NPK side-dressing."]'::jsonb, '["Vermicompost"]'::jsonb),
        ('DEMO-003',       'Calcium nitrate',                    30::double precision,   'kg/ha',       76.0::double precision, '["Irrigate first, then apply a light side-dressing.", "Do not apply to dry soil."]'::jsonb, '["Balanced NPK 14-14-14"]'::jsonb),
        ('DEMO-004',       'Organic compost',                   500::double precision,   'kg/ha',       79.2::double precision, '["Incorporate evenly before the next irrigation.", "Recheck moisture after application."]'::jsonb, '["Vermicompost"]'::jsonb),
        ('DEMO-005',       'Agricultural lime',                1200::double precision,  'kg/ha',       84.0::double precision, '["Apply evenly and incorporate into the topsoil.", "Wait for a fresh pH reading before applying nitrogen fertilizer."]'::jsonb, '["Dolomitic lime"]'::jsonb),
        ('DEMO-006',       'Agricultural lime',                1000::double precision,  'kg/ha',       81.5::double precision, '["Use a staged application to correct pH gradually.", "Retest soil pH after incorporation."]'::jsonb, '["Dolomitic lime"]'::jsonb),
        ('DEMO-007',       'No application until device reconnects', 0::double precision,   'kg/ha',       60.0::double precision, '["Do not change fertilizer inputs using an offline device reading.", "Reconnect and validate the sensor first."]'::jsonb, '["Manual soil test"]'::jsonb),
        ('DEMO-008',       'No application until fresh reading',     0::double precision,   'kg/ha',       58.0::double precision, '["Complete device maintenance before applying fertilizer.", "Use a manual soil test if the outage continues."]'::jsonb, '["Manual soil test"]'::jsonb)
)
INSERT INTO fertilizer_predictions (
    crop_prediction_id,
    reading_id,
    sensor_id,
    farm_id,
    best_crop,
    best_fertilizer,
    application_rate,
    application_unit,
    confidence_score,
    recommendations,
    alternative_fertilizers,
    model_name,
    model_version,
    prediction_status,
    created_at
)
SELECT
    c.crop_prediction_id,
    c.reading_id,
    c.sensor_id,
    c.farm_id,
    c.best_crop,
    f.fertilizer_name,
    f.application_rate,
    f.application_unit,
    f.confidence_score,
    f.recommendations,
    f.alternative_fertilizers,
    'GeoPulse Demo Fertilizer Model',
    '1.0-demo',
    'generated',
    current_timestamp
FROM fertilizer_seed f
JOIN latest_demo_context c ON c.sensor_code = f.sensor_code
WHERE NOT EXISTS (
    SELECT 1
      FROM fertilizer_predictions existing_prediction
     WHERE existing_prediction.crop_prediction_id = c.crop_prediction_id
       AND existing_prediction.model_name = 'GeoPulse Demo Fertilizer Model'
       AND existing_prediction.model_version = '1.0-demo'
)
RETURNING id, crop_prediction_id, reading_id, sensor_id;

/* Lightweight confirmation output, strictly scoped to this marked demo dataset. */
WITH demo_farm AS (
    SELECT id
      FROM farms
     WHERE farm_name = 'GeoPulse Demo Farm'
       AND description = 'GeoPulse demo GIS seed v1 | farm'
),
demo_devices AS (
    SELECT d.id, d.farm_id
      FROM sensor_devices d
      JOIN demo_farm f ON f.id = d.farm_id
     WHERE (d.sensor_code, d.serial_number, d.device_name) IN (
        ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
        ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
        ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
        ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
        ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
        ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
        ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
        ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
     )
),
demo_readings AS (
    SELECT r.id, r.sensor_id
      FROM sensor_readings r
      JOIN demo_devices d ON d.id = r.sensor_id
     WHERE r.validation_notes LIKE 'GeoPulse demo GIS seed v1 | reading | %'
),
demo_crops AS (
    SELECT c.id
      FROM crop_predictions c
      JOIN demo_readings r ON r.id = c.reading_id
      JOIN demo_devices d ON d.id = c.sensor_id
     WHERE c.farm_id = d.farm_id
       AND c.model_name = 'GeoPulse Demo Crop Model'
       AND c.model_version = '1.0-demo'
)
SELECT
    (SELECT count(*) FROM demo_farm) AS demo_farms,
    (SELECT count(*) FROM zones z JOIN demo_farm f ON f.id = z.farm_id WHERE z.description LIKE 'GeoPulse demo GIS seed v1 | zone | %') AS demo_zones,
    (SELECT count(*) FROM demo_devices) AS demo_sensors,
    (SELECT count(*) FROM demo_readings) AS demo_readings,
    (SELECT count(*) FROM alerts a JOIN demo_devices d ON d.id = a.sensor_id WHERE a.farm_id = d.farm_id AND a.message LIKE 'GeoPulse demo GIS seed v1 | alert | %') AS demo_alerts,
    (SELECT count(*) FROM demo_crops) AS demo_crop_predictions,
    (SELECT count(*) FROM fertilizer_predictions fp JOIN demo_crops c ON c.id = fp.crop_prediction_id WHERE fp.model_name = 'GeoPulse Demo Fertilizer Model' AND fp.model_version = '1.0-demo') AS demo_fertilizer_predictions;

COMMIT;


/*
 =============================================================================
 ROLLBACK (COPY ONLY THE SQL FROM BEGIN; THROUGH COMMIT; BELOW, EXCLUDING THIS COMMENT)
 =============================================================================
 This rollback only removes rows bearing the exact GeoPulse demo markers above.
 It first refuses to run if a later non-demo row references demo data, avoiding
 accidental loss through the current cascade foreign keys.

 BEGIN;
 SET LOCAL lock_timeout = '5s';
 SET LOCAL statement_timeout = '30s';
 SET LOCAL search_path TO public, pg_catalog;
 SELECT pg_advisory_xact_lock(hashtextextended('geopulse-demo-gis-seed-v1', 0));
 LOCK TABLE farms, zones, sensor_devices, sensor_readings, alerts, crop_predictions, fertilizer_predictions, threshold_settings IN SHARE ROW EXCLUSIVE MODE;

 DO $$
 DECLARE
     seed_key constant text := 'GeoPulse demo GIS seed v1';
     demo_farm_count bigint;
     demo_zone_count bigint;
     distinct_demo_zone_count bigint;
     demo_device_count bigint;
     demo_reading_count bigint;
     distinct_demo_reading_count bigint;
     demo_alert_count bigint;
     distinct_demo_alert_count bigint;
     demo_crop_count bigint;
     distinct_demo_crop_reading_count bigint;
     demo_fertilizer_count bigint;
     distinct_demo_fertilizer_crop_count bigint;
 BEGIN
     WITH demo_farm AS (
         SELECT id
           FROM farms
          WHERE farm_name = 'GeoPulse Demo Farm'
            AND description = seed_key || ' | farm'
     ),
     demo_zones AS (
         SELECT z.id, z.description
           FROM zones z
           JOIN demo_farm f ON f.id = z.farm_id
          WHERE z.description LIKE seed_key || ' | zone | %'
     ),
     demo_devices AS (
         SELECT d.id, d.farm_id
           FROM sensor_devices d
           JOIN demo_farm f ON f.id = d.farm_id
          WHERE (d.sensor_code, d.serial_number, d.device_name) IN (
              ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
              ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
              ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
              ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
              ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
              ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
              ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
              ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
          )
     ),
     demo_readings AS (
         SELECT r.id, r.sensor_id, r.validation_notes
           FROM sensor_readings r
           JOIN demo_devices d ON d.id = r.sensor_id
          WHERE r.validation_notes ~ '^GeoPulse demo GIS seed v1 \| reading \| DEMO-00[1-8] \| sample [1-6]$'
     ),
     demo_alerts AS (
         SELECT a.id, a.message
           FROM alerts a
           JOIN demo_devices d ON d.id = a.sensor_id AND d.farm_id = a.farm_id
           JOIN demo_readings r ON r.id = a.reading_id AND r.sensor_id = d.id
          WHERE a.message IN (
              seed_key || ' | alert | DEMO-003 | low_soil_moisture',
              seed_key || ' | alert | DEMO-005 | soil_ph_critical',
              seed_key || ' | alert | DEMO-007 | device_offline'
          )
     ),
     demo_crops AS (
         SELECT c.id, c.reading_id, c.sensor_id, c.farm_id
           FROM crop_predictions c
           JOIN demo_devices d ON d.id = c.sensor_id AND d.farm_id = c.farm_id
           JOIN demo_readings r ON r.id = c.reading_id AND r.sensor_id = d.id
          WHERE c.model_name = 'GeoPulse Demo Crop Model'
            AND c.model_version = '1.0-demo'
     ),
     demo_fertilizers AS (
         SELECT fp.id, fp.crop_prediction_id
           FROM fertilizer_predictions fp
           JOIN demo_crops c
             ON c.id = fp.crop_prediction_id
            AND c.reading_id = fp.reading_id
            AND c.sensor_id = fp.sensor_id
            AND c.farm_id = fp.farm_id
          WHERE fp.model_name = 'GeoPulse Demo Fertilizer Model'
            AND fp.model_version = '1.0-demo'
     )
     SELECT
         (SELECT count(*) FROM demo_farm),
         (SELECT count(*) FROM demo_zones),
         (SELECT count(DISTINCT description) FROM demo_zones),
         (SELECT count(*) FROM demo_devices),
         (SELECT count(*) FROM demo_readings),
         (SELECT count(DISTINCT validation_notes) FROM demo_readings),
         (SELECT count(*) FROM demo_alerts),
         (SELECT count(DISTINCT message) FROM demo_alerts),
         (SELECT count(*) FROM demo_crops),
         (SELECT count(DISTINCT reading_id) FROM demo_crops),
         (SELECT count(*) FROM demo_fertilizers),
         (SELECT count(DISTINCT crop_prediction_id) FROM demo_fertilizers)
       INTO demo_farm_count,
            demo_zone_count,
            distinct_demo_zone_count,
            demo_device_count,
            demo_reading_count,
            distinct_demo_reading_count,
            demo_alert_count,
            distinct_demo_alert_count,
            demo_crop_count,
            distinct_demo_crop_reading_count,
            demo_fertilizer_count,
            distinct_demo_fertilizer_crop_count;

     IF demo_farm_count IS DISTINCT FROM 1
        OR demo_zone_count IS DISTINCT FROM 4
        OR distinct_demo_zone_count IS DISTINCT FROM 4
        OR demo_device_count IS DISTINCT FROM 8
        OR demo_reading_count IS DISTINCT FROM 48
        OR distinct_demo_reading_count IS DISTINCT FROM 48
        OR demo_alert_count IS DISTINCT FROM 3
        OR distinct_demo_alert_count IS DISTINCT FROM 3
        OR demo_crop_count IS DISTINCT FROM 8
        OR distinct_demo_crop_reading_count IS DISTINCT FROM 8
        OR demo_fertilizer_count IS DISTINCT FROM 8
        OR distinct_demo_fertilizer_crop_count IS DISTINCT FROM 8 THEN
         RAISE EXCEPTION 'Rollback stopped: demo row counts or markers are inconsistent. Review manually instead of deleting.';
     END IF;

     IF EXISTS (
         SELECT 1
           FROM threshold_settings t
          WHERE t.farm_id IN (SELECT id FROM farms WHERE description = seed_key || ' | farm')
             OR t.sensor_id IN (
                 SELECT d.id
                   FROM sensor_devices d
                   JOIN farms f ON f.id = d.farm_id
                  WHERE f.description = seed_key || ' | farm'
                    AND (d.sensor_code, d.serial_number, d.device_name) IN (
                        ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
                        ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
                        ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
                        ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
                        ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
                        ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
                        ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
                        ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
                    )
             )
     ) THEN
         RAISE EXCEPTION 'Rollback stopped: threshold_settings now references demo data. Review it manually before deleting the demo.';
     END IF;

     IF EXISTS (
         SELECT 1
           FROM sensor_readings r
          WHERE r.sensor_id IN (
                  SELECT d.id
                  FROM sensor_devices d
                   JOIN farms f ON f.id = d.farm_id
                  WHERE f.description = seed_key || ' | farm'
                    AND (d.sensor_code, d.serial_number, d.device_name) IN (
                        ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
                        ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
                        ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
                        ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
                        ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
                        ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
                        ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
                        ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
                    )
                )
            AND NOT COALESCE(r.validation_notes ~ '^GeoPulse demo GIS seed v1 \| reading \| DEMO-00[1-8] \| sample [1-6]$', false)
     ) THEN
         RAISE EXCEPTION 'Rollback stopped: a non-demo sensor reading references a demo device.';
     END IF;

     IF EXISTS (
         SELECT 1
           FROM alerts a
          WHERE (
                    a.farm_id IN (SELECT id FROM farms WHERE description = seed_key || ' | farm')
                 OR a.sensor_id IN (
                        SELECT d.id
                          FROM sensor_devices d
                          JOIN farms f ON f.id = d.farm_id
                         WHERE f.description = seed_key || ' | farm'
                           AND (d.sensor_code, d.serial_number, d.device_name) IN (
                               ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
                               ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
                               ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
                               ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
                               ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
                               ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
                               ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
                               ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
                           )
                    )
                 OR a.reading_id IN (
                        SELECT r.id
                          FROM sensor_readings r
                          JOIN sensor_devices d ON d.id = r.sensor_id
                          JOIN farms f ON f.id = d.farm_id
                         WHERE f.description = seed_key || ' | farm'
                           AND (d.sensor_code, d.serial_number, d.device_name) IN (
                               ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
                               ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
                               ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
                               ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
                               ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
                               ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
                               ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
                               ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
                           )
                           AND r.validation_notes ~ '^GeoPulse demo GIS seed v1 \| reading \| DEMO-00[1-8] \| sample [1-6]$'
                    )
                )
            AND a.message IS DISTINCT FROM seed_key || ' | alert | DEMO-003 | low_soil_moisture'
            AND a.message IS DISTINCT FROM seed_key || ' | alert | DEMO-005 | soil_ph_critical'
            AND a.message IS DISTINCT FROM seed_key || ' | alert | DEMO-007 | device_offline'
     ) THEN
         RAISE EXCEPTION 'Rollback stopped: a non-demo alert references demo data.';
     END IF;

     IF EXISTS (
         SELECT 1
           FROM crop_predictions c
          WHERE (
                    c.farm_id IN (SELECT id FROM farms WHERE description = seed_key || ' | farm')
                 OR c.sensor_id IN (
                        SELECT d.id
                          FROM sensor_devices d
                          JOIN farms f ON f.id = d.farm_id
                         WHERE f.description = seed_key || ' | farm'
                           AND (d.sensor_code, d.serial_number, d.device_name) IN (
                               ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
                               ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
                               ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
                               ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
                               ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
                               ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
                               ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
                               ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
                           )
                    )
                 OR c.reading_id IN (
                        SELECT r.id
                          FROM sensor_readings r
                          JOIN sensor_devices d ON d.id = r.sensor_id
                          JOIN farms f ON f.id = d.farm_id
                         WHERE f.description = seed_key || ' | farm'
                           AND (d.sensor_code, d.serial_number, d.device_name) IN (
                               ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
                               ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
                               ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
                               ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
                               ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
                               ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
                               ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
                               ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
                           )
                           AND r.validation_notes LIKE seed_key || ' | reading | %'
                    )
                )
            AND (
                c.model_name IS DISTINCT FROM 'GeoPulse Demo Crop Model'
                OR c.model_version IS DISTINCT FROM '1.0-demo'
            )
     ) THEN
         RAISE EXCEPTION 'Rollback stopped: a non-demo crop prediction references demo data.';
     END IF;

     IF EXISTS (
         SELECT 1
           FROM fertilizer_predictions fp
          WHERE (
                    fp.farm_id IN (SELECT id FROM farms WHERE description = seed_key || ' | farm')
                 OR fp.sensor_id IN (
                        SELECT d.id
                          FROM sensor_devices d
                          JOIN farms f ON f.id = d.farm_id
                         WHERE f.description = seed_key || ' | farm'
                           AND (d.sensor_code, d.serial_number, d.device_name) IN (
                               ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
                               ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
                               ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
                               ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
                               ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
                               ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
                               ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
                               ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
                           )
                    )
                 OR fp.reading_id IN (
                        SELECT r.id
                          FROM sensor_readings r
                          JOIN sensor_devices d ON d.id = r.sensor_id
                          JOIN farms f ON f.id = d.farm_id
                         WHERE f.description = seed_key || ' | farm'
                           AND (d.sensor_code, d.serial_number, d.device_name) IN (
                               ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
                               ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
                               ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
                               ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
                               ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
                               ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
                               ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
                               ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
                           )
                           AND r.validation_notes LIKE seed_key || ' | reading | %'
                    )
                 OR fp.crop_prediction_id IN (
                        SELECT c.id
                          FROM crop_predictions c
                          JOIN sensor_devices d ON d.id = c.sensor_id
                          JOIN sensor_readings r ON r.id = c.reading_id AND r.sensor_id = d.id
                          JOIN farms f ON f.id = c.farm_id AND f.id = d.farm_id
                         WHERE f.description = seed_key || ' | farm'
                           AND (d.sensor_code, d.serial_number, d.device_name) IN (
                               ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
                               ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
                               ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
                               ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
                               ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
                               ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
                               ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
                               ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
                           )
                           AND r.validation_notes LIKE seed_key || ' | reading | %'
                           AND c.model_name = 'GeoPulse Demo Crop Model'
                           AND c.model_version = '1.0-demo'
                    )
                )
            AND (
                fp.model_name IS DISTINCT FROM 'GeoPulse Demo Fertilizer Model'
                OR fp.model_version IS DISTINCT FROM '1.0-demo'
            )
     ) THEN
         RAISE EXCEPTION 'Rollback stopped: a non-demo fertilizer prediction references demo data.';
     END IF;

     IF EXISTS (
         SELECT 1
           FROM sensor_devices d
          WHERE d.zone_id IN (
                    SELECT z.id
                      FROM zones z
                      JOIN farms f ON f.id = z.farm_id
                     WHERE f.description = seed_key || ' | farm'
                       AND z.description LIKE seed_key || ' | zone | %'
                )
            AND NOT EXISTS (
                SELECT 1
                  FROM (
                        VALUES
                            ('DEMO-001'::text, 'GP-DEMO-GIS-V1-001'::text, 'GeoPulse Demo Soil Sensor DEMO-001'::text),
                            ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
                            ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
                            ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
                            ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
                            ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
                            ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
                            ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
                  ) AS expected(sensor_code, serial_number, device_name)
                 WHERE d.sensor_code = expected.sensor_code
                   AND d.serial_number = expected.serial_number
                   AND d.device_name = expected.device_name
            )
     ) THEN
         RAISE EXCEPTION 'Rollback stopped: a non-demo device is assigned to a demo zone.';
     END IF;

     IF EXISTS (
         SELECT 1
           FROM zones z
          WHERE z.farm_id IN (SELECT id FROM farms WHERE description = seed_key || ' | farm')
            AND NOT EXISTS (
                SELECT 1
                  FROM (
                        VALUES
                            ('GeoPulse demo GIS seed v1 | zone | Demo Zone A — Tomato'::text),
                            ('GeoPulse demo GIS seed v1 | zone | Demo Zone B — Eggplant'),
                            ('GeoPulse demo GIS seed v1 | zone | Demo Zone C — Cabbage'),
                            ('GeoPulse demo GIS seed v1 | zone | Demo Zone D — Pechay')
                  ) AS expected(description)
                 WHERE z.description = expected.description
            )
     ) THEN
         RAISE EXCEPTION 'Rollback stopped: a non-demo zone belongs to the demo farm.';
     END IF;

     IF EXISTS (
         SELECT 1
           FROM sensor_devices d
          WHERE d.farm_id IN (SELECT id FROM farms WHERE description = seed_key || ' | farm')
            AND NOT EXISTS (
                SELECT 1
                  FROM (
                        VALUES
                            ('DEMO-001'::text, 'GP-DEMO-GIS-V1-001'::text, 'GeoPulse Demo Soil Sensor DEMO-001'::text),
                            ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
                            ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
                            ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
                            ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
                            ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
                            ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
                            ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
                  ) AS expected(sensor_code, serial_number, device_name)
                 WHERE d.sensor_code = expected.sensor_code
                   AND d.serial_number = expected.serial_number
                   AND d.device_name = expected.device_name
            )
     ) THEN
         RAISE EXCEPTION 'Rollback stopped: a non-demo device belongs to the demo farm.';
     END IF;
 END $$;

 WITH demo_farm AS (
     SELECT id
       FROM farms
      WHERE farm_name = 'GeoPulse Demo Farm'
        AND description = 'GeoPulse demo GIS seed v1 | farm'
 ),
 demo_devices AS (
     SELECT d.id, d.farm_id
       FROM sensor_devices d
       JOIN demo_farm f ON f.id = d.farm_id
      WHERE (d.sensor_code, d.serial_number, d.device_name) IN (
          ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
          ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
          ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
          ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
          ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
          ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
          ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
          ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
      )
 ),
 demo_readings AS (
     SELECT r.id, r.sensor_id
       FROM sensor_readings r
       JOIN demo_devices d ON d.id = r.sensor_id
      WHERE r.validation_notes LIKE 'GeoPulse demo GIS seed v1 | reading | %'
 ),
 demo_crops AS (
     SELECT c.id, c.reading_id, c.sensor_id, c.farm_id
       FROM crop_predictions c
       JOIN demo_readings r ON r.id = c.reading_id
       JOIN demo_devices d ON d.id = c.sensor_id
      WHERE c.farm_id = d.farm_id
        AND c.model_name = 'GeoPulse Demo Crop Model'
        AND c.model_version = '1.0-demo'
 )
 DELETE FROM fertilizer_predictions fp
 USING demo_crops c
 WHERE fp.crop_prediction_id = c.id
   AND fp.reading_id = c.reading_id
   AND fp.sensor_id = c.sensor_id
   AND fp.farm_id = c.farm_id
   AND fp.model_name = 'GeoPulse Demo Fertilizer Model'
   AND fp.model_version = '1.0-demo';

 WITH demo_farm AS (
     SELECT id
       FROM farms
      WHERE farm_name = 'GeoPulse Demo Farm'
        AND description = 'GeoPulse demo GIS seed v1 | farm'
 ),
 demo_devices AS (
     SELECT d.id, d.farm_id
       FROM sensor_devices d
       JOIN demo_farm f ON f.id = d.farm_id
      WHERE (d.sensor_code, d.serial_number, d.device_name) IN (
          ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
          ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
          ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
          ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
          ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
          ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
          ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
          ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
      )
 ),
 demo_readings AS (
     SELECT r.id, r.sensor_id
       FROM sensor_readings r
       JOIN demo_devices d ON d.id = r.sensor_id
      WHERE r.validation_notes LIKE 'GeoPulse demo GIS seed v1 | reading | %'
 )
 DELETE FROM crop_predictions c
 USING demo_devices d, demo_readings r
 WHERE c.sensor_id = d.id
   AND c.reading_id = r.id
   AND r.sensor_id = d.id
   AND c.farm_id = d.farm_id
   AND c.model_name = 'GeoPulse Demo Crop Model'
   AND c.model_version = '1.0-demo';

 WITH demo_farm AS (
     SELECT id
       FROM farms
      WHERE farm_name = 'GeoPulse Demo Farm'
        AND description = 'GeoPulse demo GIS seed v1 | farm'
 ),
 demo_devices AS (
     SELECT d.id, d.farm_id
       FROM sensor_devices d
       JOIN demo_farm f ON f.id = d.farm_id
      WHERE (d.sensor_code, d.serial_number, d.device_name) IN (
          ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
          ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
          ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
          ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
          ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
          ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
          ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
          ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
      )
 ),
 demo_readings AS (
     SELECT r.id, r.sensor_id
       FROM sensor_readings r
       JOIN demo_devices d ON d.id = r.sensor_id
      WHERE r.validation_notes LIKE 'GeoPulse demo GIS seed v1 | reading | %'
 )
 DELETE FROM alerts a
 USING demo_devices d, demo_readings r
 WHERE a.farm_id = d.farm_id
   AND a.sensor_id = d.id
   AND a.reading_id = r.id
   AND r.sensor_id = d.id
   AND a.message LIKE 'GeoPulse demo GIS seed v1 | alert | %';

 WITH demo_farm AS (
     SELECT id
       FROM farms
      WHERE farm_name = 'GeoPulse Demo Farm'
        AND description = 'GeoPulse demo GIS seed v1 | farm'
 ),
 demo_devices AS (
     SELECT d.id
       FROM sensor_devices d
       JOIN demo_farm f ON f.id = d.farm_id
      WHERE (d.sensor_code, d.serial_number, d.device_name) IN (
          ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
          ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
          ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
          ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
          ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
          ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
          ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
          ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
      )
 )
 DELETE FROM sensor_readings r
 USING demo_devices d
 WHERE r.sensor_id = d.id
   AND r.validation_notes LIKE 'GeoPulse demo GIS seed v1 | reading | %';

 DELETE FROM sensor_devices d
 USING farms f
 WHERE d.farm_id = f.id
   AND f.farm_name = 'GeoPulse Demo Farm'
   AND f.description = 'GeoPulse demo GIS seed v1 | farm'
   AND (d.sensor_code, d.serial_number, d.device_name) IN (
      ('DEMO-001', 'GP-DEMO-GIS-V1-001', 'GeoPulse Demo Soil Sensor DEMO-001'),
      ('DEMO-002', 'GP-DEMO-GIS-V1-002', 'GeoPulse Demo Soil Sensor DEMO-002'),
      ('DEMO-003', 'GP-DEMO-GIS-V1-003', 'GeoPulse Demo Soil Sensor DEMO-003'),
      ('DEMO-004', 'GP-DEMO-GIS-V1-004', 'GeoPulse Demo Soil Sensor DEMO-004'),
      ('DEMO-005', 'GP-DEMO-GIS-V1-005', 'GeoPulse Demo Soil Sensor DEMO-005'),
      ('DEMO-006', 'GP-DEMO-GIS-V1-006', 'GeoPulse Demo Soil Sensor DEMO-006'),
      ('DEMO-007', 'GP-DEMO-GIS-V1-007', 'GeoPulse Demo Soil Sensor DEMO-007'),
      ('DEMO-008', 'GP-DEMO-GIS-V1-008', 'GeoPulse Demo Soil Sensor DEMO-008')
  );

 DELETE FROM zones z
 USING farms f
 WHERE z.farm_id = f.id
   AND f.farm_name = 'GeoPulse Demo Farm'
   AND f.description = 'GeoPulse demo GIS seed v1 | farm'
   AND z.description IN (
      'GeoPulse demo GIS seed v1 | zone | Demo Zone A — Tomato',
      'GeoPulse demo GIS seed v1 | zone | Demo Zone B — Eggplant',
      'GeoPulse demo GIS seed v1 | zone | Demo Zone C — Cabbage',
      'GeoPulse demo GIS seed v1 | zone | Demo Zone D — Pechay'
  );

 DELETE FROM farms
  WHERE farm_name = 'GeoPulse Demo Farm'
    AND description = 'GeoPulse demo GIS seed v1 | farm';

 COMMIT;
*/
