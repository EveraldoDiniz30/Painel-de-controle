import { signOut } from "@/lib/auth";
import { LogOut } from "lucide-react";

export function Topbar({ userName }: { userName: string }) {
  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{userName}</p>
          <p className="text-xs text-muted">Sócio administrador</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
          {userName.charAt(0).toUpperCase()}
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-gray-100"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
