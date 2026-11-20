import {
	APP_NAV_ITEMS,
	filterNavItemsByRole,
	groupNavItemsByRole,
	type NavItem,
} from "@components/layout/nav-items";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { useAuthStore } from "@features/shared";
import { cn } from "@lib/utils";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";

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
	const matchRoute = useMatchRoute();
	const horizontal = orientation === "horizontal";
	// The mobile sheet has room for every item, so only the header groups them.
	const entries = horizontal
		? groupNavItemsByRole(APP_NAV_ITEMS, role)
		: filterNavItemsByRole(APP_NAV_ITEMS, role).map((item) => ({
				kind: "item" as const,
				item,
			}));
	const isActive = (item: NavItem) =>
		item.to !== undefined &&
		matchRoute({ to: item.to, fuzzy: !item.exact }) !== false;
	const itemClassName = horizontal
		? "relative flex h-full items-center px-3 text-sm whitespace-nowrap font-normal text-muted-foreground transition-colors hover:text-foreground [&.active]:font-medium"
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
			{entries.map((entry) => {
				if (entry.kind === "group") {
					return (
						<DropdownMenu key={entry.label}>
							<DropdownMenuTrigger
								className={cn(
									itemClassName,
									"gap-1.5 outline-none focus-visible:text-foreground focus-visible:underline",
									entry.items.some(isActive) && "font-medium text-foreground",
								)}
							>
								{entry.label}
								<ChevronDownIcon
									aria-hidden="true"
									className="size-3.5 text-faint-foreground"
								/>
							</DropdownMenuTrigger>

							<DropdownMenuContent align="center" className="min-w-48">
								{entry.items.map((item) => (
									<DropdownMenuItem
										key={item.to}
										render={<Link to={item.to} />}
										className={cn(
											"text-muted-foreground",
											isActive(item) && "font-medium text-foreground",
										)}
									>
										{item.label}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					);
				}

				const { item } = entry;

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
								? "text-foreground"
								: "bg-accent text-foreground",
						}}
					>
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
};
