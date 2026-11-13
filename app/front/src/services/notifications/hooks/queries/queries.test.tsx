import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getNotifications, readNotification } from "../../requests";
import { useReadNotification } from "../mutations";
import { useGetNotifications } from "./useGetNotifications";
import { useRefreshNotificationsOnNavigation } from "./useRefreshNotificationsOnNavigation";

vi.mock("../../requests", () => ({
	getNotifications: vi.fn(),
	readNotification: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const bell: { read?: (id: string) => void } = {};

const renderBell = async ({ enabled = true } = {}) => {
	const Bell = () => {
		const { data } = useGetNotifications({ enabled });
		const { mutate } = useReadNotification();
		bell.read = mutate;
		useRefreshNotificationsOnNavigation();

		return (
			<>
				<p>{data?.data.unreadCount ?? "-"}</p>
				<Outlet />
			</>
		);
	};
	const root = createRootRoute({ component: Bell });
	const pages = [
		"/fila-de-analise",
		"/projetos/$id",
		"/projetos/$id/dados",
	].map((path) => createRoute({ getParentRoute: () => root, path }));
	const router = createRouter({
		routeTree: root.addChildren(pages),
		history: createMemoryHistory({ initialEntries: ["/fila-de-analise"] }),
	});
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
	});

	await act(() => router.load());
	render(
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>,
	);
	await screen.findByRole("paragraph");

	return router;
};

describe("useRefreshNotificationsOnNavigation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getNotifications).mockResolvedValue({
			data: { unreadCount: 2, items: [] },
		});
	});

	it("fetches once on the first render", async () => {
		await renderBell();

		await waitFor(() => expect(getNotifications).toHaveBeenCalledOnce());
	});

	it("refreshes on each change of route, even within the stale time", async () => {
		const router = await renderBell();
		await waitFor(() => expect(getNotifications).toHaveBeenCalledOnce());

		await act(() =>
			router.navigate({ to: "/projetos/$id", params: { id: "4" } }),
		);
		await waitFor(() => expect(getNotifications).toHaveBeenCalledTimes(2));

		await act(() =>
			router.navigate({ to: "/projetos/$id/dados", params: { id: "4" } }),
		);
		await waitFor(() => expect(getNotifications).toHaveBeenCalledTimes(3));
	});

	it("leaves a change of search alone", async () => {
		const router = await renderBell();
		await waitFor(() => expect(getNotifications).toHaveBeenCalledOnce());

		await act(() =>
			router.navigate({ to: "/fila-de-analise", search: { page: 2 } }),
		);

		expect(getNotifications).toHaveBeenCalledOnce();
	});

	it("stays quiet while a password change is pending", async () => {
		const router = await renderBell({ enabled: false });

		await act(() =>
			router.navigate({ to: "/projetos/$id", params: { id: "4" } }),
		);

		expect(getNotifications).not.toHaveBeenCalled();
	});

	// Opening a notification reads it and navigates: one refresh is enough.
	it("lets the read refresh the bell instead of the route", async () => {
		type Answer = Awaited<ReturnType<typeof readNotification>>;
		const pending: { resolve?: (value: Answer) => void } = {};
		vi.mocked(readNotification).mockReturnValue(
			new Promise<Answer>((resolve) => {
				pending.resolve = resolve;
			}),
		);
		const router = await renderBell();
		await waitFor(() => expect(getNotifications).toHaveBeenCalledOnce());

		act(() => bell.read?.("1"));
		await act(() =>
			router.navigate({ to: "/projetos/$id", params: { id: "4" } }),
		);
		expect(getNotifications).toHaveBeenCalledOnce();

		await act(async () => {
			pending.resolve?.({ data: {} as Answer["data"] });
		});
		await waitFor(() => expect(getNotifications).toHaveBeenCalledTimes(2));
	});
});
