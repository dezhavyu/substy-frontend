"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/shared/api/errors";
import { routes } from "@/shared/lib/routes";
import { Button } from "@/shared/ui/button";
import { useLogoutMutation } from "@/features/auth/hooks";

export function LogoutButton(): JSX.Element {
  const router = useRouter();
  const logoutMutation = useLogoutMutation();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={logoutMutation.isPending}
      onClick={() => {
        logoutMutation.mutate(undefined, {
          onSuccess: () => {
            toast.success("Logged out");
            router.replace(routes.login);
          },
          onError: (error) => {
            const message = error instanceof ApiError ? error.message : "Logout failed";
            toast.error(message);
          }
        });
      }}
      data-testid="logout-button"
    >
      {logoutMutation.isPending ? "Signing out..." : "Logout"}
    </Button>
  );
}
