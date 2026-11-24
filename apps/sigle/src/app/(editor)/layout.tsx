"use client";

import { AuthProtect } from "@/components/Auth/AuthProtect";
import { PageEditorSkeleton } from "./p/new/loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProtect fallback={<PageEditorSkeleton />}>{children}</AuthProtect>
  );
}
