import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";
import type { ProjectDocument } from "@services/submission";

import { PdfViewer } from "./PdfViewer";

interface DocumentDialogProps {
	projectId: string;
	/** `undefined` keeps the dialog closed. */
	document?: ProjectDocument;
	onClose: () => void;
}

export const DocumentDialog = ({
	projectId,
	document,
	onClose,
}: DocumentDialogProps) => (
	<Dialog
		open={document !== undefined}
		onOpenChange={(open) => {
			if (!open) onClose();
		}}
	>
		<DialogContent className="max-h-[90vh] gap-0 overflow-y-auto bg-card p-0 sm:max-w-4xl">
			<DialogHeader className="border-b border-border px-6 py-5 pr-12 text-left">
				<DialogTitle className="font-heading text-lg">
					{document?.typeLabel ?? "Documento"}
				</DialogTitle>
				<DialogDescription>{document?.filename}</DialogDescription>
			</DialogHeader>
			<div className="px-6 py-5">
				{document ? (
					<PdfViewer projectId={projectId} document={document} />
				) : null}
			</div>
		</DialogContent>
	</Dialog>
);
