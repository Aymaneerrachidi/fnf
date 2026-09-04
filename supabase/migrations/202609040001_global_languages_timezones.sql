alter table public.trading_profiles
  drop constraint if exists trading_profiles_language_check,
  drop constraint if exists trading_profiles_market_hours_check;

alter table public.crews
  drop constraint if exists crews_language_check,
  drop constraint if exists crews_market_hours_check;

alter table public.trading_profiles
  add constraint trading_profiles_language_length check (char_length(language) between 2 and 80),
  add constraint trading_profiles_market_hours_length check (char_length(market_hours) between 2 and 80);

alter table public.crews
  add constraint crews_language_length check (char_length(language) between 2 and 80),
  add constraint crews_market_hours_length check (char_length(market_hours) between 2 and 80);
