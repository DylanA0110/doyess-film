import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, LogOut, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const instant = false;

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const initials = (user.user_metadata?.full_name ?? user.email ?? 'DF')
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[1.75rem] border border-border/70 bg-card/80 p-4 shadow-2xl shadow-black/40 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="ring-1 ring-white/10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Sesión activa</p>
              <h1 className="text-lg font-semibold tracking-tight">
                {user.user_metadata?.full_name ?? user.email}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary-foreground"
            >
              Supabase SSR
            </Badge>
            <Link
              href="/auth/logout"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/60 px-4 py-2 text-sm text-foreground transition hover:border-primary/40 hover:bg-primary/10"
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-border/70 bg-card/80 shadow-2xl shadow-black/30 backdrop-blur">
            <CardHeader>
              <Badge className="w-fit border border-primary/30 bg-primary/10 text-primary-foreground">
                Base lista
              </Badge>
              <CardTitle className="text-3xl">
                Doyess Film está listo para crecer
              </CardTitle>
              <CardDescription className="max-w-2xl text-base text-muted-foreground">
                La autenticación, la sesión SSR y el cache de cliente ya están
                conectados. El siguiente paso será conectar el importador CSV
                sobre esta base.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Auth
                  </p>
                  <p className="mt-2 text-xl font-semibold">Google OAuth</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Estado
                  </p>
                  <p className="mt-2 text-xl font-semibold">TanStack Query</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Color
                  </p>
                  <p className="mt-2 text-xl font-semibold">Cherry Noir</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-linear-to-b from-primary/20 to-card/80 shadow-2xl shadow-primary/10 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="size-5 text-primary" />
                Siguiente base
              </CardTitle>
              <CardDescription>
                Preparar el importador CSV como flujo principal sobre esta
                sesión.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-muted-foreground">Ruta segura</p>
                <p className="mt-1 font-medium">/dashboard</p>
              </div>
              <Link
                href="/auth/logout"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
              >
                Volver al login
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
