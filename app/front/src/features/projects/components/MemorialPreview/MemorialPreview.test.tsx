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
				stamp={{ version: 3, verificationCode: "7F3A-91C2-04BD-2E77" }}
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
});
