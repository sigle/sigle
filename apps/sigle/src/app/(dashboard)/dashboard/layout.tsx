"use client";

import { usePathname, useRouter } from "next/navigation";
import { AuthProtect } from "@/components/Auth/AuthProtect";
import { NextLink } from "@/components/Shared/NextLink";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      label: "Published",
      href: "/dashboard/published",
    },
    {
      label: "Plan",
      href: "/dashboard/plan",
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
    },
  ];

  const handleNavigation = (href: string | null) => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="relative">
        <aside className="absolute inset-y-0 left-[-200px] hidden w-[150px] lg:block">
          <nav className="sticky top-(--header-height) py-12">
            <ul className="border-l border-border">
              {navigationLinks.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <li key={link.href}>
                    <NextLink
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "-ml-px block border-l py-1.5 pl-4 text-sm transition-colors",
                        isActive
                          ? "border-foreground font-medium text-foreground"
                          : "border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </NextLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Mobile navigation */}
        <Select
          items={navigationLinks.map((link) => ({
            value: link.href,
            label: link.label,
          }))}
          value={pathname}
          onValueChange={handleNavigation}
        >
          <SelectTrigger className="mt-5 w-full lg:hidden">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {navigationLinks.map((link) => (
                <SelectItem key={link.href} value={link.href}>
                  {link.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <AuthProtect>{children}</AuthProtect>
      </div>
    </div>
  );
}
