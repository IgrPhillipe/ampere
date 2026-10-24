import type { DocumentType } from "./schemas";

export interface UploadDocumentParams {
	projectId: string;
	type: DocumentType;
	file: File;
}

export interface DeleteDocumentParams {
	projectId: string;
	documentId: string;
}

export interface SubmitProjectParams {
	projectId: string;
	changeSummary?: string;
}

export interface Memorial {
	filename: string;
	blob: Blob;
}
