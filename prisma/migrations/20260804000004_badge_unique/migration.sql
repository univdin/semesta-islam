-- Badge integrity: each (educator, badgeType) may exist exactly once.
-- Dedupe defensively before creating the unique index (there are currently no
-- duplicates in any environment, but re-verification could have produced them).

DELETE FROM credential_badges a
USING credential_badges b
WHERE a.id <> b.id
  AND a.educator_id = b.educator_id
  AND a.badge_type = b.badge_type;

CREATE UNIQUE INDEX credential_badges_educator_id_badge_type_key
  ON credential_badges (educator_id, badge_type);
