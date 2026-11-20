import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";
import type { ProjectDocument } from "@services/submission";

import { PdfViewer } from "./PdfViewer";

interface DocumentDialogProps {
	projectId: string;
	/** `undefined` keeps the dialog closed. */
	document?: ProjectDocument;
	/** See `PdfViewer`. */
	hideToolbar?: boolean;
	onClose: () => void;
}

export const DocumentDialog = ({
	projectId,
	document,
	hideToolbar,
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
			</DialogHeader>
			<div className="px-6 py-5">
				{document ? (
					<PdfViewer
						projectId={projectId}
						document={document}
						hideToolbar={hideToolbar}
					/>
				) : null}
			</div>
		</DialogContent>
	</Dialog>
);
