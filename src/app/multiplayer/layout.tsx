import { ReactNode } from "react";

interface MultiplayerLayoutProps {
  children: ReactNode;
}

export default function MultiplayerLayout({ children }: MultiplayerLayoutProps) {
  return <>{children}</>;
}
