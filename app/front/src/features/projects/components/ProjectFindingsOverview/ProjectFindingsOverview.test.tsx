import { makeFinding } from "@services/project-review/mocks/factories";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectFindingsOverview } from "./ProjectFindingsOverview";

describe("ProjectFindingsOverview", () => {
	it("orders blocking findings before adjustments and starts a response", () => {
		const onStartResponse = vi.fn();
		const adjustment = makeFinding({
			id: "1",
			severity: "ADJUSTMENT",
			description: "Ajustar endereço.",
		});
		const blocking = makeFinding({
			id: "2",
			severity: "BLOCKING",
			description: "Substituir ART.",
		});

		render(
			<ProjectFindingsOverview
				findings={[adjustment, blocking]}
				reviewOpinion="Corrija os documentos indicados."
				isResponding={false}
				onOpenStage={vi.fn()}
				onStartResponse={onStartResponse}
				onSubmitResponse={vi.fn()}
				onCancelResponse={vi.fn()}
			/>,
		);

		const descriptions = screen.getAllByText(/Ajustar endereço|Substituir ART/);
		expect(descriptions[0]).toHaveTextContent("Substituir ART.");
		expect(screen.getByText("Corrija os documentos indicados.")).toBeVisible();

		fireEvent.click(screen.getAllByRole("button", { name: "Contestar" })[0]);
		expect(onStartResponse).toHaveBeenCalledWith(blocking, "CONTESTED");
	});

	it("shows the response already sent by the designer", () => {
		render(
			<ProjectFindingsOverview
				findings={[
					makeFinding({
						status: "CONTESTED",
						response: "O documento já está assinado na página 2.",
					}),
				]}
				isResponding={false}
				onOpenStage={vi.fn()}
				onStartResponse={vi.fn()}
				onSubmitResponse={vi.fn()}
				onCancelResponse={vi.fn()}
			/>,
		);

		expect(
			screen.getByText("O documento já está assinado na página 2."),
		).toBeVisible();
	});
});
