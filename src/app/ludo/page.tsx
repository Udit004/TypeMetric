import GodotGame from "@/features/ludo/components/GodotGame";
import { ProtectRoute } from "@/share/components/protect-route";

export default function PlayPage() {
  return (
    <ProtectRoute redirectTo="/">
      <main className="w-full h-screen flex items-center justify-center">
        <GodotGame />
      </main>
    </ProtectRoute>
  );
}


