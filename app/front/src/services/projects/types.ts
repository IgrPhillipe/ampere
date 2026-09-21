import type { ProjectStatus } from "./schemas";

export interface ListProjectsParams {
	page?: number;
	pageSize?: number;
	status?: ProjectStatus;
	search?: string;
}

export interface CreateProjectPayload {
	name: string;
	address: string;
	municipality: string;
	buildingType: string;
	floors: number;
	voltage: string;
	connectionType: string;
	entranceStandard: string;
}
