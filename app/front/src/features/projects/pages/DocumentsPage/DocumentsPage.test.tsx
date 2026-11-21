import type { ProjectDocument } from "@services/submission";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	idleMutation,
	loadedQuery,
	makeChecklist,
	makeFinding,
	makeProjectDetail,
	signInAs,
} from "@/test/fixtures/project-detail";

import { ProjectWorkspaceContext } from "../../components";
import { DocumentsPage } from "./DocumentsPage";

const art: ProjectDocument = {
	id: "10",
	type: "ART",
	typeLabel: "ART",
	filename: "art-assinada.pdf",
	fileSize: 204800,
	uploadedAt: "2026-10-03T12:00:00Z",
};

const state = vi.hoisted(() => ({
	project: undefined as unknown,
	findings: [] as unknown[],
	upload: undefined as unknown as ReturnType<typeof idleMutation>,
	respondFinding: undefined as unknown as ReturnType<typeof idleMutation>,
}));

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProject: () => loadedQuery({ data: state.project }),
}));

vi.mock("@services/project-review", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/project-review")>()),
	useGetFindingList: () => loadedQuery({ data: state.findings }),
	useRespondFinding: () => state.respondFinding,
	useGetDocumentFile: () =>
		loadedQuery({
			filename: "art-assinada.pdf",
			blob: new Blob(["%PDF"], { type: "application/pdf" }),
		}),
}));

vi.mock("@services/submission", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/submission")>()),
	useGetSubmission: () =>
		loadedQuery({
			data: makeChecklist({
				items: [
					{ key: "CALCULATION", label: "Cálculo de demanda", completed: true },
					{ key: "ART", label: "ART", completed: true },
					{
						key: "SINGLE_LINE_DIAGRAM",
						label: "Diagrama unifilar",
						completed: false,
					},
				],
				documents: [art],
			}),
		}),
	useUploadDocument: () => state.upload,
	useDeleteDocument: () => idleMutation(),
}));

const renderPage = (onDocument?: (document: ProjectDocument) => void) =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<ProjectWorkspaceContext
				value={{
					reviewing: onDocument !== undefined,
					registrar: { onDocument },
				}}
			>
				<DocumentsPage projectId="4" />
			</ProjectWorkspaceContext>
		</QueryClientProvider>,
	);

