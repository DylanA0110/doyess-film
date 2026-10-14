-- =============================================================================
-- Reiniciar película del día (pruebas en Supabase → SQL Editor)
-- =============================================================================
-- pick_date usa la fecha civil en America/Mexico_City (igual que la app).
-- Sustituye el UUID por el tuyo: Dashboard → Authentication → Users, o:
--   select id, email from auth.users;

-- Solo hoy (México)
delete from public.user_daily_picks
where user_id = 'TU_USER_UUID_AQUI'
  and pick_date = (timezone('America/Mexico_City', now()))::date;

-- Todas las fechas de un usuario
-- delete from public.user_daily_picks where user_id = 'TU_USER_UUID_AQUI';

-- Ver filas actuales
-- select * from public.user_daily_picks
-- where user_id = 'TU_USER_UUID_AQUI'
-- order by pick_date desc;
