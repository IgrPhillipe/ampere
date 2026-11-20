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
import { useId, useRef, useState } from "react";

import {
	formatNotificationAge,
	formatUnreadCount,
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
	const titleId = useId();
	const closeRef = useRef<HTMLButtonElement>(null);
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

	// The button leaves with the last unread one: focus stays in the panel.
	const markAllRead = () =>
		readAll.mutate(undefined, { onSuccess: () => closeRef.current?.focus() });

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button
						variant="ghost"
						size={unreadCount > 0 ? "sm" : "icon-sm"}
						aria-label={formatUnreadLabel(unreadCount)}
					/>
				}
			>
				<BellIcon />
				{/* The prototype has no colored counter: the count is a number in ink. */}
				{unreadCount > 0 ? (
					<span
						aria-hidden="true"
						className="font-mono text-2xs font-medium text-foreground tabular-nums"
					>
						{formatUnreadCount(unreadCount)}
					</span>
				) : null}
			</PopoverTrigger>

			<PopoverContent
				align="end"
				sideOffset={8}
				// The page gutter on a phone: the panel never touches the edge.
				collisionPadding={16}
				aria-labelledby={titleId}
				className="flex w-95 max-w-[calc(100vw-2rem)] flex-col p-0"
			>
				<div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
					<h2 id={titleId} className="text-lg font-medium tracking-[-0.018em]">
						Notificações
					</h2>
					<div className="flex items-center gap-1">
						{unreadCount > 0 ? (
							<Button
								type="button"
								variant="link"
								size="xs"
								disabled={readAll.isPending}
								onClick={markAllRead}
							>
								Marcar Todas como Lidas
							</Button>
						) : null}
						<Button
							ref={closeRef}
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
