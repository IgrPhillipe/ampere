import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpErrorOf } from "@/test/fixtures/http-error";

import { notificationKeys } from "../../query-keys";
import { readAllNotifications, readNotification } from "../../requests";
import type { AppNotification, NotificationList } from "../../schemas";
import { useReadAllNotifications } from "./useReadAllNotifications";
import { useReadNotification } from "./useReadNotification";

vi.mock("../../requests", () => ({
	readNotification: vi.fn(),
	readAllNotifications: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const notificationOf = (id: string, read = false): AppNotification => ({
	id,
	type: "PROJECT_REJECTED",
	protocol: "2026-1004",
	projectId: "4",
	text: "Projeto 2026-1004 reprovado com 3 apontamentos",
	link: "/projetos/4/apontamentos",
	read,
	createdAt: "2026-11-13T12:00:00-03:00",
	readAt: read ? "2026-11-13T13:00:00-03:00" : null,
});

const setup = (list: NotificationList) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	queryClient.setQueryData(notificationKeys.list(), { data: list });
	const wrapper = ({ children }: PropsWithChildren) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	return { queryClient, wrapper };
};

const cached = (queryClient: QueryClient) =>
	queryClient.getQueryData<{ data: NotificationList }>(notificationKeys.list())
		?.data;

describe("useReadNotification", () => {
	beforeEach(() => vi.clearAllMocks());

	it("marks the notification read before the API answers", async () => {
		type Answer = Awaited<ReturnType<typeof readNotification>>;
		const pending: { resolve?: (value: Answer) => void } = {};
		vi.mocked(readNotification).mockReturnValue(
			new Promise<Answer>((resolve) => {
				pending.resolve = resolve;
			}),
		);
		const { queryClient, wrapper } = setup({
			unreadCount: 2,
			items: [notificationOf("1"), notificationOf("2")],
		});

		const { result } = renderHook(() => useReadNotification(), { wrapper });
		act(() => result.current.mutate("1"));

		await waitFor(() => expect(cached(queryClient)?.unreadCount).toBe(1));
		expect(cached(queryClient)?.items.map(({ read }) => read)).toEqual([
			true,
			false,
		]);

		pending.resolve?.({ data: notificationOf("1", true) });
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(
			queryClient.getQueryState(notificationKeys.list())?.isInvalidated,
		).toBe(true);
	});

	it("rolls the bell back and tells when the API refuses", async () => {
		vi.mocked(readNotification).mockRejectedValue(
			await httpErrorOf(404, {
				status: 404,
				detail: "Notificação não encontrada.",
			}),
		);
		const { queryClient, wrapper } = setup({
			unreadCount: 2,
			items: [notificationOf("1"), notificationOf("2")],
		});
		// The refresh after the failure does not reach the API either.
		queryClient.setQueryDefaults(notificationKeys.list(), {
			queryFn: () => Promise.reject(new TypeError("Failed to fetch")),
		});

		const { result } = renderHook(() => useReadNotification(), { wrapper });
		act(() => result.current.mutate("1"));
		await waitFor(() => expect(result.current.isError).toBe(true));

		expect(cached(queryClient)?.unreadCount).toBe(2);
		expect(cached(queryClient)?.items.map(({ read }) => read)).toEqual([
			false,
			false,
		]);
		expect(toast.error).toHaveBeenCalledWith("Notificação não encontrada.", {
			id: "Notificação não encontrada.",
		});
	});

	it("leaves the count alone for a notification already read", async () => {
		vi.mocked(readNotification).mockResolvedValue({
			data: notificationOf("1", true),
		});
		const { queryClient, wrapper } = setup({
			unreadCount: 1,
			items: [notificationOf("1", true), notificationOf("2")],
		});

		const { result } = renderHook(() => useReadNotification(), { wrapper });
		act(() => result.current.mutate("1"));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(cached(queryClient)?.unreadCount).toBe(1);
	});
});

describe("useReadAllNotifications", () => {
	beforeEach(() => vi.clearAllMocks());

	it("refreshes the bell after reading everything", async () => {
		vi.mocked(readAllNotifications).mockResolvedValue(undefined);
		const { queryClient, wrapper } = setup({
			unreadCount: 4,
			items: [notificationOf("1")],
		});

		const { result } = renderHook(() => useReadAllNotifications(), {
			wrapper,
		});
		act(() => result.current.mutate());
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(
			queryClient.getQueryState(notificationKeys.list())?.isInvalidated,
		).toBe(true);
	});

	it("tells when the API refuses", async () => {
		vi.mocked(readAllNotifications).mockRejectedValue(
			await httpErrorOf(400, { status: 400 }),
		);
		const { wrapper } = setup({ unreadCount: 1, items: [] });

		const { result } = renderHook(() => useReadAllNotifications(), {
			wrapper,
		});
		act(() => result.current.mutate());
		await waitFor(() => expect(result.current.isError).toBe(true));

		expect(toast.error).toHaveBeenCalledWith(
			"Não foi possível marcar as notificações como lidas.",
		);
	});
});
