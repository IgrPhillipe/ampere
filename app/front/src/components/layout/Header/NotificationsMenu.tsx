import { Button } from "@components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@components/ui/popover";
import { Skeleton } from "@components/ui/skeleton";
import { useAuthStore } from "@features/shared";
import { cn } from "@lib/utils";
import {
	type AppNotification,
	useGetNotifications,
	useReadAllNotifications,
	useReadNotification,
	useRefreshNotificationsOnNavigation,
} from "@services/notifications";
import { useNavigate } from "@tanstack/react-router";
import { BellIcon, XIcon } from "lucide-react";
import { useState } from "react";

import {
	formatNotificationAge,
	formatUnreadBadge,
	formatUnreadLabel,
	toAppPath,
} from "./notification-format";

interface NotificationItemProps {
	notification: AppNotification;
	onOpen: (notification: AppNotification) => void;
}

const NotificationItem = ({ notification, onOpen }: NotificationItemProps) => (
	<li className="border-b border-border last:border-b-0">
		<button
			type="button"
			onClick={() => onOpen(notification)}
			data-read={notification.read}
			className="relative flex w-full flex-col gap-2 px-5 py-4 text-left transition-colors outline-none hover:bg-surface-hover focus-visible:bg-surface-hover"
		>
			{notification.read ? null : (
				<span
					aria-hidden="true"
					className="absolute top-4 left-3 h-5 w-0.5 bg-foreground"
				/>
			)}
			<span
				className={cn(
					"pl-1 text-sm",
					notification.read ? "text-muted-foreground" : "text-foreground",
				)}
			>
				{notification.read ? null : <span className="sr-only">Não lida: </span>}
				{notification.text}
			</span>
			<span className="pl-1 font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
				{notification.protocol} ·{" "}
				<time dateTime={notification.createdAt}>
					{formatNotificationAge(notification.createdAt)}
				</time>
			</span>
		</button>
	</li>
);

/** The header bell: unread count, the latest notifications and their links. */
export const NotificationsMenu = () => {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	// A temporary password makes the API refuse everything but its change.
	const mustChangePassword = useAuthStore(
		(state) => state.user?.mustChangePassword ?? false,
	);
	const notificationsQuery = useGetNotifications({
		enabled: !mustChangePassword,
	});
	const readNotification = useReadNotification();
	const readAll = useReadAllNotifications();
	const { refetch } = notificationsQuery;

	useRefreshNotificationsOnNavigation();

	const list = notificationsQuery.data?.data;
	const unreadCount = list?.unreadCount ?? 0;

	const openNotification = (notification: AppNotification) => {
		if (!notification.read) readNotification.mutate(notification.id);

		setOpen(false);

		const path = toAppPath(notification.link);

		if (path) void navigate({ href: path });
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button
						variant="ghost"
						size="icon-sm"
						className="relative"
						aria-label={formatUnreadLabel(unreadCount)}
					/>
				}
			>
				<BellIcon />
				{unreadCount > 0 ? (
					<span
						aria-hidden="true"
						className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-attention px-1 font-mono text-[0.625rem] leading-none text-primary-foreground"
					>
						{formatUnreadBadge(unreadCount)}
					</span>
				) : null}
			</PopoverTrigger>

			<PopoverContent
				align="end"
				sideOffset={8}
				className="z-50 flex w-[min(26rem,calc(100vw-2rem))] flex-col rounded-none p-0"
			>
				<div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
					<h2 className="text-lg font-medium tracking-[-0.018em]">
						Notificações
					</h2>
					<div className="flex items-center gap-1">
						{unreadCount > 0 ? (
							<Button
								type="button"
								variant="link"
								size="xs"
								disabled={readAll.isPending}
								onClick={() => readAll.mutate()}
							>
								Marcar Todas como Lidas
							</Button>
						) : null}
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							aria-label="Fechar notificações"
							onClick={() => setOpen(false)}
						>
							<XIcon />
						</Button>
					</div>
				</div>

				{/* A failed refresh keeps the list it already has; the error shows only without one. */}
				{!list ? (
					notificationsQuery.isError ? (
						<div className="flex flex-col items-start gap-2 px-5 py-6 text-sm text-muted-foreground">
							<p>Não foi possível carregar as notificações.</p>
							<Button
								type="button"
								variant="link"
								size="xs"
								onClick={() => void refetch()}
							>
								Tentar Novamente
							</Button>
						</div>
					) : (
						<div className="flex flex-col gap-3 px-5 py-4" aria-busy="true">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-4 w-full" />
						</div>
					)
				) : list.items.length > 0 ? (
					<ul
						aria-label="Notificações recentes"
						className="max-h-[min(28rem,70vh)] overflow-y-auto overscroll-contain"
					>
						{list.items.map((notification) => (
							<NotificationItem
								key={notification.id}
								notification={notification}
								onOpen={openNotification}
							/>
						))}
					</ul>
				) : (
					<p className="px-5 py-6 text-sm text-muted-foreground">
						Nenhuma notificação por enquanto.
					</p>
				)}
			</PopoverContent>
		</Popover>
	);
};
