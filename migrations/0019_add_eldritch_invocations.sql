-- Migration: Add eldritch_invocations column to characters table
-- For Warlocks to store their selected Eldritch Invocations
-- Date: 2026-01-02

ALTER TABLE characters
ADD COLUMN eldritch_invocations text[] DEFAULT '{}';

COMMENT ON COLUMN characters.eldritch_invocations IS 'Array of Eldritch Invocation IDs for Warlock characters';
