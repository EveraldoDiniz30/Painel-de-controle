"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PERIOD_OPTIONS, type PeriodKey } from "@/lib/period";
import { Select, Input } from "@/components/ui/input";

export function PeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const period = (searchParams.get("period") as PeriodKey) ?? "mes-atual";

  function update(params: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        className="w-auto"
        value={period}
        onChange={(e) => update({ period: e.target.value })}
      >
        {PERIOD_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>

      {period === "personalizado" && (
        <>
          <Input
            type="date"
            className="w-auto"
            defaultValue={searchParams.get("from") ?? ""}
            onChange={(e) => update({ from: e.target.value })}
          />
          <span className="text-sm text-muted">até</span>
          <Input
            type="date"
            className="w-auto"
            defaultValue={searchParams.get("to") ?? ""}
            onChange={(e) => update({ to: e.target.value })}
          />
        </>
      )}
    </div>
  );
}
