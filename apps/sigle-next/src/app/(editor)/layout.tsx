'use client';

import { AuthProtect } from '@/components/Auth/AuthProtect';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProtect>{children}</AuthProtect>;
}
