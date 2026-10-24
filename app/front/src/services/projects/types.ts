import type { SortDirection } from "@features/shared";
import type { BrazilianState } from "@services/locations";

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
	state?: BrazilianState[];
	municipality?: string[];
	/** `YYYY-MM-DD`, inclusive. */
	createdFrom?: string;
	/** `YYYY-MM-DD`, inclusive. */
	createdTo?: string;
	findings?: ProjectFindingsFilter[];
	owner?: string;
}

/** Corpo de `POST /projects`: os campos da US02. */
export interface CreateProjectPayload {
	name: string;
	postalCode: string;
	state: BrazilianState;
	municipality: string;
	address: string;
	buildingType: BuildingCategory;
	floors: number;
	voltage: SupplyVoltage;
	connectionType: ConnectionType;
	entranceStandard: EntranceStandard;
}
