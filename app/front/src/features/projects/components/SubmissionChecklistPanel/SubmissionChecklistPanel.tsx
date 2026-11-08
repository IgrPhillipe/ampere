import { ConclusionField } from "@components/ConclusionField";
import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { Finding } from "@services/project-review";
import type {
	ChecklistItem,
	DocumentType,
	ProjectDocument,
	SubmissionChecklist,
} from "@services/submission";
import { Check, Circle, Eye, Paperclip } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

import { FindingBadge } from "../FindingBadge";
import { DocumentDialog } from "../ProjectDocuments";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface SubmissionChecklistPanelProps {
	projectId: string;
	checklist?: SubmissionChecklist;
	isLoading?: boolean;
	findings?: Finding[];
	editable: boolean;
	/** Only the conferred items, without files or actions, as in the memorial. */
	summary?: boolean;
	uploadingType?: DocumentType;
	removingId?: string;
	onUpload?: (type: DocumentType, file: File) => void;
	onRemove?: (document: ProjectDocument) => void;
	className?: string;
}

const formatSize = (bytes: number) =>
	bytes < 1024 * 1024
		? `${Math.max(1, Math.round(bytes / 1024))} KB`
		: `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;

const isPdf = (file: File) =>
	file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

interface ItemProps {
	item: ChecklistItem;
	document?: ProjectDocument;
	editable: boolean;
	summary: boolean;
	isUploading: boolean;
	isRemoving: boolean;
	findings: Finding[];
	onUpload?: (type: DocumentType, file: File) => void;
	onRemove?: (document: ProjectDocument) => void;
	onView: (document: ProjectDocument) => void;
}

const Item = ({
	item,
	document,
	editable,
	summary,
	isUploading,
	isRemoving,
	findings,
	onUpload,
	onRemove,
	onView,
}: ItemProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const type = item.key === "CALCULATION" ? undefined : item.key;

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file || !type) return;

		if (!isPdf(file)) {
			toast.error("Envie o documento em PDF.");
			return;
		}
		if (file.size > MAX_FILE_SIZE) {
			toast.error("O arquivo passa do limite de 10 MB.");
			return;
		}

		onUpload?.(type, file);
	};

	const Icon = item.completed ? Check : Circle;

	return (
		<li
			className={cn(
				"flex items-start gap-3 border-b border-border-soft",
				summary ? "py-2" : "py-3",
				// The gutter marks only what still needs action.
				!item.completed && "-ml-3 border-l-2 border-l-attention pl-2.5",
			)}
		>
			<Icon
				aria-hidden="true"
				className={cn(
					"mt-0.5 size-4 shrink-0",
					item.completed ? "text-foreground" : "text-faint-foreground",
				)}
			/>

			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="text-sm text-foreground">
					{item.label}
					<span className="sr-only">
						{item.completed ? " (conferido)" : " (pendente)"}
					</span>
				</span>
				{summary ? null : (
					<>
						<FindingBadge
							findings={findings}
							target={`documento-${item.key}`}
							className="mt-1"
						/>
						{document ? (
							<span className="truncate font-mono text-xs text-muted-foreground">
								{document.filename} ({formatSize(document.fileSize)})
							</span>
						) : type ? (
							<span className="text-xs text-muted-foreground">
								Anexe o arquivo em PDF
							</span>
						) : item.completed ? null : (
							<span className="text-xs text-muted-foreground">
								Calcule a demanda na seção de cálculo
							</span>
						)}
					</>
				)}
			</div>

			{document && !editable && !summary ? (
				<Button
					type="button"
					variant="link"
					size="xs"
					className="h-auto px-0"
					aria-label={`Ver ${item.label}`}
					onClick={() => onView(document)}
				>
					<Eye aria-hidden="true" />
					Ver
				</Button>
			) : null}

			{type && editable && !summary ? (
				<div className="flex shrink-0 items-center gap-3">
					{document ? (
						<Button
							type="button"
							variant="link"
							size="xs"
							className="h-auto px-0"
							aria-label={`Ver ${item.label}`}
							onClick={() => onView(document)}
						>
							Ver
						</Button>
					) : null}
					<input
						ref={inputRef}
						type="file"
						accept="application/pdf,.pdf"
						className="sr-only"
						tabIndex={-1}
						aria-hidden="true"
						onChange={handleChange}
					/>
					<Button
						type="button"
						variant={document ? "link" : "outline"}
						size="xs"
						className={document ? "h-auto px-0" : undefined}
						disabled={isUploading}
						aria-label={`${document ? "Substituir" : "Anexar"} ${item.label}`}
						onClick={() => inputRef.current?.click()}
					>
						{document ? null : <Paperclip aria-hidden="true" />}
						{isUploading ? "Enviando" : document ? "Substituir" : "Anexar"}
					</Button>
					{document ? (
						<Button
							type="button"
							variant="destructive-ghost"
							size="xs"
							className="h-auto px-0"
							disabled={isRemoving}
							aria-label={`Remover ${item.label}`}
							onClick={() => onRemove?.(document)}
						>
							Remover
						</Button>
					) : null}
				</div>
			) : null}
		</li>
	);
};

export const SubmissionChecklistPanel = ({
	projectId,
	checklist,
	isLoading = false,
	findings = [],
	editable,
	summary = false,
	uploadingType,
	removingId,
	onUpload,
	onRemove,
	className,
}: SubmissionChecklistPanelProps) => {
	const [viewing, setViewing] = useState<ProjectDocument>();
	const done = checklist?.items.filter((item) => item.completed).length ?? 0;
	const total = checklist?.items.length ?? 0;

	return (
		<aside
			aria-labelledby="checagem-titulo"
			className={cn("flex flex-col px-6 py-8 md:px-9.5", className)}
		>
			<ConclusionField
				label={
					<span id="checagem-titulo" role="heading" aria-level={2}>
						Checagem Antes do Envio
					</span>
				}
				value={
					isLoading || !checklist ? undefined : (
						<span aria-live="polite">
							{padCount(done)}/{padCount(total)}
						</span>
					)
				}
				caption="Itens obrigatórios conferidos"
			>
				{isLoading || !checklist ? (
					<Skeleton className="h-14 w-36 bg-primary-foreground/20" />
				) : null}
			</ConclusionField>

			{isLoading || !checklist ? (
				<div className="mt-9.5 flex flex-col gap-3">
					{Array.from({ length: 4 }, (_, index) => (
						<Skeleton key={index} className="h-10 w-full" />
					))}
				</div>
			) : (
				<>
					{summary ? null : (
						<FindingBadge
							findings={findings.filter(
								(finding) => finding.documentType === null,
							)}
							className="mt-5"
						/>
					)}
					<ul className="mt-9.5 flex flex-col">
						{checklist.items.map((item) => {
							const document = checklist.documents.find(
								({ type }) => type === item.key,
							);

							return (
								<Item
									key={item.key}
									item={item}
									document={document}
									editable={editable}
									summary={summary}
									isUploading={uploadingType === item.key}
									isRemoving={
										document !== undefined && removingId === document.id
									}
									findings={findings.filter(
										(finding) => finding.documentType === item.key,
									)}
									onUpload={onUpload}
									onRemove={onRemove}
									onView={setViewing}
								/>
							);
						})}
					</ul>
				</>
			)}

			<section aria-labelledby="envio-segue-titulo" className="mt-9.5">
				<SectionHeading as="h3" id="envio-segue-titulo">
					O que Segue no Envio
				</SectionHeading>
				<p className="mt-3 text-sm text-muted-foreground">
					Memorial padronizado, memória de cálculo detalhada, ART, diagrama
					unifilar e planta de situação.
				</p>
			</section>

			<DocumentDialog
				projectId={projectId}
				document={viewing}
				onClose={() => setViewing(undefined)}
			/>
		</aside>
	);
};
