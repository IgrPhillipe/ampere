import { useAuthStore } from "@features/auth/store";
import { cn } from "@lib/utils";
import { Link } from "@tanstack/react-router";

import { APP_NAV_ITEMS, filterNavItemsByRole } from "./nav-items";

interface SidebarNavProps {
	onNavigate?: () => void;
}

export const SidebarNav = ({ onNavigate }: SidebarNavProps) => {
	const role = useAuthStore((state) => state.user?.role);
	const items = filterNavItemsByRole(APP_NAV_ITEMS, role);

	if (items.length === 0) {
		return (
			<p className="px-3 py-2 text-xs text-muted-foreground">
				Nenhum item de menu ainda.
			</p>
		);
	}

	return (
		<nav className="flex flex-col gap-1">
			{items.map(({ to, label, icon: Icon, exact, disabled }) => {
				const content = (
					<>
						{Icon ? <Icon className="size-4 shrink-0" /> : null}

						{label}
					</>
				);

				if (disabled || !to) {
					return (
						<span
							key={label}
							aria-disabled="true"
							className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/45"
						>
							{content}
						</span>
					);
				}

				return (
					<Link
						key={to}
						to={to}
						activeOptions={{ exact }}
						onClick={onNavigate}
						className={cn(
							"flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
						)}
						activeProps={{
							className: "bg-sidebar-accent text-sidebar-accent-foreground",
						}}
					>
						{content}
					</Link>
				);
			})}
		</nav>
	);
};
