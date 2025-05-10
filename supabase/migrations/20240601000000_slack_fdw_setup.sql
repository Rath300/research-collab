-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS wrappers WITH SCHEMA extensions;

-- Create the Wasm foreign data wrapper
CREATE FOREIGN DATA WRAPPER wasm_wrapper
  HANDLER wasm_fdw_handler
  VALIDATOR wasm_fdw_validator;

-- Create a server connection to Slack
-- Note: Replace the placeholders with actual values before running
CREATE SERVER slack_server
  FOREIGN DATA WRAPPER wasm_wrapper
  OPTIONS (
    fdw_package_name 'supabase:slack-fdw',
    fdw_package_url 'https://github.com/supabase/wrappers/releases/download/wasm_slack_fdw_v0.1.0/slack_fdw.wasm',
    fdw_package_checksum '5b022b441c0007e31d792ecb1341bfffed1c29cb865eb0c7969989dff0e8fdc3',
    fdw_package_version '0.1.0'
    -- You'll need to add api_token or api_token_id here
  );

-- Create schema for Slack tables
CREATE SCHEMA IF NOT EXISTS slack;

-- Create foreign tables
CREATE FOREIGN TABLE slack.messages (
  ts text,
  user_id text,
  channel_id text,
  text text,
  thread_ts text,
  reply_count integer
)
  SERVER slack_server
  OPTIONS (
    resource 'messages'
  );

CREATE FOREIGN TABLE slack.channels (
  id text,
  name text,
  is_private boolean,
  created timestamp,
  creator text
)
SERVER slack_server
OPTIONS (
  resource 'channels'
);

CREATE FOREIGN TABLE slack.users (
  id text,
  name text,
  real_name text,
  display_name text,
  email text,
  is_admin boolean,
  is_bot boolean,
  status_text text,
  status_emoji text,
  image_192 text
)
SERVER slack_server
OPTIONS (
  resource 'users'
);

-- Create RLS policies for these tables
ALTER TABLE slack.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack.users ENABLE ROW LEVEL SECURITY;

-- Create basic policies (adjust as needed for your auth model)
CREATE POLICY "Allow authenticated access to messages" ON slack.messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated access to channels" ON slack.channels
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated access to users" ON slack.users
  FOR SELECT TO authenticated USING (true); 