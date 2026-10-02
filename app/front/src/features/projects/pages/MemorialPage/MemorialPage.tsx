import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import {
	useGetProject,
	useSubmitProject,
	useUploadDocument,
} from "@services/projects";
import { useNavigate } from "@tanstack/react-router";
import {
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
	Check,
	Download,
	Paperclip,
} from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";

import { ProjectStamp, ProjectStepper } from "../../components";

interface MemorialPageProps {
	projectId: string;
}

const DOC_TYPES = [
	{ id: "art", label: "ART do responsável técnico" },
	{ id: "unifiliar", label: "Diagrama unifilar em PDF" },
	{ id: "planta", label: "Planta de situação" },
] as const;

type DocType = (typeof DOC_TYPES)[number]["id"];

export const MemorialPage = ({ projectId }: MemorialPageProps) => {
	const navigate = useNavigate();
	const projectQuery = useGetProject(projectId);
	const project = projectQuery.data?.data;

	const submitMutation = useSubmitProject();
	const uploadMutation = useUploadDocument();

	const [uploadedDocs, setUploadedDocs] = useState<Set<DocType>>(new Set());
	const fileInputRefs = useRef<Partial<Record<DocType, HTMLInputElement>>>({});

	const checklist = [
		{ id: "dados", label: "Dados da edificação completos", done: true },
		{ id: "ucs", label: "Unidades consumidoras classificadas", done: true },
		{
			id: "calculo",
			label: "Cálculo de demanda sem inconsistências",
			done: true,
		},
		...DOC_TYPES.map((d) => ({
			id: d.id,
			label: d.label,
			done: uploadedDocs.has(d.id),
			docType: d.id,
		})),
	];

	const doneCount = checklist.filter((i) => i.done).length;
	const total = checklist.length;
	const canSubmit = doneCount === total;

	const handleFileChange = async (
		e: ChangeEvent<HTMLInputElement>,
		docType: DocType,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		await uploadMutation.mutateAsync({ id: projectId, docType, file });
		setUploadedDocs((prev) => new Set([...prev, docType]));
	};

	const handleSubmit = async () => {
		await submitMutation.mutateAsync(projectId);
		await navigate({ to: "/", replace: true });
	};

	const backToCalculo = () =>
		void navigate({ to: "/projetos/$id/calculo", params: { id: projectId } });

	return (
		<PageLayout
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<div className="flex flex-1 flex-col bg-card">
				<ProjectStamp project={project} isLoading={projectQuery.isPending} />

				<div className="px-6 pt-8 md:px-8">
					<p className="text-xs tracking-wider text-muted-foreground uppercase">
						Etapa 04 — Documentação
					</p>
					<h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
						Memorial
					</h1>
				</div>

				<ProjectStepper current={3} className="mt-6" />

				<div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_380px]">
					{/* ── Coluna esquerda: preview do memorial ── */}
					<div className="flex flex-col gap-6 px-6 py-8 md:px-8">
						<h2 className="text-base font-semibold">Memorial gerado</h2>

						<div className="rounded-lg border border-border bg-background p-6 text-sm">
							<p className="text-center font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
								Memorial Descritivo de Cálculo de Demanda
							</p>
							<p className="mt-1 text-center text-xs text-muted-foreground">
								{project
									? project.standards
											.map(({ name, revision }) => `${name} ${revision}`)
											.join(" e ")
									: "—"}
								{" · "}
								{project?.name ?? "—"}
							</p>

							<ol className="mt-6 space-y-2">
								{[
									["01 Identificação do projeto", "p. 01"],
									["02 Unidades consumidoras", "p. 01"],
									["03 Memória de cálculo", "p. 02"],
									["04 Responsável técnico e ART", "p. 04"],
								].map(([title, page]) => (
									<li key={title} className="flex justify-between">
										<span className="text-foreground">{title}</span>
										<span className="font-mono text-xs text-muted-foreground">
											{page}
										</span>
									</li>
								))}
							</ol>

							<div className="mt-8 border-t border-border pt-6 text-center">
								<p className="text-xs text-muted-foreground uppercase tracking-wider">
									Demanda Total Apurada
								</p>
								<p className="mt-1 font-heading text-4xl font-bold">
									{project ? "—" : "—"} kVA
								</p>
							</div>
						</div>

						<Button
							variant="outline"
							className="w-fit gap-2"
							onClick={() => {
								/* PDF download — não implementado nesta iteração */
							}}
						>
							<Download className="size-4" aria-hidden="true" />
							Baixar PDF
						</Button>
					</div>

					{/* ── Coluna direita: checklist ── */}
					<div className="border-t border-border px-6 py-8 md:px-8 lg:border-t-0 lg:border-l">
						<div className="rounded-lg bg-primary px-5 py-4 text-primary-foreground">
							<p className="text-xs font-semibold uppercase tracking-widest">
								Checkagem antes do envio
							</p>
							<p className="mt-2 font-heading text-5xl font-bold">
								{String(doneCount).padStart(2, "0")}/
								{String(total).padStart(2, "0")}
							</p>
							<p className="mt-1 text-xs uppercase tracking-wider opacity-80">
								Itens obrigatórios conferidos
							</p>
						</div>

						<ul className="mt-6 space-y-3">
							{checklist.map((item) => (
								<li key={item.id} className="flex items-center gap-3">
									{item.done ? (
										<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary">
											<Check
												className="size-3 text-primary-foreground"
												aria-hidden="true"
											/>
										</span>
									) : (
										<span className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-destructive">
											<AlertTriangle
												className="size-3 text-destructive"
												aria-hidden="true"
											/>
										</span>
									)}
									<span
										className={
											item.done ? "text-sm" : "text-sm text-destructive"
										}
									>
										{item.label}
									</span>
									{"docType" in item && !item.done && (
										<>
											<input
												type="file"
												accept="application/pdf"
												className="sr-only"
												ref={(el) => {
													if (el)
														fileInputRefs.current[item.docType as DocType] = el;
												}}
												onChange={(e) =>
													void handleFileChange(e, item.docType as DocType)
												}
											/>
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="ml-auto gap-1.5 text-xs"
												onClick={() =>
													fileInputRefs.current[
														item.docType as DocType
													]?.click()
												}
											>
												<Paperclip className="size-3" aria-hidden="true" />
												Anexar
											</Button>
										</>
									)}
								</li>
							))}
						</ul>

						<div className="mt-8 rounded-lg border border-border bg-muted/40 p-4">
							<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								O que segue no envio
							</p>
							<p className="mt-2 text-sm text-muted-foreground">
								Memorial padronizado · memória de cálculo detalhada · ART ·
								plantas.
							</p>
						</div>
					</div>
				</div>

				{/* ── Rodapé de ações ── */}
				<div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4 md:px-8">
					<Button
						type="button"
						variant="outline"
						size="icon"
						aria-label="Voltar para Cálculo de Demanda"
						onClick={backToCalculo}
					>
						<ArrowLeft aria-hidden="true" />
					</Button>

					<Button
						type="button"
						disabled={!canSubmit || submitMutation.isPending}
						onClick={() => void handleSubmit()}
					>
						Enviar para análise
						<ArrowRight aria-hidden="true" />
					</Button>
				</div>
			</div>
		</PageLayout>
	);
};
