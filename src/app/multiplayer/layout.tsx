import { ReactNode } from "react";

import { ProtectRoute } from "@/share/components/protect-route";

interface MultiplayerLayoutProps {
  children: ReactNode;
}

export default function MultiplayerLayout({ children }: MultiplayerLayoutProps) {
  return <ProtectRoute>{children}</ProtectRoute>;
}
