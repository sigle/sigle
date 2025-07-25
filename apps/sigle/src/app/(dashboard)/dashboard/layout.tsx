"use client";

import { Button, Container, Select } from "@radix-ui/themes";
import { usePathname, useRouter } from "next/navigation";
import { AuthProtect } from "@/components/Auth/AuthProtect";
import { NextLink } from "@/components/Shared/NextLink";
import { cn } from "@/lib/cn";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const navigationLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Drafts",
      href: "/dashboard/drafts",
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <Container size="3" className="px-4">
      <div className="relative">
        <aside className="absolute inset-y-0 left-[-200px] hidden w-[150px] lg:block">
          <nav className="sticky top-[var(--header-height)] py-10">
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Button
                    variant="ghost"
                    color="gray"
                    highContrast
                    className={cn("m-0", {
                      "bg-[var(--accent-a3)] font-medium":
                        pathname === link.href,
                    })}
                    asChild
                  >
                    <NextLink href={link.href}>{link.label}</NextLink>
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
    </Container>
  );
}
