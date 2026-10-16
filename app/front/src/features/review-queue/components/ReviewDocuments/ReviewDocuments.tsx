import { EmptyState } from "@components/EmptyState";
import { InlineActionButton } from "@components/InlineActionButton";
import { Skeleton } from "@components/ui/skeleton";
import { formatDate, formatDecimal } from "@features/shared";
import { cn } from "@lib/utils";
import type { ProjectDocument } from "@services/submission";
import { FileText } from "lucide-react";
import { useState } from "react";

import { PdfViewer } from "./PdfViewer";

const formatFileSize = (bytes: number) => {
	if (bytes < 1024) return `${bytes} B`;

	return bytes < 1024 * 1024
		? `${formatDecimal(bytes / 1024, 0)} KB`
		: `${formatDecimal(bytes / (1024 * 1024), 1)} MB`;
};

interface ReviewDocumentsProps {
	projectId: string;
	documents?: ProjectDocument[];
	isLoading?: boolean;
	onCreateFinding?: (document: ProjectDocument) => void;
	className?: string;
}

export const ReviewDocuments = ({
	projectId,
	documents,
	isLoading = false,
	onCreateFinding,
	className,
}: ReviewDocumentsProps) => {
	const [selectedId, setSelectedId] = useState<string>();

	if (isLoading || !documents) {
		return (
			<div aria-busy="true" className={cn("flex flex-col gap-3", className)}>
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-12 w-full" />
			</div>
		);
	}

	if (documents.length === 0) {
		return (
			<EmptyState
				title="Nenhum documento anexado"
				description="O projeto foi enviado sem anexos."
				icon={FileText}
			/>
		);
	}

	const selected =
		documents.find((document) => document.id === selectedId) ?? documents[0];

	return (
		<div
			className={cn(
				"grid gap-6 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]",
				className,
			)}
		>
			<ul className="flex flex-col" aria-label="Documentos anexados">
				{documents.map((document) => {
					const isSelected = document.id === selected.id;

					return (
						<li
							key={document.id}
							className="flex flex-col gap-2 border-b border-border py-3"
						>
							<button
								type="button"
								aria-pressed={isSelected}
								onClick={() => setSelectedId(document.id)}
								className={cn(
									"flex flex-col gap-1 rounded-xs px-2 py-1 text-left transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
									isSelected && "bg-surface-hover",
								)}
							>
								<span className="text-sm font-medium text-foreground">
									{document.typeLabel}
								</span>
								<span className="truncate font-mono text-xs text-muted-foreground">
									{document.filename}
								</span>
								<span className="font-mono text-xs text-muted-foreground">
									{formatFileSize(document.fileSize)}, em{" "}
									<time dateTime={document.uploadedAt}>
										{formatDate(document.uploadedAt)}
									</time>
								</span>
							</button>

							{onCreateFinding ? (
								<InlineActionButton
									onClick={() => onCreateFinding(document)}
									className="ml-2 self-start"
								>
									Apontar Documento
								</InlineActionButton>
							) : null}
						</li>
					);
				})}
			</ul>

			<PdfViewer key={selected.id} projectId={projectId} document={selected} />
		</div>
	);
};
