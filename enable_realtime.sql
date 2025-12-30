-- Enable Realtime for Messaging Tables
-- REPLICA IDENTITY FULL ensures proper UPDATE/DELETE event payloads

ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;

-- Add to publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages, conversations;
