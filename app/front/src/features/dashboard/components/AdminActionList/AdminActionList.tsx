import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import type { AdminDashboard } from "@services/dashboard";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { DashboardSection, DashboardSectionEmpty } from "../DashboardSection";

interface AdminActionListProps {
	dashboard?: AdminDashboard;
	className?: string;
}

const linkClassName =
	"group mt-1 inline-flex items-center gap-1.5 self-start text-[0.8125rem] font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

const linkArrow = (
	<ArrowRight
		aria-hidden="true"
		className="size-3.5 transition-transform group-hover:translate-x-0.5"
	/>
);

const plural = (count: number, one: string, many: string) =>
	`${padCount(count)} ${count === 1 ? one : many}`;

interface ActionEntry {
	key: string;
	count: number;
	title: string;
	detail: string;
	link: ReactNode;
}

/** The manager's "Exige Ação": each pending count with the list that resolves it. */
export const AdminActionList = ({
	dashboard,
	className,
}: AdminActionListProps) => {
	const entries: ActionEntry[] = dashboard
		? [
				{
					key: "unassigned",
					count: dashboard.queue.unassigned,
					title: plural(
						dashboard.queue.unassigned,
						"projeto sem analista",
						"projetos sem analista",
					),
					detail: "Escolha o analista no cabeçalho de cada projeto.",
					link: (
						<Link
							to="/projetos"
							search={{ status: "UNDER_REVIEW", reviewer: "none" }}
							className={linkClassName}
						>
							Ver Projetos Sem Analista
							{linkArrow}
						</Link>
					),
				},
				{
					key: "overdue",
					count: dashboard.queue.overdue,
					title: plural(
						dashboard.queue.overdue,
						"análise atrasada",
						"análises atrasadas",
					),
					detail: "O prazo de 30 dias venceu sem decisão.",
					link: (
						<Link
							to="/projetos"
							search={{ status: "UNDER_REVIEW" }}
							className={linkClassName}
						>
							Ver Projetos em Análise
							{linkArrow}
						</Link>
					),
				},
				{
					key: "password",
					count: dashboard.users.mustChangePassword,
					title: plural(
						dashboard.users.mustChangePassword,
						"troca de senha pendente",
						"trocas de senha pendentes",
					),
					detail: "Ainda não trocaram a senha temporária.",
					link: (
						<Link
							to="/usuarios"
							search={{ mustChangePassword: true }}
							className={linkClassName}
						>
							Ver Usuários
							{linkArrow}
						</Link>
					),
				},
				{
					key: "without-access",
					count: dashboard.users.withoutAccess30Days,
					title: plural(
						dashboard.users.withoutAccess30Days,
						"conta sem acesso há mais de 30 dias",
						"contas sem acesso há mais de 30 dias",
					),
					detail: "Ativas, mas sem login no último mês.",
					link: (
						<Link
							to="/usuarios"
							search={{ status: "active", inactiveDays: 30 }}
							className={linkClassName}
						>
							Ver Usuários
							{linkArrow}
						</Link>
					),
				},
			].filter(({ count }) => count > 0)
		: [];

	return (
		<DashboardSection title="Exige Ação" className={className}>
			{!dashboard ? (
				<div className="flex flex-col gap-4 py-5">
					<Skeleton className="h-16 w-full" />
					<Skeleton className="h-16 w-full" />
				</div>
			) : entries.length === 0 ? (
				<DashboardSectionEmpty>
					Nada exige sua ação agora.
				</DashboardSectionEmpty>
			) : (
				<ul className="flex flex-col">
					{entries.map(({ key, title, detail, link }) => (
						<li
							key={key}
							className="border-b border-border py-5 last:border-b-0"
						>
							<div className="flex flex-col gap-2 border-l-2 border-attention pl-4">
								<span className="text-base font-medium">{title}</span>
								<span className="text-sm text-muted-foreground">{detail}</span>
								{link}
							</div>
						</li>
					))}
				</ul>
			)}
		</DashboardSection>
	);
};
