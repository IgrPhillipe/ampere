import type {
	Project,
	ProjectListResponse,
	ProjectStatusCounts,
} from "../schemas";

export const MOCK_PROJECTS: Project[] = [
	{
		id: "1",
		name: "Edifício Residencial Aurora",
		address: "Rua da Aurora, 1240",
		municipality: "Recife/PE",
		protocol: "2026-0476",
		status: "UNDER_REVIEW",
		updatedAt: "2026-09-18T10:30:00",
		pendingCount: 0,
	},
	{
		id: "2",
		name: "Condomínio Vila Nova",
		address: "Avenida Barreto de Menezes, 88",
		municipality: "Jaboatão dos Guararapes/PE",
		protocol: "2026-0475",
		status: "REJECTED",
		updatedAt: "2026-09-14T14:20:00",
		pendingCount: 3,
	},
	{
		id: "3",
		name: "Comercial Praça Sul",
		address: "Rua do Sol, 302",
		municipality: "Olinda/PE",
		protocol: "2026-0459",
		status: "APPROVED",
		updatedAt: "2026-08-12T09:15:00",
		pendingCount: 0,
	},
	{
		id: "4",
		name: "Residencial Monte Verde",
		address: "Rodovia BR-104, km 8",
		municipality: "Caruaru/PE",
		protocol: "2026-0441",
		status: "DRAFT",
		updatedAt: "2026-09-18T09:40:00",
		pendingCount: 0,
	},
	{
		id: "5",
		name: "Edifício Torre Norte",
		address: "Avenida Norte, 4501",
		municipality: "Recife/PE",
		protocol: "2026-0438",
		status: "AWAITING_SUBMISSION",
		updatedAt: "2026-09-09T11:00:00",
		pendingCount: 0,
	},
	{
		id: "6",
		name: "Galpão Logístico Imbiribeira",
		address: "Rua Senador José Henrique, 77",
		municipality: "Recife/PE",
		protocol: "2026-0420",
		status: "UNDER_REVIEW",
		updatedAt: "2026-09-11T16:45:00",
		pendingCount: 0,
	},
	{
		id: "7",
		name: "Centro Empresarial Capibaribe",
		address: "Rua Benfica, 715",
		municipality: "Recife/PE",
		protocol: "2026-0402",
		status: "APPROVED",
		updatedAt: "2026-09-03T08:20:00",
		pendingCount: 0,
	},
	{
		id: "8",
		name: "Residencial Boa Viagem",
		address: "Avenida Conselheiro Aguiar, 2800",
		municipality: "Recife/PE",
		protocol: "2026-0397",
		status: "UNDER_REVIEW",
		updatedAt: "2026-09-02T13:10:00",
		pendingCount: 0,
	},
	{
		id: "9",
		name: "Mercado Público das Graças",
		address: "Rua das Graças, 210",
		municipality: "Recife/PE",
		protocol: "2026-0374",
		status: "REJECTED",
		updatedAt: "2026-08-29T15:35:00",
		pendingCount: 1,
	},
	{
		id: "10",
		name: "Condomínio Jardins do Atlântico",
		address: "Rua Setúbal, 980",
		municipality: "Recife/PE",
		protocol: "2026-0351",
		status: "APPROVED",
		updatedAt: "2026-08-21T10:05:00",
		pendingCount: 0,
	},
	{
		id: "11",
		name: "Hospital Metropolitano",
		address: "Avenida Belmiro Correia, 1500",
		municipality: "Camaragibe/PE",
		protocol: "2026-0336",
		status: "UNDER_REVIEW",
		updatedAt: "2026-08-18T17:00:00",
		pendingCount: 0,
	},
	{
		id: "12",
		name: "Complexo Solar Agreste",
		address: "Estrada de Serra Verde, km 12",
		municipality: "Garanhuns/PE",
		protocol: "2026-0318",
		status: "DRAFT",
		updatedAt: "2026-08-10T12:25:00",
		pendingCount: 0,
	},
];

export const MOCK_PROJECT_UCS: Record<string, string[]> = {
	"1": ["UC-58231", "UC-58232"],
	"2": ["UC-47110"],
	"3": ["UC-39008"],
	"4": ["UC-28442"],
	"5": ["UC-19870", "UC-19871"],
	"6": ["UC-10456"],
};

export const makeProject = (overrides?: Partial<Project>): Project => ({
	...MOCK_PROJECTS[0],
	...overrides,
});

export const makeProjectStatusCounts = (
	projects: Project[] = MOCK_PROJECTS,
): ProjectStatusCounts => ({
	total: projects.length,
	draft: projects.filter(({ status }) => status === "DRAFT").length,
	awaitingSubmission: projects.filter(
		({ status }) => status === "AWAITING_SUBMISSION",
	).length,
	underReview: projects.filter(({ status }) => status === "UNDER_REVIEW")
		.length,
	rejected: projects.filter(({ status }) => status === "REJECTED").length,
	approved: projects.filter(({ status }) => status === "APPROVED").length,
});

interface MakeProjectListOptions {
	projects?: Project[];
	total?: number;
	page?: number;
	pageSize?: number;
	statusCounts?: ProjectStatusCounts;
}

export const makeProjectList = ({
	projects = MOCK_PROJECTS,
	total = projects.length,
	page = 1,
	pageSize = 20,
	statusCounts = makeProjectStatusCounts(),
}: MakeProjectListOptions = {}): ProjectListResponse => ({
	data: { projects, statusCounts },
	pagination: { total, page, pageSize },
});
