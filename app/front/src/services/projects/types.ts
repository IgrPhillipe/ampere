import type { SortDirection } from "@features/shared";

import type {
	BuildingCategory,
	ConnectionType,
	EntranceStandard,
	ProjectFindingsFilter,
	ProjectSort,
	ProjectStatus,
	SupplyVoltage,
} from "./schemas";

export interface ListProjectsParams {
	page?: number;
	pageSize?: number;
	status?: ProjectStatus;
	search?: string;
	sort?: ProjectSort;
	direction?: SortDirection;
	municipality?: string;
	/** `YYYY-MM-DD`, inclusive. */
	createdFrom?: string;
	/** `YYYY-MM-DD`, inclusive. */
	createdTo?: string;
	findings?: ProjectFindingsFilter;
	/** The designer's id; only the admin offers it. */
	owner?: string;
}

/** Corpo de `POST /projects` — os oito campos da US02. */
export interface CreateProjectPayload {
	name: string;
	address: string;
	municipality: string;
	buildingType: BuildingCategory;
	floors: number;
	voltage: SupplyVoltage;
	connectionType: ConnectionType;
	entranceStandard: EntranceStandard;
}
