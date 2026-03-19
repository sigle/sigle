"use client";

import { Select } from "@radix-ui/themes";
import { usePathname, useRouter } from "next/navigation";
import { AuthProtect } from "@/components/Auth/AuthProtect";
import { NextLink } from "@/components/Shared/NextLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { sigleApiClient } from "@/lib/sigle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { data: userWhitelist } = sigleApiClient.useQuery(
    "get",
    "/api/protected/user/whitelisted",
  );

  const navigationLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    ...(userWhitelist?.whitelisted
      ? [
          {
            label: "Drafts",
            href: "/dashboard/drafts",
          },
        ]
      : []),
    {
      label: "Settings",
      href: "/dashboard/settings",
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="relative">
        <aside className="absolute inset-y-0 left-[-200px] hidden w-[150px] lg:block">
          <nav className="sticky top-(--header-height) py-10">
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Button
                    variant="ghost"
                    className={cn("m-0 w-full justify-start", {
                      "bg-muted": pathname === link.href,
                    })}
                    nativeButton={false}
                    render={<NextLink href={link.href} />}
                  >
                    {link.label}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile navigation */}
        <Select.Root value={pathname} onValueChange={handleNavigation}>
          <Select.Trigger variant="surface" className="mt-5 w-full lg:hidden" />
          <Select.Content>
            {navigationLinks.map((link) => (
              <Select.Item key={link.href} value={link.href}>
                {link.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <AuthProtect>{children}</AuthProtect>
      </div>
    </div>
  );
}
