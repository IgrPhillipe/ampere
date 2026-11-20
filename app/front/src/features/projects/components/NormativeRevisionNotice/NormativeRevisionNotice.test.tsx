import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NormativeRevisionNotice } from "./NormativeRevisionNotice";

describe("NormativeRevisionNotice", () => {
	it("explains the original submission date used by the calculation and memorial", () => {
		render(<NormativeRevisionNotice fixedAt="2026-10-15T12:00:00Z" />);
		expect(screen.getByRole("status")).toHaveTextContent(
			/primeiro envio do protocolo, em 15\/10\/2026/,
		);
	});

	it("does not claim fixed revisions for a draft", () => {
		render(<NormativeRevisionNotice />);
		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});
});
