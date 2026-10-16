import { EmptyState } from "@components/EmptyState";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { cn } from "@lib/utils";
import { useGetDocumentFile } from "@services/project-review";
import type { ProjectDocument } from "@services/submission";
import { CircleAlert, Download } from "lucide-react";
import { useEffect, useRef } from "react";

interface PdfViewerProps {
	projectId: string;
	document: ProjectDocument;
	className?: string;
}

export const PdfViewer = ({
	projectId,
	document,
	className,
}: PdfViewerProps) => {
	const fileQuery = useGetDocumentFile(projectId, document.id);
	const frameRef = useRef<HTMLIFrameElement>(null);
	const blob = fileQuery.data?.blob;

	useEffect(() => {
		const frame = frameRef.current;
		if (!blob || !frame) return;

		const url = URL.createObjectURL(blob);
		frame.src = url;

		return () => URL.revokeObjectURL(url);
	}, [blob]);

	const download = () => {
		const file = fileQuery.data;
		if (!file) return;

		const url = URL.createObjectURL(file.blob);
		const link = window.document.createElement("a");
		link.href = url;
		link.download = file.filename;
		link.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className={cn("flex min-h-[32rem] flex-col gap-3", className)}>
			<div className="flex items-center justify-between gap-3">
				<p className="truncate font-mono text-xs text-muted-foreground">
					{document.filename}
				</p>
				<Button
					type="button"
					variant="link"
					size="xs"
					disabled={!fileQuery.data}
					onClick={download}
				>
					<Download aria-hidden="true" />
					Baixar
				</Button>
			</div>

			{fileQuery.isError ? (
				<EmptyState
					title="Não foi possível abrir o documento"
					description="Confira o aviso exibido e tente novamente."
					icon={CircleAlert}
					action={
						<Button
							type="button"
							variant="outline"
							onClick={() => void fileQuery.refetch()}
						>
							Tentar Novamente
						</Button>
					}
				/>
			) : blob ? (
				<iframe
					ref={frameRef}
					title={`${document.typeLabel}: ${document.filename}`}
					className="min-h-[32rem] w-full flex-1 rounded-xs border border-border bg-surface-hover"
				/>
			) : (
				<Skeleton className="min-h-[32rem] w-full flex-1" />
			)}
		</div>
	);
};
