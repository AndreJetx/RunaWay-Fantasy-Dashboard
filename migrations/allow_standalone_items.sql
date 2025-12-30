-- Allow items to exist without a campaign (for standalone characters)
ALTER TABLE items ALTER COLUMN campaign_id DROP NOT NULL;
