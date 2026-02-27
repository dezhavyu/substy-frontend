"use client";

import { PropsWithChildren, useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/shared/lib/routes";
import { useMeQuery } from "@/features/auth/hooks";

export function PublicOnly({ children }: PropsWithChildren): JSX.Element {
  const router = useRouter();
  const meQuery = useMeQuery();

  useEffect(() => {
    if (meQuery.data) {
      router.replace(routes.topics);
    }
  }, [meQuery.data, router]);

  return <>{children}</>;
}
