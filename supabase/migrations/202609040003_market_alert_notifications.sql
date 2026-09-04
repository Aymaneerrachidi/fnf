create or replace function public.trigger_my_market_alert(
  p_alert_id uuid,
  p_current_market_cap numeric
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  item public.token_alerts%rowtype;
  notification_id bigint;
begin
  select * into item
  from public.token_alerts
  where id = p_alert_id and user_id = auth.uid() and active = true
  for update;

  if item.id is null then return null; end if;
  if not ((item.direction = 'above' and p_current_market_cap >= item.threshold)
    or (item.direction = 'below' and p_current_market_cap <= item.threshold)) then
    return null;
  end if;

  insert into public.notifications (user_id, type, title, body, payload)
  values (
    auth.uid(),
    'market_alert',
    item.symbol || ' market-cap alert',
    item.symbol || ' crossed ' || item.direction || ' $' || item.threshold::text || ' MC.',
    jsonb_build_object(
      'alert_id', item.id,
      'network', item.network,
      'token_address', item.token_address,
      'current_market_cap', p_current_market_cap,
      'threshold', item.threshold,
      'direction', item.direction
    )
  ) returning id into notification_id;

  update public.token_alerts set active = false where id = item.id;
  return notification_id;
end;
$$;

revoke all on function public.trigger_my_market_alert(uuid, numeric) from public;
grant execute on function public.trigger_my_market_alert(uuid, numeric) to authenticated;
