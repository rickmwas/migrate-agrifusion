-- Create chat_history table
create table if not exists chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  user_message text not null,
  bot_response text not null,
  created_at timestamptz default now()
);