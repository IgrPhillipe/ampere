import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { useUserFilters } from "../../hooks";
import { UserActiveFilters } from "./UserActiveFilters";

const renderChips = (searchParams: string) => {
	const Chips = () => <UserActiveFilters filters={useUserFilters()} />;
	const onUrlUpdate = vi.fn();
	const wrapper = withNuqsTestingAdapter({
		searchParams,
		hasMemory: true,
		onUrlUpdate,
	});
	render(<Chips />, { wrapper });

	return () => onUrlUpdate.mock.lastCall?.[0]?.searchParams;
};

describe("UserActiveFilters", () => {
	it("labels the panel shortcuts", () => {
		renderChips("?status=active&mustChangePassword=true&inactiveDays=30");

		expect(screen.getByText("Troca de senha pendente")).toBeInTheDocument();
		expect(
			screen.getByText("Sem acesso há mais de 30 dias"),
		).toBeInTheDocument();
	});

	it("removes a shortcut and keeps the other filters", async () => {
		const lastUrl = renderChips("?status=active&inactiveDays=30");

		fireEvent.click(
			screen.getByRole("button", {
				name: "Remover filtro Sem acesso há mais de 30 dias",
			}),
		);

		await waitFor(() => expect(lastUrl()?.toString()).toBe("status=active"));
	});
});
