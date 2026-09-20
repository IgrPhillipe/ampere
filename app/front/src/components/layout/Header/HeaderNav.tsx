import { useAuthStore } from "@features/auth/store";
import { cn } from "@lib/utils";
import { Link } from "@tanstack/react-router";

import { APP_NAV_ITEMS, filterNavItemsByRole } from "../Sidebar/nav-items";

interface HeaderNavProps {
	orientation?: "horizontal" | "vertical";
	onNavigate?: () => void;
	className?: string;
}

export const HeaderNav = ({
	orientation = "horizontal",
	onNavigate,
	className,
}: HeaderNavProps) => {
	const role = useAuthStore((state) => state.user?.role);
	const items = filterNavItemsByRole(APP_NAV_ITEMS, role);
	const horizontal = orientation === "horizontal";
	const itemClassName = horizontal
		? "relative flex h-full items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
		: "flex min-h-11 w-full items-center rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground";

	return (
		<nav
			aria-label="Navegação principal"
			className={cn(
				horizontal ? "h-full items-stretch" : "flex-col gap-1",
				"flex",
				className,
			)}
		>
			{items.map((item) => {
				if (item.disabled || !item.to) {
					return (
						<span
							key={item.label}
							aria-disabled="true"
							title="Disponível em uma próxima etapa"
							className={cn(itemClassName, "cursor-not-allowed opacity-55")}
						>
							{item.label}
						</span>
					);
				}

				return (
					<Link
						key={item.to}
						to={item.to}
						activeOptions={{ exact: item.exact }}
						onClick={onNavigate}
						className={itemClassName}
						activeProps={{
							className: horizontal
								? "text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary"
								: "bg-accent text-accent-foreground",
						}}
					>
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
};
