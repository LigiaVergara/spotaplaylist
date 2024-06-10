"use client";

import { SessionProvider } from "next-auth/react";

export function SessionProviderWrapper({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}