describe("DocumentsPage", () => {
	// jsdom has no object URLs; keep the rest of `URL` intact.
	beforeEach(() => {
		state.findings = [];
		state.upload = idleMutation();
		state.respondFinding = idleMutation();
		URL.createObjectURL = vi.fn(() => "blob:documento");
		URL.revokeObjectURL = vi.fn();
	});

	afterEach(() => {
		Reflect.deleteProperty(URL, "createObjectURL");
		Reflect.deleteProperty(URL, "revokeObjectURL");
	});

	describe("while the designer can edit", () => {
		beforeEach(() => {
			signInAs("user");
			state.project = makeProjectDetail({ status: "DRAFT", ownerId: "1" });
		});

		it("lists each document once, in the checklist", () => {
			renderPage();

			expect(
				screen.queryByRole("heading", { name: "Documentos Anexados" }),
			).toBeNull();
			expect(
				screen.queryByRole("list", { name: "Documentos anexados" }),
			).toBeNull();
			expect(screen.getAllByText(/art-assinada\.pdf/)).toHaveLength(1);
			expect(
				screen.getByRole("region", { name: "Checagem Antes do Envio" }),
			).toBeVisible();
			expect(screen.queryByRole("complementary")).toBeNull();
			expect(
				screen.getByRole("button", { name: "Anexar Diagrama unifilar" }),
			).toBeVisible();
		});

		it("opens the viewer from the attached item, with a single download", () => {
			renderPage();

			fireEvent.click(screen.getByRole("button", { name: "Ver ART" }));

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("button", { name: "Baixar" }),
			).toBeVisible();
			expect(
				within(dialog).getByTitle("ART: art-assinada.pdf"),
			).toHaveAttribute("src", "blob:documento#toolbar=0");
			expect(within(dialog).getAllByText("art-assinada.pdf")).toHaveLength(1);
		});
	});

	describe("while a rejected project is corrected", () => {
		beforeEach(() => {
			signInAs("user");
			state.project = makeProjectDetail({ status: "REJECTED", ownerId: "1" });
			state.findings = [makeFinding()];
		});

		it("keeps the checklist editable and marks the pointed document", () => {
			renderPage();

			expect(
				screen.getByRole("region", { name: "Checagem Antes do Envio" }),
			).toBeVisible();
			expect(
				screen.queryByRole("heading", { name: "Documentos Anexados" }),
			).toBeNull();
			expect(
				screen.getByRole("button", { name: "Substituir ART" }),
			).toBeVisible();
			expect(screen.getByText(/1 apontamento neste item/)).toBeInTheDocument();
		});

		const pickFile = (button: string) => {
			const input = screen
				.getByRole("button", { name: button })
				.parentElement?.querySelector("input[type=file]");
			if (!input) throw new Error(`${button} input not found`);

			fireEvent.change(input, {
				target: {
					files: [
						new File(["%PDF"], "documento.pdf", { type: "application/pdf" }),
					],
				},
			});
		};

		const replaceArt = () => pickFile("Substituir ART");

		const prompt = { name: "Marcar o apontamento como corrigido?" };

		it("suggests the attachment of a document the project did not have", async () => {
			state.findings = [makeFinding({ documentType: "SINGLE_LINE_DIAGRAM" })];
			state.upload = {
				...idleMutation(),
				mutate: vi.fn((_args, options) =>
					options?.onSuccess?.({
						data: {
							...art,
							type: "SINGLE_LINE_DIAGRAM",
							typeLabel: "Diagrama unifilar",
						},
					}),
				),
			};
			renderPage();

			pickFile("Anexar Diagrama unifilar");

			const dialog = await screen.findByRole("dialog", prompt);
			expect(
				within(dialog).getByRole("textbox", { name: /Observação/ }),
			).toHaveValue("Anexei o documento Diagrama unifilar.");
		});

		it("asks to mark the pointed document as fixed after replacing it", async () => {
			state.upload = {
				...idleMutation(),
				mutate: vi.fn((_args, options) =>
					options?.onSuccess?.({ data: { ...art, filename: "art-nova.pdf" } }),
				),
			};
			renderPage();

			replaceArt();

			const dialog = await screen.findByRole("dialog", prompt);
			expect(
				within(dialog).getByRole("textbox", { name: /Observação/ }),
			).toHaveValue("Substituí o documento ART.");

			fireEvent.click(
				within(dialog).getByRole("button", { name: "Marcar Corrigido" }),
			);

			await waitFor(() => {
				expect(state.respondFinding.mutate).toHaveBeenCalledTimes(1);
			});
			expect(state.respondFinding.mutate.mock.calls[0][0]).toEqual({
				projectId: "4",
				findingId: "1",
				status: "FIXED",
				response: "Substituí o documento ART.",
			});
		});

		it("keeps the finding open when the designer declines", async () => {
			state.upload = {
				...idleMutation(),
				mutate: vi.fn((_args, options) => options?.onSuccess?.({ data: art })),
			};
			renderPage();

			replaceArt();
			const dialog = await screen.findByRole("dialog", prompt);
			fireEvent.click(
				within(dialog).getByRole("button", { name: "Manter Aberto" }),
			);

			await waitFor(() => {
				expect(screen.queryByRole("dialog", prompt)).not.toBeInTheDocument();
			});
			expect(state.respondFinding.mutate).not.toHaveBeenCalled();
		});

		it("does not ask before the upload succeeds", () => {
			renderPage();

			replaceArt();

			expect(state.upload.mutate).toHaveBeenCalledTimes(1);
			expect(screen.queryByRole("dialog", prompt)).not.toBeInTheDocument();
		});

		it("does not ask for a document without findings", async () => {
			state.findings = [makeFinding({ documentType: "SINGLE_LINE_DIAGRAM" })];
			state.upload = {
				...idleMutation(),
				mutate: vi.fn((_args, options) => options?.onSuccess?.({ data: art })),
			};
			renderPage();

			replaceArt();

			await waitFor(() => {
				expect(state.upload.mutate).toHaveBeenCalledTimes(1);
			});
			expect(screen.queryByRole("dialog", prompt)).not.toBeInTheDocument();
		});
	});

	describe("while the project awaits its submission", () => {
		beforeEach(() => {
			signInAs("user");
			state.project = makeProjectDetail({
				status: "AWAITING_SUBMISSION",
				ownerId: "1",
			});
		});

		it("keeps the documents open in the checklist", () => {
			renderPage();

			expect(
				screen.getByRole("region", { name: "Checagem Antes do Envio" }),
			).toBeVisible();
			expect(
				screen.queryByRole("list", { name: "Documentos anexados" }),
			).toBeNull();
			expect(screen.getByRole("button", { name: "Remover ART" })).toBeVisible();
			expect(
				screen.getByRole("button", { name: "Anexar Diagrama unifilar" }),
			).toBeVisible();
		});
	});

	describe("once the project is read-only", () => {
		beforeEach(() => {
			signInAs("admin", { id: "9" });
			state.project = makeProjectDetail({
				status: "UNDER_REVIEW",
				ownerId: "1",
			});
		});

		it("keeps the list and lets the analyst point at a document", () => {
			const onDocument = vi.fn();
			renderPage(onDocument);

			expect(
				screen.getByRole("heading", { name: "Documentos Anexados" }),
			).toBeVisible();
			expect(
				screen.queryByRole("heading", { name: "Checagem Antes do Envio" }),
			).toBeNull();

			fireEvent.click(
				screen.getByRole("button", { name: "Apontar Documento" }),
			);

			expect(onDocument).toHaveBeenCalledWith(art);
		});

		it("keeps the reader's toolbar for the analyst", () => {
			renderPage(vi.fn());

			expect(screen.getByTitle("ART: art-assinada.pdf")).toHaveAttribute(
				"src",
				"blob:documento",
			);
		});

		it("shows the list without the finding action to the designer", () => {
			signInAs("user");
			renderPage();

			expect(
				screen.getByRole("list", { name: "Documentos anexados" }),
			).toBeVisible();
			expect(
				screen.queryByRole("button", { name: "Apontar Documento" }),
			).toBeNull();
		});
	});
});
