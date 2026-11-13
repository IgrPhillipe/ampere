import type { ProjectVersion } from "@services/project-versions";
import type { ProjectStatus } from "@services/projects";

/** The official memorial: the one stored on submission, or the one of the approval with reservations. */
export type MemorialStamp =
	| { kind: "submission"; version: number; verificationCode: string | null }
	| {
			kind: "approval";
			version: number;
			verificationCode: string;
			approvedAt: string;
	  };

/** The API renders the memorial again only while the project is editable, as `Project.isEditable`. */
const EDITABLE_STATUSES: readonly ProjectStatus[] = ["DRAFT", "REJECTED"];

/** Whether the memorial may be a stored one, so the versions decide it. */
export const mayHaveOfficialMemorial = (status: ProjectStatus) =>
	!EDITABLE_STATUSES.includes(status);

export const latestVersion = (versions: readonly ProjectVersion[]) =>
	versions.reduce<ProjectVersion | undefined>(
		(latest, version) =>
			!latest || version.number > latest.number ? version : latest,
		undefined,
	);

/**
 * The stamp of the memorial the API serves, or null for a preview. A project that is not editable
 * but was never submitted has no version, and its memorial is still a preview.
 */
export const getMemorialStamp = (
	status: ProjectStatus,
	versions: readonly ProjectVersion[],
): MemorialStamp | null => {
	const latest = latestVersion(versions);

	if (!mayHaveOfficialMemorial(status) || !latest) return null;

	return latest.approvalMemorial
		? {
				kind: "approval",
				version: latest.number,
				verificationCode: latest.approvalMemorial.verificationCode,
				approvedAt: latest.approvalMemorial.issuedAt,
			}
		: {
				kind: "submission",
				version: latest.number,
				verificationCode: latest.verificationCode,
			};
};
