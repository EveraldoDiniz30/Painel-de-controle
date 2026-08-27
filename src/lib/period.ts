import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subDays,
} from "date-fns";

export type PeriodKey =
  | "hoje"
  | "7dias"
  | "mes-atual"
  | "mes-anterior"
  | "3meses"
  | "ano-atual"
  | "personalizado";

export const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "7dias", label: "Últimos 7 dias" },
  { value: "mes-atual", label: "Este mês" },
  { value: "mes-anterior", label: "Mês anterior" },
  { value: "3meses", label: "Últimos 3 meses" },
  { value: "ano-atual", label: "Este ano" },
  { value: "personalizado", label: "Período personalizado" },
];

export function getPeriodFromSearchParams(searchParams: {
  period?: string;
  from?: string;
  to?: string;
}): { key: PeriodKey; from: Date; to: Date } {
  const key = (searchParams.period as PeriodKey) || "mes-atual";
  const { from, to } = resolvePeriod(key, { from: searchParams.from, to: searchParams.to });
  return { key, from, to };
}

export function resolvePeriod(
  key: PeriodKey,
  custom?: { from?: string; to?: string }
): { from: Date; to: Date } {
  const now = new Date();

  switch (key) {
    case "hoje":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "7dias":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "mes-atual":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "mes-anterior": {
      const prev = subMonths(now, 1);
      return { from: startOfMonth(prev), to: endOfMonth(prev) };
    }
    case "3meses":
      return { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) };
    case "ano-atual":
      return { from: startOfYear(now), to: endOfYear(now) };
    case "personalizado":
      return {
        from: custom?.from ? startOfDay(new Date(custom.from)) : startOfMonth(now),
        to: custom?.to ? endOfDay(new Date(custom.to)) : endOfDay(now),
      };
    default:
      return { from: startOfMonth(now), to: endOfMonth(now) };
  }
}
