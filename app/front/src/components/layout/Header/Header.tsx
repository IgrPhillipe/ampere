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
import { useAuthStore } from "@features/auth/store";
import { useLogout } from "@services/auth";
import { LogOut, MenuIcon } from "lucide-react";

const initialsOf = (name: string) =>
	name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");

interface HeaderProps {
	onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
	const user = useAuthStore((state) => state.user);
	const logout = useLogout();

	return (
		<header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-4">
			<Button
				variant="ghost"
				size="icon"
				onClick={onMenuClick}
				className="md:hidden"
				aria-label="Abrir menu"
			>
				<MenuIcon />
			</Button>

			<div className="ml-auto">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="ghost" size="sm" className="h-9 gap-2 px-2" />
						}
					>
						<Avatar className="size-6">
							{user?.avatarUrl ? (
								<AvatarImage src={user.avatarUrl} alt={user.name} />
							) : null}

							<AvatarFallback>
								{user ? initialsOf(user.name) : "?"}
							</AvatarFallback>
						</Avatar>

						<span className="hidden text-sm sm:inline">{user?.name}</span>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end" className="min-w-48">
						<DropdownMenuLabel className="text-muted-foreground">
							{user?.email}
						</DropdownMenuLabel>

						<DropdownMenuSeparator />

						<DropdownMenuItem onClick={logout}>
							<LogOut />
							Sair
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
};
