import type { DocumentType } from "@services/submission";

export interface CompareProjectVersionsParams {
	projectId: string;
	from: number;
	to: number;
}

/** A file frozen in the version: its memorial, the approval one, or a document as sent. */
export type VersionFile =
	| { kind: "memorial" }
	| { kind: "approval-memorial" }
	| { kind: "document"; type: DocumentType };

export interface VersionFileParams {
	projectId: string;
	version: number;
	file: VersionFile;
}
