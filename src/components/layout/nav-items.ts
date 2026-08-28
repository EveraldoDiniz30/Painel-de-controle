import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  HandCoins,
  Scale,
  FileText,
  MessagesSquare,
  Package,
  Link2,
  Percent,
  Megaphone,
  BarChart3,
  Bot,
  Zap,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  implemented: boolean;
  phase?: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Visão geral",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, implemented: true },
    ],
  },
  {
    title: "Sociedade",
    items: [
      { label: "Sócios", href: "/sociedade", icon: Users, implemented: true },
      { label: "Acerto entre sócios", href: "/acerto", icon: Scale, implemented: true },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { label: "Despesas", href: "/despesas", icon: ArrowUpCircle, implemented: true },
      { label: "Receitas", href: "/receitas", icon: ArrowDownCircle, implemented: true },
      { label: "Aportes", href: "/aportes", icon: HandCoins, implemented: true },
      { label: "Retiradas", href: "/retiradas", icon: Wallet, implemented: true },
      { label: "Meios de pagamento", href: "/meios-pagamento", icon: Wallet, implemented: true },
    ],
  },
  {
    title: "Documentos",
    items: [
      { label: "Documentos", href: "/documentos", icon: FileText, implemented: true },
    ],
  },
  {
    title: "Operação (próximas fases)",
    items: [
      { label: "Grupos de WhatsApp", href: "/em-breve/grupos", icon: MessagesSquare, implemented: false, phase: "Fase 8" },
      { label: "Produtos", href: "/em-breve/produtos", icon: Package, implemented: false, phase: "Fase 9" },
      { label: "Links de afiliados", href: "/em-breve/links", icon: Link2, implemented: false, phase: "Fase 9" },
      { label: "Comissões", href: "/em-breve/comissoes", icon: Percent, implemented: false, phase: "Fase 9" },
      { label: "Marketing", href: "/em-breve/marketing", icon: Megaphone, implemented: false, phase: "Fase 10" },
      { label: "Relatórios", href: "/em-breve/relatorios", icon: BarChart3, implemented: false, phase: "Fase 11" },
      { label: "MJ Assistant (IA)", href: "/em-breve/mj-assistant", icon: Bot, implemented: false, phase: "Fase 12" },
      { label: "Automações", href: "/em-breve/automacoes", icon: Zap, implemented: false, phase: "Fase 13" },
    ],
  },
];
