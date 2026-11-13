import type { ReviewQueueItem } from "@services/review-queue";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AssignReviewerDialog } from "./AssignReviewerDialog";

vi.mock("@services/review-queue", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/review-queue")>()),
	useGetReviewerList: () => ({
		isPending: false,
		data: {
			data: [
				{ id: "7", name: "Ana Analista" },
				{ id: "8", name: "Bruno Analista" },
			],
		},
	}),
}));

const projectOf = (id: string, reviewerName: string | null = null) =>
	({
		id,
		protocol: `2026-000${id}`,
		reviewerId: reviewerName ? "7" : null,
		reviewerName,
	}) as ReviewQueueItem;

const renderDialog = (
	projects: ReviewQueueItem[],
	{ isPending = false } = {},
) => {
	const onConfirm = vi.fn();
	const onOpenChange = vi.fn();
	render(
		<AssignReviewerDialog
			open
			projects={projects}
			isPending={isPending}
			onOpenChange={onOpenChange}
			onConfirm={onConfirm}
		/>,
	);

	return { onConfirm, onOpenChange };
};

const pick = async (option: string) => {
	fireEvent.click(screen.getByRole("combobox", { name: "Analista" }));
	const item = await screen.findByRole("option", { name: option });
	fireEvent.pointerDown(item);
	fireEvent.click(item);
	await waitFor(() => expect(screen.queryAllByRole("option")).toHaveLength(0));
};

describe("AssignReviewerDialog", () => {
	it("lists the projects with their current analyst", () => {
		renderDialog([projectOf("1"), projectOf("2", "Ana Analista")]);

		expect(screen.getByText("2026-0001")).toBeInTheDocument();
		expect(screen.getByText("Não Atribuído")).toBeInTheDocument();
		expect(screen.getByText("Ana Analista")).toBeInTheDocument();
		expect(
			screen.getByText(/Escolha o analista de 2 projetos/),
		).toBeInTheDocument();
	});

	it("summarises a long selection", () => {
		renderDialog(
			["1", "2", "3", "4", "5", "6", "7"].map((id) => projectOf(id)),
		);

		expect(screen.queryByText("2026-0006")).not.toBeInTheDocument();
		expect(screen.getByText("e mais 2 projetos")).toBeInTheDocument();
	});

	it("waits for an analyst before assigning", async () => {
		const { onConfirm } = renderDialog([projectOf("1")]);
		const assign = screen.getByRole("button", { name: "Atribuir" });

		expect(assign).toBeDisabled();

		await pick("Bruno Analista");
		fireEvent.click(assign);

		expect(onConfirm).toHaveBeenCalledWith("8");
	});

	it("cannot be dismissed while the assignment runs", () => {
		const { onOpenChange } = renderDialog([projectOf("1")], {
			isPending: true,
		});

		expect(
			screen.getByRole("button", { name: "Atribuindo..." }),
		).toBeDisabled();
		fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
		expect(onOpenChange).not.toHaveBeenCalled();
	});
});
