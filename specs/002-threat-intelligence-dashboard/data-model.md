# Data Model: Threat Intelligence Dashboard

Entities derived from spec:

- Feed
  - id: string (feed identifier)
  - name: string
  - source_url: string
  - fetch_schedule: string (cron or human readable)
  - parser: string (reference to parser name)

- Indicator (single normalized record)
  - id: objectId
  - type: string (e.g., ip, domain, hash)
  - value: string
  - first_seen: datetime
  - last_seen: datetime
  - sources: [ { feed_id, original_id, fetched_at } ]
  - metadata: object (free-form additional fields)

- Event (raw payload wrapper)
  - id: objectId
  - feed_id: string
  - raw_payload: object
  - parsed_indicators: [indicator refs]
  - ingested_at: datetime

Indexes & queries (suggested):
- indicators: index on (type, value) for search
- indicators: TTL index on `last_seen` or periodic job for retention (90 days)
- events: index on feed_id, ingested_at

Normalization rules (summary):
- IPs: canonicalize to dotted quad; include as `type: ip`
- Domains: lowercase, punycode normalized
- Hashes: store type of hash (md5/sha1/sha256) and lowercase hex

Validation rules:
- `value` MUST be present and non-empty
- `type` MUST be one of [ip, domain, hash, other]
