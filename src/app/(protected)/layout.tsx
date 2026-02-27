"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMeQuery } from "@/features/auth/hooks";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { routes } from "@/shared/lib/routes";
import { MainNav } from "@/shared/ui/main-nav";
import { Spinner } from "@/shared/ui/spinner";
import { Alert } from "@/shared/ui/alert";

export default function ProtectedLayout({ children }: { children: React.ReactNode }): JSX.Element {
  const router = useRouter();
  const meQuery = useMeQuery();

  useEffect(() => {
    if (meQuery.isError) {
      router.replace(routes.login);
    }
  }, [meQuery.isError, router]);

  if (meQuery.isPending) {
    return (
      <div className="mx-auto mt-8 w-full max-w-6xl px-4">
        <Spinner label="Checking session..." />
      </div>
    );
  }

  if (meQuery.isError || !meQuery.data) {
    return (
      <div className="mx-auto mt-8 w-full max-w-6xl px-4">
        <Alert variant="error" title="Session unavailable" description="Redirecting to login..." />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 py-6 md:px-6">
      <header className="rounded-xl border border-border/90 bg-card/95 p-4 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold tracking-tight">Notification Platform</p>
              <p className="text-xs text-muted-foreground">BFF API only · JWT via secure cookies</p>
            </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <MainNav role={meQuery.data.role} />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="pb-8">{children}</main>
    </div>
  );
}
