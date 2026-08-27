"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CATEGORICAL, CHART_INK } from "@/lib/chart-colors";
import { formatCurrency } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { LineChart as LineChartIcon } from "lucide-react";

type Point = { label: string; receita: number; despesa: number; resultado: number };

export function FinancialTrendChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<LineChartIcon className="h-8 w-8" />}
        title="Sem lançamentos no período"
        description="Registre receitas e despesas para ver a evolução financeira."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={CHART_INK.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: CHART_INK.muted, fontSize: 12 }}
          axisLine={{ stroke: CHART_INK.axis }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: CHART_INK.muted, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(v).replace(/,00$/, "")}
          width={80}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{ borderRadius: 12, border: `1px solid ${CHART_INK.grid}`, fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line
          type="monotone"
          dataKey="receita"
          name="Receita"
          stroke={CATEGORICAL[0]}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="despesa"
          name="Despesa"
          stroke={CATEGORICAL[1]}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="resultado"
          name="Resultado"
          stroke={CATEGORICAL[2]}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
