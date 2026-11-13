import type { AppNotification } from "@services/notifications";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";

import { NotificationsMenu } from "./NotificationsMenu";

const mockNavigate = vi.fn();
const mockRead = vi.fn();
const mockReadAll = vi.fn();
const mockRefetch = vi.fn();
const listQuery = vi.hoisted(() => ({
	current: {} as Record<string, unknown>,
	options: undefined as { enabled?: boolean } | undefined,
}));

vi.mock("@services/notifications", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/notifications")>()),
	useGetNotifications: (options?: { enabled?: boolean }) => {
		listQuery.options = options;
		return listQuery.current;
	},
	useReadNotification: () => ({ mutate: mockRead }),
	useReadAllNotifications: () => ({ mutate: mockReadAll, isPending: false }),
	useRefreshNotificationsOnNavigation: vi.fn(),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
	...(await importOriginal<typeof import("@tanstack/react-router")>()),
	useNavigate: () => mockNavigate,
}));

const notificationOf = (
	id: string,
	overrides: Partial<AppNotification> = {},
): AppNotification => ({
	id,
	type: "PROJECT_REJECTED",
	protocol: `2026-100${id}`,
	projectId: id,
	text: `Projeto 2026-100${id} reprovado com 3 apontamentos`,
	link: `/projetos/${id}/apontamentos`,
	read: false,
	createdAt: new Date().toISOString(),
	readAt: null,
	...overrides,
});

const loaded = (unreadCount: number, items: AppNotification[]) => ({
	isPending: false,
	isError: false,
	refetch: mockRefetch,
	data: { data: { unreadCount, items } },
});

const openPanel = (name: RegExp | string) => {
	fireEvent.click(screen.getByRole("button", { name }));
	return screen.getByRole("list", { name: "Notificações recentes" });
};

describe("NotificationsMenu", () => {
	beforeEach(() => {
		signInAs("user");
		vi.clearAllMocks();
		listQuery.current = loaded(1, [
			notificationOf("4"),
			notificationOf("5", { read: true, text: "Projeto 2026-1005 aprovado" }),
		]);
	});

	it("shows the unread count on the bell", () => {
		render(<NotificationsMenu />);

		const bell = screen.getByRole("button", {
			name: "Notificações, 1 não lida",
		});
		const count = within(bell).getByText("01");
		expect(count).toHaveClass("font-mono", "text-foreground");
		expect(count).not.toHaveClass("bg-attention");
	});

	it("drops the count when nothing is unread", () => {
		listQuery.current = loaded(0, [notificationOf("5", { read: true })]);
		render(<NotificationsMenu />);

		const bell = screen.getByRole("button", { name: "Notificações" });
		expect(within(bell).queryByText("0")).not.toBeInTheDocument();
		openPanel("Notificações");
		expect(
			screen.queryByRole("button", { name: "Marcar Todas como Lidas" }),
		).not.toBeInTheDocument();
	});

	it("lists protocol, text and how long ago, unread first in tone", () => {
		render(<NotificationsMenu />);
		const list = openPanel(/Notificações, 1/);

		const [unread, read] = within(list).getAllByRole("button");
		expect(unread).toHaveAttribute("data-read", "false");
		expect(unread).toHaveTextContent("Não lida:");
		expect(unread).toHaveTextContent(
			"Projeto 2026-1004 reprovado com 3 apontamentos",
		);
		expect(unread).toHaveTextContent("2026-1004");
		expect(unread).toHaveTextContent("há poucos segundos");
		expect(read).toHaveAttribute("data-read", "true");
		expect(read).not.toHaveTextContent("Não lida:");
	});

	it("opens the project and marks the notification read", () => {
		render(<NotificationsMenu />);
		const list = openPanel(/Notificações, 1/);

		fireEvent.click(within(list).getAllByRole("button")[0]);

		expect(mockRead).toHaveBeenCalledWith("4");
		expect(mockNavigate).toHaveBeenCalledWith({
			href: "/projetos/4/apontamentos",
		});
	});

	it("opens a read notification without marking it again", () => {
		render(<NotificationsMenu />);
		const list = openPanel(/Notificações, 1/);

		fireEvent.click(within(list).getAllByRole("button")[1]);

		expect(mockRead).not.toHaveBeenCalled();
		expect(mockNavigate).toHaveBeenCalledWith({
			href: "/projetos/5/apontamentos",
		});
	});

	it("never follows a link out of the app", () => {
		listQuery.current = loaded(1, [
			notificationOf("4", { link: "https://evil.example" }),
		]);
		render(<NotificationsMenu />);
		const list = openPanel(/Notificações, 1/);

		fireEvent.click(within(list).getByRole("button"));

		expect(mockRead).toHaveBeenCalledWith("4");
		expect(mockNavigate).not.toHaveBeenCalled();
	});

	it("marks every notification read", () => {
		listQuery.current = loaded(
			4,
			["1", "2", "3", "4"].map((id) => notificationOf(id)),
		);
		render(<NotificationsMenu />);
		openPanel(/Notificações, 4 não lidas/);

		mockReadAll.mockImplementation(
			(_: unknown, options?: { onSuccess?: () => void }) =>
				options?.onSuccess?.(),
		);

		fireEvent.click(
			screen.getByRole("button", { name: "Marcar Todas como Lidas" }),
		);

		expect(mockReadAll).toHaveBeenCalledOnce();
		// The button goes away with the unread ones; focus must not fall to the page.
		expect(
			screen.getByRole("button", { name: "Fechar notificações" }),
		).toHaveFocus();
	});

	it("names the panel after its title", () => {
		render(<NotificationsMenu />);
		openPanel(/Notificações, 1/);

		expect(
			screen.getByRole("dialog", { name: "Notificações" }),
		).toBeInTheDocument();
	});

	it("says when there is nothing yet", () => {
		listQuery.current = loaded(0, []);
		render(<NotificationsMenu />);
		fireEvent.click(screen.getByRole("button", { name: "Notificações" }));

		expect(
			screen.getByText("Nenhuma notificação por enquanto."),
		).toBeInTheDocument();
	});

	it("offers a retry when the list fails", () => {
		listQuery.current = {
			isPending: false,
			isError: true,
			refetch: mockRefetch,
		};
		render(<NotificationsMenu />);
		fireEvent.click(screen.getByRole("button", { name: "Notificações" }));
		mockRefetch.mockClear();

		fireEvent.click(screen.getByRole("button", { name: "Tentar Novamente" }));
		expect(mockRefetch).toHaveBeenCalledOnce();
	});

	it("keeps the list it has when a refresh fails", () => {
		listQuery.current = {
			...loaded(1, [notificationOf("4")]),
			isError: true,
		};
		render(<NotificationsMenu />);
		const list = openPanel(/Notificações, 1/);

		expect(within(list).getByRole("button")).toHaveTextContent("2026-1004");
		expect(
			screen.queryByText("Não foi possível carregar as notificações."),
		).not.toBeInTheDocument();
	});

	it("stays quiet while a password change is pending", () => {
		signInAs("user", { mustChangePassword: true });
		render(<NotificationsMenu />);

		expect(listQuery.options).toEqual({ enabled: false });
	});
});
