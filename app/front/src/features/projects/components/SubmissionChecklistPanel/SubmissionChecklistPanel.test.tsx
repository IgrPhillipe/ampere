import type { ProjectDocument } from "@services/submission";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { makeChecklist } from "@/test/fixtures/project-detail";

import { SubmissionChecklistPanel } from "./SubmissionChecklistPanel";

const art: ProjectDocument = {
	id: "10",
	type: "ART",
	typeLabel: "ART",
	filename: "art-assinada.pdf",
	fileSize: 204800,
	uploadedAt: "2026-10-03T12:00:00Z",
};

const checklistWith = (documents: ProjectDocument[]) =>
	makeChecklist({
		items: [{ key: "ART", label: "ART", completed: documents.length > 0 }],
		documents,
	});

describe("SubmissionChecklistPanel", () => {
	it("moves the focus to attach once the document is removed", () => {
		const onRemove = vi.fn();
		const { rerender } = render(
			<SubmissionChecklistPanel
				projectId="4"
				checklist={checklistWith([art])}
				editable
				onRemove={onRemove}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Remover ART" }));
		expect(onRemove).toHaveBeenCalledWith(art);

		rerender(
			<SubmissionChecklistPanel
				projectId="4"
				checklist={checklistWith([])}
				editable
				onRemove={onRemove}
			/>,
		);

		expect(screen.getByRole("button", { name: "Anexar ART" })).toHaveFocus();
	});

	it("leaves the focus alone when the document goes away by itself", () => {
		const { rerender } = render(
			<SubmissionChecklistPanel
				projectId="4"
				checklist={checklistWith([art])}
				editable
			/>,
		);

		rerender(
			<SubmissionChecklistPanel
				projectId="4"
				checklist={checklistWith([])}
				editable
			/>,
		);

		expect(
			screen.getByRole("button", { name: "Anexar ART" }),
		).not.toHaveFocus();
	});
});
