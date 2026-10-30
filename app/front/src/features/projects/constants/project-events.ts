import type { UserRole } from "@features/shared";
import type { ProjectEvent, ProjectEventType } from "@services/project-events";

export const PROJECT_EVENT_LABELS = {
	CREATED: "Criado",
	SUBMITTED: "Enviado",
	PRE_VALIDATED: "Recebido",
	ASSIGNED: "Em Análise",
	REJECTED: "Reprovado",
	APPROVED: "Aprovado",
	FINDING_ANSWERED: "Apontamento Respondido",
	RESUBMITTED: "Reenviado",
} as const satisfies Record<ProjectEventType, string>;

/** The events only the designer produces; every other authored event is the analyst's. */
const DESIGNER_EVENTS = new Set<ProjectEventType>([
	"CREATED",
	"SUBMITTED",
	"FINDING_ANSWERED",
	"RESUBMITTED",
]);

const ROLE_LABELS = {
	user: "Projetista",
	reviewer: "Analista",
} as const satisfies Partial<Record<UserRole, string>>;

export const SYSTEM_AUTHOR_LABEL = "Sistema";

/** The admin acts as designer on their own projects and as analyst on the rest, so the event tells which. */
export const eventAuthorRoleLabel = ({
	type,
	authorRole,
}: Pick<ProjectEvent, "type" | "authorRole">) => {
	if (authorRole === null) return SYSTEM_AUTHOR_LABEL;
	if (authorRole !== "admin") return ROLE_LABELS[authorRole];

	return DESIGNER_EVENTS.has(type) ? ROLE_LABELS.user : ROLE_LABELS.reviewer;
};

/** The submissions carry the version they opened. */
export const eventLabel = ({
	type,
	version,
}: Pick<ProjectEvent, "type" | "version">) =>
	type === "SUBMITTED" || type === "RESUBMITTED"
		? `${PROJECT_EVENT_LABELS[type]} · Versão ${version}`
		: PROJECT_EVENT_LABELS[type];
