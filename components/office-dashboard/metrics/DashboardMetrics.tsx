import { MetricCard } from "./MetricCard";
import type { DashboardMetrics as DashboardMetricsData } from "@/services/office-dashboard/dashboard";

export function DashboardMetrics({
  metrics,
}: {
  metrics: DashboardMetricsData;
}) {
  const cards = [
    ["Leads hoje", metrics.leadsToday, "Recebidos no dia atual."],
    ["Últimos 7 dias", metrics.leadsLast7Days, "Leads recebidos no período."],
    ["Últimos 30 dias", metrics.leadsLast30Days, "Leads recebidos no período."],
    ["Novos", metrics.newLeads, "Status comercial novo."],
    ["Em análise", metrics.awaitingReview, "Aguardando avaliação interna."],
    ["Contato iniciado", metrics.contacted, "Atendimento já iniciado."],
    ["Convertidos", metrics.converted, "Status comercial convertido."],
    [
      "Revisão humana",
      metrics.requiresHumanReview,
      "Indicador operacional de triagem.",
    ],
    [
      "Notificações falhadas",
      metrics.failedNotifications,
      "Falhas recentes de entrega.",
    ],
  ] as const;

  return (
    <section
      aria-label="Métricas do painel"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {cards.map(([label, value, description]) => (
        <MetricCard
          description={description}
          key={label}
          label={label}
          value={value}
        />
      ))}
    </section>
  );
}
