import type { CurrentUser, UserRole } from "@features/shared";
import { useAuthStore } from "@features/shared";
import type { Finding } from "@services/project-review";
import type { ProjectDetail } from "@services/projects";
import type { SubmissionChecklist } from "@services/submission";
import { vi } from "vitest";

export const makeProjectDetail = (
	overrides: Partial<ProjectDetail> = {},
): ProjectDetail => ({
	id: "4",
	name: "Residencial Boa Vista",
	address: "Rua da Aurora, 100",
	municipality: "Recife",
	state: "PE",
	postalCode: "50030230",
	protocol: "2026-1004",
	status: "UNDER_REVIEW",
	createdAt: "2026-10-01T12:00:00Z",
	updatedAt: "2026-10-02T12:00:00Z",
	submittedAt: "2026-10-02T12:00:00Z",
	ownerName: "Projetista Teste",
	reviewerName: "Admin Teste",
	reviewCycle: 1,
	reviewOpinion: null,
	changeSummary: null,
	technicalResponsible: { name: "Ana Lima", crea: "PE-123" },
	buildingType: "RESIDENTIAL_MULTIFAMILY",
	floors: 4,
	voltage: "V220_127",
	connectionType: "THREE_PHASE",
	entranceStandard: "COLLECTIVE",
	standards: [{ name: "DIS-NOR-030", revision: "Rev. 12" }],
	applicableStandards: "DIS-NOR-030",
	demandRules: [],
	...overrides,
});

export const makeFinding = (overrides: Partial<Finding> = {}): Finding => ({
	id: "1",
	projectId: "4",
	severity: "BLOCKING",
	stage: "DOCUMENTS",
	consumerUnitGroupId: null,
	calculationStepCode: null,
	documentType: "ART",
	description: "A ART não traz a assinatura do responsável técnico.",
	standardItem: null,
	authorId: "2",
	authorName: "Admin Teste",
	createdAt: "2026-10-04T13:00:00Z",
	version: 1,
	status: "OPEN",
	response: null,
	respondedAt: null,
	...overrides,
});

export const makeChecklist = (
	overrides: Partial<SubmissionChecklist> = {},
): SubmissionChecklist => ({
	items: [],
	documents: [],
	canSubmit: true,
	unansweredBlocking: 0,
	requiresChangeSummary: true,
	...overrides,
});

export const loadedQuery = <T>(data: T) => ({
	data,
	isPending: false,
	isError: false,
	refetch: vi.fn(),
});

export const idleMutation = (overrides: Record<string, unknown> = {}) => ({
	mutate: vi.fn(),
	isPending: false,
	isSuccess: false,
	error: null,
	...overrides,
});

export const signInAs = (
	role: UserRole,
	overrides: Partial<CurrentUser> = {},
) => {
	const user: CurrentUser = {
		id: "1",
		name: "Pessoa Teste",
		email: "pessoa@ampere.com",
		role,
		token: "token",
		mustChangePassword: false,
		...overrides,
	};

	useAuthStore.setState({ user, isAuthenticated: true });
};
