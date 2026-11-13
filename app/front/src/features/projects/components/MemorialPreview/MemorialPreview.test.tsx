import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { MemorialPreview } from "./MemorialPreview";

vi.mock("@tanstack/react-router", async (importOriginal) => ({
	...(await importOriginal<typeof import("@tanstack/react-router")>()),
	Link: ({
		children,
		to,
		search,
	}: {
		children: ReactNode;
		to: string;
		search?: Record<string, string>;
	}) => (
		<a href={`${to}${search ? `?${new URLSearchParams(search)}` : ""}`}>
			{children}
		</a>
	),
}));

describe("MemorialPreview", () => {
	it("marks a draft memorial as a preview without a code", () => {
		render(<MemorialPreview stamp={null} />);

		expect(
			screen.getByRole("heading", { name: "Memorial Gerado" }),
		).toBeInTheDocument();
		expect(screen.getByText("Prévia")).toBeInTheDocument();
		expect(
			screen.getByText(/Prévia sem validade e sem código de verificação/),
		).toBeInTheDocument();
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
	});

	it("names the version and code of the official memorial", () => {
		render(
			<MemorialPreview
				stamp={{
					kind: "submission",
					version: 3,
					verificationCode: "7F3A-91C2-04BD-2E77",
				}}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Memorial do Envio" }),
		).toBeInTheDocument();
		expect(screen.getByText("Oficial · v03")).toBeInTheDocument();
		expect(
			screen.getByText(/PDF gravado no envio da versão 3/),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "7F3A-91C2-04BD-2E77" }),
		).toHaveAttribute(
			"href",
			"/verificar-autenticidade?codigo=7F3A-91C2-04BD-2E77",
		);
	});

	it("names the approval memorial with its own code", () => {
		render(
			<MemorialPreview
				stamp={{
					kind: "approval",
					version: 1,
					verificationCode: "14AD-9894-877C-3C4A",
					approvedAt: "2026-11-09T12:00:00Z",
				}}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Memorial da Aprovação" }),
		).toBeInTheDocument();
		expect(
			screen.getByText("Oficial · v01 · com ressalvas"),
		).toBeInTheDocument();
		expect(
			screen.getByText(/aprovação com ressalvas da versão 1, em 09\/11\/2026/),
		).toBeInTheDocument();
		expect(screen.queryByText(/gravado no envio/)).not.toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "14AD-9894-877C-3C4A" }),
		).toHaveAttribute(
			"href",
			"/verificar-autenticidade?codigo=14AD-9894-877C-3C4A",
		);
	});

	it("shows no preview or official label before it knows which one", () => {
		render(<MemorialPreview />);

		expect(
			screen.getByRole("heading", { name: "Memorial" }),
		).toBeInTheDocument();
		expect(screen.queryByText(/Prévia/)).not.toBeInTheDocument();
		expect(screen.queryByText(/Oficial/)).not.toBeInTheDocument();
	});
});
