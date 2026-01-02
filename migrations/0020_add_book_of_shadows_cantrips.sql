-- Migration: Add book_of_shadows_cantrips column to characters table
-- For Warlock Pact of the Tome to store 3 selected cantrips
-- Date: 2026-01-02

ALTER TABLE characters
ADD COLUMN book_of_shadows_cantrips text[] DEFAULT '{}';

COMMENT ON COLUMN characters.book_of_shadows_cantrips IS 'Array of cantrip spell IDs for Warlocks with Pact of the Tome (Book of Shadows)';
