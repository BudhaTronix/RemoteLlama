import { AppProvider } from "@/components/providers/app-provider";
import { AppShell } from "@/components/shell/app-shell";

export default function HomePage() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
