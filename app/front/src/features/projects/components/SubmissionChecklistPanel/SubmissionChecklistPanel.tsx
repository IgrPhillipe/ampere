import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type {
	ChecklistItem,
	DocumentType,
	ProjectDocument,
	SubmissionChecklist,
} from "@services/submission";
import { Check, Paperclip, TriangleAlert, X } from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface SubmissionChecklistPanelProps {
	checklist?: SubmissionChecklist;
	isLoading?: boolean;
	editable: boolean;
	uploadingType?: DocumentType;
	removingId?: string;
	onUpload: (type: DocumentType, file: File) => void;
	onRemove: (document: ProjectDocument) => void;
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
	isUploading: boolean;
	isRemoving: boolean;
	onUpload: (type: DocumentType, file: File) => void;
	onRemove: (document: ProjectDocument) => void;
}

const Item = ({
	item,
	document,
	editable,
	isUploading,
	isRemoving,
	onUpload,
	onRemove,
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

		onUpload(type, file);
	};

	return (
		<li className="flex items-start gap-3 border-b border-border py-3">
			{item.completed ? (
				<Check aria-hidden="true" className="mt-0.5 size-4 text-primary" />
			) : (
				<TriangleAlert
					aria-hidden="true"
					className="mt-0.5 size-4 text-destructive"
				/>
			)}

			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span
					className={cn(
						"text-sm",
						item.completed ? "text-foreground" : "text-destructive",
					)}
				>
					{item.label}
					<span className="sr-only">
						{item.completed ? " (conferido)" : " (pendente)"}
					</span>
				</span>
				{document ? (
					<span className="truncate text-xs text-muted-foreground">
						{document.filename} ({formatSize(document.fileSize)})
					</span>
				) : type ? (
					<span className="text-xs text-destructive">
						Anexe o arquivo em PDF
					</span>
				) : item.completed ? null : (
					<span className="text-xs text-destructive">
						Calcule a demanda na etapa anterior
					</span>
				)}
			</div>

			{type && editable ? (
				<div className="flex shrink-0 items-center gap-1">
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
						variant={document ? "ghost" : "outline"}
						size="xs"
						disabled={isUploading}
						aria-label={`${document ? "Substituir" : "Anexar"} ${item.label}`}
						onClick={() => inputRef.current?.click()}
					>
						<Paperclip aria-hidden="true" />
						{isUploading ? "Enviando" : document ? "Substituir" : "Anexar"}
					</Button>
					{document ? (
						<Button
							type="button"
							variant="destructive-ghost"
							size="icon-xs"
							disabled={isRemoving}
							aria-label={`Remover ${item.label}`}
							onClick={() => onRemove(document)}
						>
							<X aria-hidden="true" />
						</Button>
					) : null}
				</div>
			) : null}
		</li>
	);
};

export const SubmissionChecklistPanel = ({
	checklist,
	isLoading = false,
	editable,
	uploadingType,
	removingId,
	onUpload,
	onRemove,
	className,
}: SubmissionChecklistPanelProps) => {
	const done = checklist?.items.filter((item) => item.completed).length ?? 0;
	const total = checklist?.items.length ?? 0;

	return (
		<aside
			aria-labelledby="checagem-titulo"
			className={cn("flex flex-col bg-card px-6 py-8 md:px-8", className)}
		>
			<div className="rounded-xs bg-primary px-6 py-5 text-primary-foreground">
				<h2
					id="checagem-titulo"
					className="border-b border-primary-foreground/85 pb-3 font-mono text-xs tracking-[0.08em] text-primary-foreground/75 uppercase"
				>
					Checagem Antes do Envio
				</h2>

				{isLoading || !checklist ? (
					<Skeleton className="mt-6 h-14 w-36 bg-primary-foreground/20" />
				) : (
					<p
						aria-live="polite"
						className="mt-6 font-mono text-5xl font-medium tracking-tight"
					>
						{padCount(done)}/{padCount(total)}
					</p>
				)}

				<p className="mt-2 font-mono text-xs tracking-[0.08em] text-primary-foreground/75 uppercase">
					Itens obrigatórios conferidos
				</p>
			</div>

			{isLoading || !checklist ? (
				<div className="mt-6 flex flex-col gap-3">
					{Array.from({ length: 4 }, (_, index) => (
						<Skeleton key={index} className="h-10 w-full" />
					))}
				</div>
			) : (
				<ul className="mt-6 flex flex-col">
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
								isUploading={uploadingType === item.key}
								isRemoving={
									document !== undefined && removingId === document.id
								}
								onUpload={onUpload}
								onRemove={onRemove}
							/>
						);
					})}
				</ul>
			)}

			<div className="mt-10">
				<h3 className="border-b-2 border-foreground pb-3 text-base font-semibold">
					O que Segue no Envio
				</h3>
				<p className="mt-3 text-sm text-muted-foreground">
					Memorial padronizado, memória de cálculo detalhada, ART, diagrama
					unifilar e planta de situação.
				</p>
			</div>
		</aside>
	);
};
