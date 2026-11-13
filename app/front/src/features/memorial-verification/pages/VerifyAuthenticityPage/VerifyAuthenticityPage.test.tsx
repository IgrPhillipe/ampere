import type { MemorialVerification } from "@services/project-versions";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { VerifyAuthenticityPage } from "./VerifyAuthenticityPage";

const mockVerify = vi.fn();

vi.mock("@services/project-versions", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/project-versions")>()),
	useVerifyMemorial: () => ({ mutate: mockVerify, isPending: false }),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
	...(await importOriginal<typeof import("@tanstack/react-router")>()),
	Link: ({
		children,
		className,
	}: {
		children: ReactNode;
		className?: string;
	}) => (
		<a href="/" className={className}>
			{children}
		</a>
	),
}));

const VERIFIED: MemorialVerification = {
	verified: true,
	protocol: "2026-0481",
	version: 1,
	submittedAt: "2026-08-22T17:30:00Z",
	approvedAt: null,
};

const NOT_VERIFIED: MemorialVerification = {
	verified: false,
	protocol: null,
	version: null,
	submittedAt: null,
	approvedAt: null,
};

const answerWith = (result: MemorialVerification) =>
	mockVerify.mockImplementation((_input, options) =>
		options.onSuccess({ data: result }),
	);

const typeCode = (code: string) =>
	fireEvent.change(screen.getByLabelText(/Código de Verificação/), {
		target: { value: code },
	});

describe("VerifyAuthenticityPage", () => {
	beforeEach(() => {
		mockVerify.mockReset();
	});

	it("refuses a code that cannot be one", async () => {
		render(<VerifyAuthenticityPage />);
		typeCode("123");
		fireEvent.click(screen.getByRole("button", { name: "Verificar Código" }));

		expect(
			await screen.findByText(/O código tem 16 caracteres/),
		).toBeInTheDocument();
		expect(mockVerify).not.toHaveBeenCalled();
	});

	it("checks a code typed any way and names the registered version", async () => {
		answerWith(VERIFIED);
		render(<VerifyAuthenticityPage />);
		typeCode(" 7f3a 91c2 04bd 2e77 ");
		fireEvent.click(screen.getByRole("button", { name: "Verificar Código" }));

		await waitFor(() =>
			expect(mockVerify).toHaveBeenCalledWith(
				{ by: "code", code: "7F3A-91C2-04BD-2E77" },
				expect.anything(),
			),
		);
		expect(screen.getByText("Memorial autêntico")).toBeInTheDocument();
		expect(screen.getByText("2026-0481")).toBeInTheDocument();
		expect(screen.getByText("22/08/2026 às 14:30")).toBeInTheDocument();
		expect(screen.getByText("Código 7F3A-91C2-04BD-2E77")).toBeInTheDocument();
	});

	it("tells when an uploaded PDF matches no version", async () => {
		answerWith(NOT_VERIFIED);
		render(<VerifyAuthenticityPage />);
		const file = new File(["%PDF-1.7"], "memorial-editado.pdf", {
			type: "application/pdf",
		});

		fireEvent.change(screen.getByLabelText("PDF do memorial"), {
			target: { files: [file] },
		});

		expect(mockVerify).toHaveBeenCalledWith(
			{ by: "file", file },
			expect.anything(),
		);
		expect(
			await screen.findByText("Documento não reconhecido"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Arquivo memorial-editado.pdf"),
		).toBeInTheDocument();
	});

	it("checks the code of a link at once", async () => {
		answerWith(VERIFIED);
		render(<VerifyAuthenticityPage initialCode="7F3A-91C2-04BD-2E77" />);

		await waitFor(() => expect(mockVerify).toHaveBeenCalledOnce());
		expect(screen.getByLabelText(/Código de Verificação/)).toHaveValue(
			"7F3A-91C2-04BD-2E77",
		);
		expect(await screen.findByText("Memorial autêntico")).toBeInTheDocument();
	});

	it("shows the approval date of a memorial approved with reservations", async () => {
		answerWith({ ...VERIFIED, approvedAt: "2026-09-01T13:00:00Z" });
		render(<VerifyAuthenticityPage initialCode="7F3A-91C2-04BD-2E77" />);

		expect(
			await screen.findByText("Aprovado com ressalvas em"),
		).toBeInTheDocument();
		expect(screen.getByText("01/09/2026 às 10:00")).toBeInTheDocument();
	});
});
