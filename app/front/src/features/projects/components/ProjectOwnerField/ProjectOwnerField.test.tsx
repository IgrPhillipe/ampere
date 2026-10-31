import { useZodForm } from "@features/shared";
import { getUserList } from "@services/users/requests";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useWatch } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { projectCreationSchema } from "../../schemas";
import { ProjectOwnerField } from "./ProjectOwnerField";

vi.mock("@services/users/requests", () => ({
	getUserList: vi.fn(),
}));

const designer = (id: string, name: string) => ({
	id,
	name,
	email: `${id}@ampere.com`,
	role: "user" as const,
	active: true,
	mustChangePassword: false,
	lastLoginAt: null,
	createdAt: "2026-10-01T10:00:00-03:00",
});

const Form = ({ disabled }: { disabled?: boolean }) => {
	const form = useZodForm(projectCreationSchema, {
		ownerId: disabled ? "9" : undefined,
	});
	const ownerId = useWatch({ control: form.control, name: "ownerId" });

	return (
		<>
			<ProjectOwnerField
				control={form.control}
				disabled={disabled}
				ownerName={disabled ? "Carla Projetista" : undefined}
			/>
			<output>{ownerId ?? "nenhum"}</output>
		</>
	);
};

const renderForm = (props: { disabled?: boolean } = {}) =>
	render(
		<QueryClientProvider
			client={
				new QueryClient({ defaultOptions: { queries: { retry: false } } })
			}
		>
			<Form {...props} />
		</QueryClientProvider>,
	);

describe("ProjectOwnerField", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"IntersectionObserver",
			class {
				observe = vi.fn();
				disconnect = vi.fn();
			},
		);
		vi.mocked(getUserList).mockResolvedValue({
			data: [designer("5", "Ana Projetista"), designer("6", "Beto Projetista")],
			pagination: { total: 2, page: 1, pageSize: 20 },
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it("offers only the active designers and stores the picked one", async () => {
		renderForm();

		const trigger = screen.getByRole("combobox", { name: /Projetista/ });
		expect(trigger).toHaveAttribute("aria-required", "true");
		fireEvent.click(trigger);
		fireEvent.click(
			await screen.findByRole("option", { name: "Beto Projetista" }),
		);

		await waitFor(() =>
			expect(screen.getByRole("status")).toHaveTextContent("6"),
		);
		expect(trigger).toHaveTextContent("Beto Projetista");
		expect(getUserList).toHaveBeenCalledWith(
			expect.objectContaining({ role: "user", active: true, page: 1 }),
		);
	});

	it("only shows the owner, without listing designers, when disabled", () => {
		renderForm({ disabled: true });

		const trigger = screen.getByRole("combobox", { name: /Projetista/ });

		expect(trigger).toBeDisabled();
		expect(trigger).toHaveTextContent("Carla Projetista");
		expect(trigger).not.toHaveAttribute("aria-required");
		expect(getUserList).not.toHaveBeenCalled();
	});
});
