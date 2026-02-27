"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/shared/lib/routes";
import { cn } from "@/shared/lib/cn";

interface MainNavProps {
  role: "user" | "admin";
}

export function MainNav({ role }: MainNavProps): JSX.Element {
  const pathname = usePathname();

  const items: Array<{ href: string; label: string }> = [
    { href: routes.topics, label: "Topics" },
    { href: routes.preferences, label: "Preferences" },
    { href: routes.inbox, label: "Inbox" }
  ];

  if (role === "admin") {
    items.push({ href: routes.adminNotifications, label: "Admin" });
  }

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
