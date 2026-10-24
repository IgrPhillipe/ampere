import type { Finding } from "@services/project-review";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FindingBadge } from "./FindingBadge";

const finding = (severity: Finding["severity"], description: string) =>
	({ severity, description }) as Finding;

describe("FindingBadge", () => {
	it("renders nothing without findings", () => {
		const { container } = render(<FindingBadge findings={[]} />);

		expect(container).toBeEmptyDOMElement();
	});

	it("explains the findings of the item to screen readers", () => {
		render(
			<FindingBadge
				findings={[
					finding("ADJUSTMENT", "Ajustar endereço."),
					finding("BLOCKING", "Substituir ART."),
				]}
			/>,
		);

		expect(
			screen.getByText(
				"2 apontamentos neste item. Ajustar endereço. Substituir ART. Corrija aqui e responda no aviso do topo da seção.",
			),
		).toBeInTheDocument();
	});
});
