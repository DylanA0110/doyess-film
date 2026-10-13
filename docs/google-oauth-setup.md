# Google OAuth con Supabase (mínimo)

Guía alineada con [Sign in with Google](https://supabase.com/docs/guides/auth/social-login/auth-google) y Next.js App Router.

## Checklist rápido

- [ ] Providers → Google **Enable** + credenciales guardadas
- [ ] Google Cloud → redirect URI `https://<project>.supabase.co/auth/v1/callback`
- [ ] Supabase → Redirect URLs incluye `http://localhost:3000/auth/callback`
- [ ] `.env` → `DEV_SKIP_AUTH=false` y `NEXT_PUBLIC_DEV_SKIP_AUTH=false`
- [ ] Reiniciar `pnpm dev` tras cambiar `.env`

## En la app (ya hecho)

1. Botón → `/auth/login` → Supabase → Google.
2. Vuelta → `GET /auth/callback?code=...` → sesión → `/dashboard`.

## 1. Supabase → Providers → Google (obligatorio)

Si ves `Unsupported provider: provider is not enabled` en el navegador, **este paso no está hecho**.

1. Abre [Supabase Dashboard](https://supabase.com/dashboard) → proyecto **bgcpskasucbrmhbdbwjj**.
2. **Authentication** → **Sign In / Providers** → **Google**.
3. Activa **Enable Sign in with Google**.
4. Pega **Client ID** y **Client Secret** (desde Google Cloud, paso 2).
5. Pulsa **Save**.

Sin el toggle Enable, la app redirige a authorize y Supabase responde JSON 400 (no es un bug del código).

## 2. Google Cloud → OAuth client (Web)

**Authorized redirect URIs** (solo Supabase):

```text
https://bgcpskasucbrmhbdbwjj.supabase.co/auth/v1/callback
```

(Sustituye por tu `NEXT_PUBLIC_SUPABASE_URL` + `/auth/v1/callback`.)

**No** pongas `http://localhost:3000/auth/callback` en Google.

Si la app está en **Testing**, añade tu Gmail como **Test user** en OAuth consent screen.

## 3. Supabase → Authentication → URL Configuration

| Campo | Valor |
|--------|--------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/auth/callback` |

Una sola línea, exacta, sin `/` final. Pulsa **Save**.

## 4. `.env`

```env
NEXT_PUBLIC_SUPABASE_URL=https://bgcpskasucbrmhbdbwjj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
DEV_SKIP_AUTH=false
NEXT_PUBLIC_DEV_SKIP_AUTH=false
```

**Importante:** si `DEV_SKIP_AUTH` o `NEXT_PUBLIC_DEV_SKIP_AUTH` están en `true`, la app **no** abre Google y entra directo al dashboard. Ambos deben ser `false` para probar OAuth.

Reinicia `pnpm dev` tras cambios.

## Comprobar que Supabase acepta Google

Sin sesión, una petición a authorize con `provider=google` no debe devolver `provider is not enabled`:

```bash
curl -s "https://bgcpskasucbrmhbdbwjj.supabase.co/auth/v1/authorize?provider=google" | head -c 200
```

- Si ves JSON con `Unsupported provider` → activa Google en Providers (paso 1).
- Si redirige o devuelve HTML/URL de login → el proveedor está habilitado.

## Probar en la app

1. `http://localhost:3000`
2. **Continuar con Google** (va a `/auth/login` en el servidor)
3. Cuenta de Google → `/auth/callback?code=...` → `/dashboard`
4. Sesión: `GET http://localhost:3000/api/auth/session` → `{ "authenticated": true, "email": "..." }`

Si falla, la home mostrará un aviso según `?error=` (`google_disabled`, `missing-code`, `exchange`, etc.).
