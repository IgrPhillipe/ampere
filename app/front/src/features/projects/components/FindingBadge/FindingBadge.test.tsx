import type { Finding } from "@services/project-review";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FindingBadge } from "./FindingBadge";

const finding = (severity: Finding["severity"]) => ({ severity }) as Finding;

describe("FindingBadge", () => {
	it("renders nothing without findings", () => {
		const { container } = render(<FindingBadge findings={[]} />);

		expect(container).toBeEmptyDOMElement();
	});

	it("keeps the count out of the status badge", () => {
		render(
			<FindingBadge findings={[finding("ADJUSTMENT"), finding("BLOCKING")]} />,
		);

		expect(screen.getByText("Apontamento")).toBeVisible();
		expect(screen.getByText("02")).toBeVisible();
	});
});
