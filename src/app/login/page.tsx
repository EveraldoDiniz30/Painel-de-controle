import { Suspense } from "react";
import { ShoppingBag } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--sidebar-bg)] p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">MJ Ofertas</h1>
          <p className="text-sm text-muted">Painel de gestão da sociedade</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
