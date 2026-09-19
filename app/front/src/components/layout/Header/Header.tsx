import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@components/ui/sheet";
import { useAuthStore } from "@features/auth/store";
import { useLogout } from "@services/auth";
import { BellIcon, ChevronDownIcon, LogOutIcon, MenuIcon } from "lucide-react";
import { useState } from "react";

import { AppBrand } from "./AppBrand";
import { HeaderNav } from "./HeaderNav";

const initialsOf = (name: string) =>
	name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");

export const Header = () => {
	const user = useAuthStore((state) => state.user);
	const logout = useLogout();
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header className="h-18 shrink-0 border-b border-border bg-card">
			<div className="mx-auto flex h-full w-full max-w-[90rem] items-center gap-3 px-4 md:px-6 lg:px-8">
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={() => setMobileOpen(true)}
					className="lg:hidden"
					aria-label="Abrir menu"
				>
					<MenuIcon />
				</Button>

				<AppBrand />

				<HeaderNav className="mx-auto hidden lg:flex" />

				<div className="ml-auto flex items-center gap-2">
					<span
						aria-hidden="true"
						className="hidden size-9 items-center justify-center text-muted-foreground sm:flex"
					>
						<BellIcon className="size-4" />
					</span>

					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									variant="ghost"
									size="sm"
									className="h-10 max-w-52 gap-2 px-2 sm:px-3"
								/>
							}
						>
							<Avatar className="size-7">
								{user?.avatarUrl ? (
									<AvatarImage src={user.avatarUrl} alt={user.name} />
								) : null}

								<AvatarFallback className="bg-accent text-accent-foreground">
									{user ? initialsOf(user.name) : "?"}
								</AvatarFallback>
							</Avatar>

							<span className="hidden truncate text-xs tracking-[0.08em] uppercase md:inline">
								{user?.name}
							</span>

							<ChevronDownIcon className="hidden size-3.5 text-muted-foreground sm:block" />
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end" className="min-w-52">
							<DropdownMenuLabel className="text-muted-foreground">
								{user?.email}
							</DropdownMenuLabel>

							<DropdownMenuSeparator />

							<DropdownMenuItem onClick={logout}>
								<LogOutIcon />
								Sair
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
				<SheetContent
					side="left"
					className="w-[min(20rem,85vw)] gap-0 border-r border-border bg-card p-0"
				>
					<SheetTitle className="sr-only">Menu de navegação</SheetTitle>

					<div className="border-b border-border px-5 py-5">
						<AppBrand />
					</div>

					<HeaderNav
						orientation="vertical"
						onNavigate={() => setMobileOpen(false)}
						className="p-4"
					/>
				</SheetContent>
			</Sheet>
		</header>
	);
};
