import type {
	IssuedDocumentType,
	SignatureStatus,
} from "@services/project-versions";

export const DOCUMENT_TYPE_LABELS: Record<IssuedDocumentType, string> = {
	SUBMISSION_MEMORIAL: "Memorial do envio",
	APPROVAL_MEMORIAL: "Memorial da aprovação com ressalvas",
	CALCULATION_SPREADSHEET: "Planilha de cálculo",
};

/** Shown beside an authentic PDF. */
export const SIGNATURE_LABELS: Record<"VALID" | "ABSENT", string> = {
	VALID: "Válida, feita pelo AMPERE",
	ABSENT: "Sem assinatura, emitido antes dela",
};

/** Why a file was not recognized, when its signature tells. */
export const REFUSAL_REASONS: Partial<Record<SignatureStatus, string>> = {
	INVALID:
		"A assinatura digital não confere: o arquivo foi alterado depois de emitido.",
	UNTRUSTED:
		"O arquivo tem uma assinatura digital, mas ela não foi feita com o certificado do AMPERE.",
};

export const ACCEPTED_FILES =
	"application/pdf,.pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx";
