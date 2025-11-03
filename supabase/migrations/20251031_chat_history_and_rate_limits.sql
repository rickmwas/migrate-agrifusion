create table if not exists chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  user_message text not null,
  bot_response text not null,
  created_at timestamptz default now()
);

-- Rate limiting table to track API usage
create table if not exists rate_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  endpoint text not null,
  calls_count integer default 1,
  first_call_at timestamptz default now(),
  last_call_at timestamptz default now(),
  constraint unique_user_endpoint unique (user_id, endpoint)
);

-- Function to check and update rate limits
create or replace function check_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_max_calls integer,
  p_window_minutes integer
) returns boolean
language plpgsql
security definer
as $$
declare
  v_rate_limit rate_limits;
  v_window_start timestamptz;
begin
  -- Set window start time
  v_window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Get or create rate limit record
  insert into rate_limits (user_id, endpoint)
  values (p_user_id, p_endpoint)
  on conflict (user_id, endpoint) do
  update set
    calls_count = case
      when rate_limits.first_call_at < v_window_start then 1
      else rate_limits.calls_count + 1
    end,
    first_call_at = case
      when rate_limits.first_call_at < v_window_start then now()
      else rate_limits.first_call_at
    end,
    last_call_at = now()
  returning * into v_rate_limit;

  -- Check if limit exceeded
  return v_rate_limit.calls_count <= p_max_calls;
end;
$$;