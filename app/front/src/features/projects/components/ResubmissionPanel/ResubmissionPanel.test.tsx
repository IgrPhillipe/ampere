import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ResubmissionPanel } from "./ResubmissionPanel";

describe("ResubmissionPanel", () => {
	it("blocks resubmission while blocking findings are unanswered", () => {
		render(
			<ResubmissionPanel
				nextVersion={2}
				unansweredBlocking={2}
				canSubmit={false}
				isPending={false}
				onSubmit={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole("button", { name: "Reenviar Projeto" }),
		).toBeDisabled();
		expect(
			screen.getByText(/Responda 2 apontamentos bloqueantes/),
		).toBeVisible();
	});

	it("submits the normalized change summary", async () => {
		const onSubmit = vi.fn();
		render(
			<ResubmissionPanel
				nextVersion={2}
				unansweredBlocking={0}
				canSubmit
				isPending={false}
				onSubmit={onSubmit}
			/>,
		);

		fireEvent.change(screen.getByLabelText(/Resumo das alterações/), {
			target: { value: "  Substituí a ART assinada.  " },
		});
		fireEvent.click(screen.getByRole("button", { name: "Reenviar Projeto" }));

		await waitFor(() =>
			expect(onSubmit).toHaveBeenCalledWith(
				{ changeSummary: "Substituí a ART assinada." },
				expect.anything(),
			),
		);
	});
});
