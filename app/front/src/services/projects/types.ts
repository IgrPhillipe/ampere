import type {
	BuildingCategory,
	ConnectionType,
	EntranceStandard,
	ProjectStatus,
	SupplyVoltage,
} from "./schemas";

export interface ListProjectsParams {
	page?: number;
	pageSize?: number;
	status?: ProjectStatus;
	search?: string;
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
