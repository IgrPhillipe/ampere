import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
	type AssignableProject,
	AssignReviewerDialog,
} from "./AssignReviewerDialog";

const reviewers = vi.hoisted(() => ({
	list: [
		{ id: "7", name: "Ana Analista", role: "reviewer", active: true },
		{ id: "8", name: "Bruno Analista", role: "reviewer", active: true },
		// A smaller id last: the list keeps the API's order by name.
		{ id: "2", name: "Carla Gestora", role: "admin", active: true },
		// Deactivated with projects still held: the dialog leaves them out.
		{ id: "9", name: "Davi Inativo", role: "reviewer", active: false },
	],
}));

vi.mock("@services/review-queue", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/review-queue")>()),
	useGetReviewerList: () => ({
		isPending: false,
		data: { data: reviewers.list },
	}),
}));

const projectOf = ({
	reviewerId = null,
	ownerId = "30",
}: Partial<AssignableProject> = {}): AssignableProject => ({
	protocol: "2026-0001",
	ownerId,
	reviewerId,
});

const openOptions = () => {
	fireEvent.click(screen.getByRole("combobox", { name: "Analista" }));
	return screen.findAllByRole("option");
};

const renderDialog = (project = projectOf(), { isPending = false } = {}) => {
	const onConfirm = vi.fn();
	const onOpenChange = vi.fn();
	render(
		<AssignReviewerDialog
			open
			project={project}
			isPending={isPending}
			onOpenChange={onOpenChange}
			onConfirm={onConfirm}
		/>,
	);

	return { onConfirm, onOpenChange };
};

const pick = async (option: string | RegExp) => {
	fireEvent.click(screen.getByRole("combobox", { name: "Analista" }));
	const item = await screen.findByRole("option", { name: option });
	fireEvent.pointerDown(item);
	fireEvent.click(item);
	await waitFor(() => expect(screen.queryAllByRole("option")).toHaveLength(0));
};

describe("AssignReviewerDialog", () => {
	it("names the project and offers the first assignment", () => {
		renderDialog();

		expect(
			screen.getByRole("heading", { name: "Atribuir Analista" }),
		).toBeInTheDocument();
		expect(screen.getByText(/do projeto 2026-0001/)).toBeInTheDocument();
	});

	it("offers a change when the project has an analyst", async () => {
		renderDialog(projectOf({ reviewerId: "7" }));

		expect(
			screen.getByRole("heading", { name: "Trocar Analista" }),
		).toBeInTheDocument();
		const [ana] = await openOptions();
		expect(ana).toHaveTextContent("Analista atual");
	});

	it("waits for an analyst before assigning", async () => {
		const { onConfirm } = renderDialog();
		const assign = screen.getByRole("button", { name: "Atribuir" });

		expect(assign).toBeDisabled();

		await pick("Bruno Analista");
		fireEvent.click(assign);

		expect(onConfirm).toHaveBeenCalledWith("8");
	});

	it("does not reassign the current analyst", async () => {
		renderDialog(projectOf({ reviewerId: "7" }));

		await pick(/^Ana Analista/);

		expect(screen.getByRole("button", { name: "Atribuir" })).toBeDisabled();
	});

	it("lists the active analysts in the order the API sends, by name", async () => {
		renderDialog();

		const options = await openOptions();

		expect(options.map((option) => option.textContent)).toEqual([
			"Ana Analista",
			"Bruno Analista",
			"Carla GestoraGestor",
		]);
	});

	it("disables the owner of the project, with the reason", async () => {
		const { onConfirm } = renderDialog(projectOf({ ownerId: "2" }));

		const [ana, , carla] = await openOptions();

		expect(carla).toHaveAttribute("aria-disabled", "true");
		expect(carla).toHaveTextContent("Dono do projeto");
		expect(ana).not.toHaveAttribute("aria-disabled", "true");
		fireEvent.pointerDown(carla);
		fireEvent.click(carla);
		expect(screen.getByRole("button", { name: "Atribuir" })).toBeDisabled();
		expect(onConfirm).not.toHaveBeenCalled();
	});

	it("drops an analyst who left the refreshed list", async () => {
		const initial = reviewers.list;
		const props = {
			open: true,
			project: projectOf(),
			isPending: false,
			onOpenChange: vi.fn(),
			onConfirm: vi.fn(),
		};
		const { rerender } = render(<AssignReviewerDialog {...props} />);
		await pick("Bruno Analista");
		const assign = screen.getByRole("button", { name: "Atribuir" });
		expect(assign).toBeEnabled();

		// The API refused an inactive analyst, and the list came back without him.
		reviewers.list = initial.filter(({ id }) => id !== "8");
		rerender(<AssignReviewerDialog {...props} project={projectOf()} />);

		expect(assign).toBeDisabled();
		expect(
			screen.getByRole("combobox", { name: "Analista" }),
		).toHaveTextContent("Selecione o analista");
		reviewers.list = initial;
	});

	it("cannot be dismissed while the assignment runs", () => {
		const { onOpenChange } = renderDialog(projectOf(), { isPending: true });

		expect(
			screen.getByRole("button", { name: "Atribuindo..." }),
		).toBeDisabled();
		fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
		expect(onOpenChange).not.toHaveBeenCalled();
	});
});
