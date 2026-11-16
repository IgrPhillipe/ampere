import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { userRolePluralLabels } from "@features/users";
import { cn } from "@lib/utils";
import type { AdminDashboardUsersSummary } from "@services/dashboard";
import { Link } from "@tanstack/react-router";

interface AdminUsersSectionProps {
	users?: AdminDashboardUsersSummary;
	isLoading?: boolean;
	className?: string;
}

interface UserCounterTile {
	label: string;
	count: number;
	search: Record<string, string | number | boolean>;
}

export const AdminUsersSection = ({
	users,
	isLoading = false,
	className,
}: AdminUsersSectionProps) => {
	const activeByRole = users?.activeByRole ?? {};

	const tiles: UserCounterTile[] = [
		{
			label: `${userRolePluralLabels.user} ativos`,
			count: activeByRole.user ?? 0,
			search: { role: "user", status: "active" },
		},
		{
			label: `${userRolePluralLabels.reviewer} ativos`,
			count: activeByRole.reviewer ?? 0,
			search: { role: "reviewer", status: "active" },
		},
		{
			label: `${userRolePluralLabels.admin} ativos`,
			count: activeByRole.admin ?? 0,
			search: { role: "admin", status: "active" },
		},
		{
			label: "Contas inativas",
			count: users?.inactive ?? 0,
			search: { status: "inactive" },
		},
		{
			label: "Troca de senha pendente",
			count: users?.mustChangePassword ?? 0,
			search: { mustChangePassword: true },
		},
		{
			label: "Sem acesso há > 30 dias",
			count: users?.withoutAccess30Days ?? 0,
			search: { status: "active", inactiveDays: 30 },
		},
	];

	return (
		<section
			aria-label="Indicadores de Usuários"
			className={cn("bg-primary text-primary-foreground", className)}
		>
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
				{tiles.map((tile) => (
					<Link
						key={tile.label}
						to="/usuarios"
						search={tile.search}
						className="relative flex min-h-24 flex-col justify-center gap-1 border-r border-b border-primary-foreground/20 p-4 transition-colors hover:bg-primary-foreground/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:border-b-0 lg:last:border-r-0"
					>
						<span className="font-mono text-2xs tracking-[0.11em] text-primary-foreground/80 uppercase">
							{tile.label}
						</span>
						{isLoading || !users ? (
							<Skeleton className="h-8 w-12 bg-primary-foreground/20" />
						) : (
							<span className="font-mono text-3xl font-bold tracking-tight">
								{padCount(tile.count)}
							</span>
						)}
					</Link>
				))}
			</div>
		</section>
	);
};
