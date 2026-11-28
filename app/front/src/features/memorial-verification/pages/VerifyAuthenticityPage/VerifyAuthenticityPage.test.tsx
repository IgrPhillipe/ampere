import type { MemorialVerification } from "@services/project-versions";
import {
	verifyMemorialByCode,
	verifyMemorialByFile,
} from "@services/project-versions/requests";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	fireEvent,
	render as renderTree,
	screen,
	waitFor,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { VerifyAuthenticityPage } from "./VerifyAuthenticityPage";

vi.mock("@services/project-versions/requests", () => ({
	verifyMemorialByCode: vi.fn(),
	verifyMemorialByFile: vi.fn(),
}));

const byCode = vi.mocked(verifyMemorialByCode);
const byFile = vi.mocked(verifyMemorialByFile);

const render = (ui: ReactElement) =>
	renderTree(
		<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>,
	);

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
	documentType: "SUBMISSION_MEMORIAL",
	protocol: "2026-0481",
	version: 1,
	submittedAt: "2026-08-22T17:30:00Z",
	approvedAt: null,
	issuedAt: "2026-08-22T17:30:00Z",
	signature: null,
};

const NOT_VERIFIED: MemorialVerification = {
	verified: false,
	documentType: null,
	protocol: null,
	version: null,
	submittedAt: null,
	approvedAt: null,
	issuedAt: null,
	signature: null,
};

const answerWith = (result: MemorialVerification) => {
	byCode.mockResolvedValue({ data: result });
	byFile.mockResolvedValue({ data: result });
};

const typeCode = (code: string) =>
	fireEvent.change(screen.getByLabelText(/Código de Verificação/), {
		target: { value: code },
	});

describe("VerifyAuthenticityPage", () => {
	beforeEach(() => {
		byCode.mockReset();
		byFile.mockReset();
	});

	it("refuses a code that cannot be one", async () => {
		render(<VerifyAuthenticityPage />);
		typeCode("123");
		fireEvent.click(screen.getByRole("button", { name: "Verificar Código" }));

		expect(
			await screen.findByText(/O código tem 16 caracteres/),
		).toBeInTheDocument();
		expect(byCode).not.toHaveBeenCalled();
	});

	it("checks a code typed any way and names the registered version", async () => {
		answerWith(VERIFIED);
		render(<VerifyAuthenticityPage />);
		typeCode(" 7f3a 91c2 04bd 2e77 ");
		fireEvent.click(screen.getByRole("button", { name: "Verificar Código" }));

		await waitFor(() =>
			expect(byCode).toHaveBeenCalledWith("7F3A-91C2-04BD-2E77"),
		);
		expect(await screen.findByText("Documento Autêntico")).toBeInTheDocument();
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

		fireEvent.change(screen.getByLabelText("Arquivo do documento"), {
			target: { files: [file] },
		});

		await waitFor(() => expect(byFile).toHaveBeenCalledWith(file));
		expect(
			await screen.findByText("Documento Não Reconhecido"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Arquivo memorial-editado.pdf"),
		).toBeInTheDocument();
	});

	it("names the document type and a valid signature of an uploaded memorial", async () => {
		answerWith({ ...VERIFIED, signature: "VALID" });
		render(<VerifyAuthenticityPage />);

		fireEvent.change(screen.getByLabelText("Arquivo do documento"), {
			target: {
				files: [
					new File(["%PDF-1.7"], "memorial.pdf", { type: "application/pdf" }),
				],
			},
		});

		expect(await screen.findByText("Documento Autêntico")).toBeInTheDocument();
		expect(screen.getByText("Memorial do envio")).toBeInTheDocument();
		expect(screen.getByText("Válida, feita pelo AMPERE")).toBeInTheDocument();
		expect(screen.queryByText("Emitido em")).not.toBeInTheDocument();
	});

	it("verifies a spreadsheet of a draft and shows when it was issued", async () => {
		answerWith({
			...VERIFIED,
			documentType: "CALCULATION_SPREADSHEET",
			version: null,
			submittedAt: null,
			issuedAt: "2026-09-10T12:00:00Z",
		});
		render(<VerifyAuthenticityPage />);
		const file = new File(["PK"], "2026-0481-calculo.xlsx");

		fireEvent.change(screen.getByLabelText("Arquivo do documento"), {
			target: { files: [file] },
		});

		await waitFor(() => expect(byFile).toHaveBeenCalledWith(file));
		expect(await screen.findByText("Planilha de cálculo")).toBeInTheDocument();
		expect(screen.getByText("Rascunho, não enviada")).toBeInTheDocument();
		expect(screen.getByText("Emitido em")).toBeInTheDocument();
		expect(screen.getByText("10/09/2026 às 09:00")).toBeInTheDocument();
	});

	it("explains a memorial changed after its signature", async () => {
		answerWith({ ...NOT_VERIFIED, signature: "INVALID" });
		render(<VerifyAuthenticityPage />);

		fireEvent.change(screen.getByLabelText("Arquivo do documento"), {
			target: { files: [new File(["%PDF-1.7"], "memorial.pdf")] },
		});

		expect(
			await screen.findByText(/A assinatura digital não confere/),
		).toBeInTheDocument();
	});

	it("tells a signature made with another certificate", async () => {
		answerWith({ ...NOT_VERIFIED, signature: "UNTRUSTED" });
		render(<VerifyAuthenticityPage />);

		fireEvent.change(screen.getByLabelText("Arquivo do documento"), {
			target: { files: [new File(["%PDF-1.7"], "memorial.pdf")] },
		});

		expect(
			await screen.findByText(/não foi feita com o certificado do AMPERE/),
		).toBeInTheDocument();
	});

	it("checks the code of a link at once", async () => {
		answerWith(VERIFIED);
		render(<VerifyAuthenticityPage initialCode="7F3A-91C2-04BD-2E77" />);

		await waitFor(() => expect(byCode).toHaveBeenCalledOnce());
		expect(screen.getByLabelText(/Código de Verificação/)).toHaveValue(
			"7F3A-91C2-04BD-2E77",
		);
		expect(await screen.findByText("Documento Autêntico")).toBeInTheDocument();
	});

	it("shows the approval date of a memorial approved with reservations", async () => {
		answerWith({
			...VERIFIED,
			documentType: "APPROVAL_MEMORIAL",
			approvedAt: "2026-09-01T13:00:00Z",
			issuedAt: "2026-09-01T13:00:00Z",
		});
		render(<VerifyAuthenticityPage initialCode="7F3A-91C2-04BD-2E77" />);

		expect(
			await screen.findByText("Aprovado com ressalvas em"),
		).toBeInTheDocument();
		expect(screen.getByText("01/09/2026 às 10:00")).toBeInTheDocument();
		expect(
			screen.getByText("Memorial da aprovação com ressalvas"),
		).toBeInTheDocument();
	});

	it("hides the answer about a code once the next one fails validation", async () => {
		answerWith(VERIFIED);
		render(<VerifyAuthenticityPage initialCode="7F3A-91C2-04BD-2E77" />);
		expect(await screen.findByText("Documento Autêntico")).toBeInTheDocument();

		typeCode("ZZZZ-1234");
		fireEvent.click(screen.getByRole("button", { name: "Verificar Código" }));

		expect(
			await screen.findByText(/O código tem 16 caracteres/),
		).toBeInTheDocument();
		expect(screen.queryByText("Documento Autêntico")).not.toBeInTheDocument();
		expect(byCode).toHaveBeenCalledOnce();
	});
});
