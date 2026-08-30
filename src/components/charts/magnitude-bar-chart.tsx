"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { SEQUENTIAL_BLUE, CATEGORICAL, CHART_INK } from "@/lib/chart-colors";
import { formatCurrency } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";

type Item = { label: string; value: number };

const currencyFormatter = (v: number) => formatCurrency(v).replace(/,00$/, "");
const integerFormatter = (v: number) => String(Math.round(v));

/**
 * Comparação de magnitude entre categorias (ex: despesas por categoria,
 * despesas por meio de pagamento, cliques por origem). Um único tom
 * (sequencial) por padrão; `categorical` usa a paleta fixa quando a
 * identidade de cada barra importa (ex: comparar os sócios ou origens).
 */
export function MagnitudeBarChart({
  data,
  emptyLabel = "Sem dados no período",
  categorical = false,
  valueType = "currency",
}: {
  data: Item[];
  emptyLabel?: string;
  categorical?: boolean;
  valueType?: "currency" | "count";
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-8 w-8" />}
        title={emptyLabel}
        description="Os dados aparecem aqui assim que houver lançamentos."
      />
    );
  }

  const formatValue = valueType === "count" ? integerFormatter : currencyFormatter;
  const height = Math.max(120, data.length * 40 + 40);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 24, bottom: 4, left: 4 }}
        barCategoryGap={10}
      >
        <CartesianGrid stroke={CHART_INK.grid} horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={valueType !== "count"}
          tick={{ fill: CHART_INK.muted, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatValue}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fill: CHART_INK.secondary, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={150}
        />
        <Tooltip
          formatter={(value) => formatValue(Number(value))}
          contentStyle={{ borderRadius: 12, border: `1px solid ${CHART_INK.grid}`, fontSize: 13 }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {data.map((entry, index) => (
            <Cell
              key={entry.label}
              fill={categorical ? CATEGORICAL[index % CATEGORICAL.length] : SEQUENTIAL_BLUE}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
