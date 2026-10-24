import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InfiniteFilterMenu } from "./InfiniteFilterMenu";

const options = [
	{ value: "1", label: "Ana Projetista" },
	{ value: "2", label: "Beto Projetista" },
];

let intersect: (isIntersecting: boolean) => void = () => undefined;
const disconnect = vi.fn();

class FakeIntersectionObserver {
	constructor(callback: IntersectionObserverCallback) {
		intersect = (isIntersecting) =>
			callback(
				[{ isIntersecting } as IntersectionObserverEntry],
				this as unknown as IntersectionObserver,
			);
	}

	observe = vi.fn();
	disconnect = disconnect;
}

const renderMenu = (
	props: Partial<Parameters<typeof InfiniteFilterMenu>[0]> = {},
) => {
	const handlers = {
		onValueChange: vi.fn(),
		onSearchChange: vi.fn(),
		onLoadMore: vi.fn(),
	};
	render(
		<InfiniteFilterMenu
			label="Projetista"
			allLabel="Todos"
			searchPlaceholder="Buscar projetista"
			emptyMessage="Nenhum projetista encontrado."
			options={options}
			value={null}
			hasNextPage={false}
			isFetchingNextPage={false}
			isLoading={false}
			{...handlers}
			{...props}
		/>,
	);

	return handlers;
};

describe("InfiniteFilterMenu", () => {
	beforeEach(() => {
		vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it("shows the selected name even when it is not among the loaded options", () => {
		renderMenu({ value: "99", selectedLabel: "Carla Projetista" });

		expect(
			screen.getByRole("combobox", { name: "Projetista: Carla Projetista" }),
		).toBeInTheDocument();
	});

	it("summarizes with the all label when nothing is picked", () => {
		renderMenu();

		expect(
			screen.getByRole("combobox", { name: "Projetista: Todos" }),
		).toBeInTheDocument();
	});

	it("reports the picked option", async () => {
		const { onValueChange } = renderMenu();

		fireEvent.click(
			screen.getByRole("combobox", { name: "Projetista: Todos" }),
		);
		fireEvent.click(
			await screen.findByRole("option", { name: "Beto Projetista" }),
		);

		expect(onValueChange).toHaveBeenCalledWith("2");
	});

	it("clears the pick with the all label", async () => {
		const { onValueChange } = renderMenu({ value: "1" });

		fireEvent.click(
			screen.getByRole("combobox", { name: "Projetista: Ana Projetista" }),
		);
		fireEvent.click(await screen.findByRole("button", { name: "Todos" }));

		expect(onValueChange).toHaveBeenCalledWith(null);
	});

	it("sends the search to the server after the debounce, without filtering locally", async () => {
		const { onSearchChange } = renderMenu();

		fireEvent.click(
			screen.getByRole("combobox", { name: "Projetista: Todos" }),
		);
		const input = await screen.findByPlaceholderText("Buscar projetista");
		vi.useFakeTimers();
		onSearchChange.mockClear();
		fireEvent.change(input, { target: { value: "  zeca " } });

		act(() => vi.advanceTimersByTime(299));
		expect(onSearchChange).not.toHaveBeenCalled();

		act(() => vi.advanceTimersByTime(1));
		expect(onSearchChange).toHaveBeenLastCalledWith("zeca");
		expect(
			screen.getByRole("option", { name: "Ana Projetista" }),
		).toBeInTheDocument();
	});

	it("resets the search when the menu closes", async () => {
		const { onSearchChange } = renderMenu();

		fireEvent.click(
			screen.getByRole("combobox", { name: "Projetista: Todos" }),
		);
		fireEvent.change(await screen.findByPlaceholderText("Buscar projetista"), {
			target: { value: "beto" },
		});
		await waitFor(() =>
			expect(onSearchChange).toHaveBeenLastCalledWith("beto"),
		);

		fireEvent.keyDown(screen.getByPlaceholderText("Buscar projetista"), {
			key: "Escape",
		});

		await waitFor(() => expect(onSearchChange).toHaveBeenLastCalledWith(""));
	});

	it("loads the next page when the end of the list comes into view", async () => {
		const { onLoadMore } = renderMenu({ hasNextPage: true });

		fireEvent.click(
			screen.getByRole("combobox", { name: "Projetista: Todos" }),
		);
		await screen.findByRole("option", { name: "Ana Projetista" });

		act(() => intersect(false));
		expect(onLoadMore).not.toHaveBeenCalled();

		act(() => intersect(true));
		expect(onLoadMore).toHaveBeenCalledTimes(1);
	});

	it("does not watch the end of the list on the last page", async () => {
		const { onLoadMore } = renderMenu({ hasNextPage: false });
		intersect = () => undefined;

		fireEvent.click(
			screen.getByRole("combobox", { name: "Projetista: Todos" }),
		);
		await screen.findByRole("option", { name: "Ana Projetista" });

		act(() => intersect(true));
		expect(onLoadMore).not.toHaveBeenCalled();
	});

	it("shows a loading row while the next page loads", async () => {
		renderMenu({ hasNextPage: true, isFetchingNextPage: true });

		fireEvent.click(
			screen.getByRole("combobox", { name: "Projetista: Todos" }),
		);

		expect(await screen.findByText("Carregando mais")).toBeInTheDocument();
	});

	it("tells when nothing matches", async () => {
		renderMenu({ options: [] });

		fireEvent.click(
			screen.getByRole("combobox", { name: "Projetista: Todos" }),
		);

		expect(
			await screen.findByText("Nenhum projetista encontrado."),
		).toBeInTheDocument();
	});
});
