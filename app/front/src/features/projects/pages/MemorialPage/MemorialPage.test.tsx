import type { ProjectVersion } from "@services/project-versions";
import type { ProjectStatus } from "@services/projects";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadedQuery, makeProjectDetail } from "@/test/fixtures/project-detail";

import { MemorialPage } from "./MemorialPage";

const state = vi.hoisted(() => ({
	status: "UNDER_REVIEW" as ProjectStatus,
	versions: undefined as ProjectVersion[] | undefined,
	versionsFailed: false,
	versionsEnabled: [] as boolean[],
	versionsRefetch: vi.fn(),
}));

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProject: () =>
		loadedQuery({ data: makeProjectDetail({ status: state.status }) }),
}));

vi.mock("@services/calculation", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/calculation")>()),
	useGetLatestCalculation: () => ({
		...loadedQuery(undefined),
		isPending: true,
	}),
}));

vi.mock("@services/submission", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/submission")>()),
	useGetMemorial: () => ({
		...loadedQuery(undefined),
		isPending: true,
		error: null,
	}),
	useGetSubmission: () => ({ ...loadedQuery(undefined), isPending: true }),
}));

vi.mock("@services/project-versions", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/project-versions")>()),
	useGetProjectVersionList: (
		_projectId: string,
		{ enabled = true }: { enabled?: boolean } = {},
	) => {
		state.versionsEnabled.push(enabled);
		if (state.versionsFailed)
			return {
				...loadedQuery(undefined),
				isError: true,
				refetch: state.versionsRefetch,
			};
		return state.versions && enabled
			? loadedQuery({ data: state.versions })
			: { ...loadedQuery(undefined), isPending: true };
	},
}));

vi.mock("../../components", async (importOriginal) => ({
	...(await importOriginal<typeof import("../../components")>()),
	SubmissionChecklistPanel: () => null,
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
	...(await importOriginal<typeof import("@tanstack/react-router")>()),
	useNavigate: () => vi.fn(),
	Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}));

const versionOf = (number: number): ProjectVersion => ({
	number,
	submittedAt: `2026-08-2${number}T12:00:00Z`,
	authorName: "Ana Lima",
	changeSummary: null,
	demandKva: 46,
	documents: [],
	memorialSha256: "a".repeat(64),
	verificationCode: `7F3A-91C2-04BD-2E7${number}`,
	approvalMemorial: null,
});

describe("MemorialPage", () => {
	beforeEach(() => {
		state.status = "UNDER_REVIEW";
		state.versions = undefined;
		state.versionsFailed = false;
		state.versionsEnabled = [];
		state.versionsRefetch.mockClear();
	});

	it("labels a submitted memorial neither preview nor official until the versions arrive", () => {
		render(<MemorialPage projectId="4" />);

		expect(
			screen.getByRole("heading", { name: "Memorial" }),
		).toBeInTheDocument();
		expect(screen.queryByText(/Prévia/)).not.toBeInTheDocument();
	});

	it("names the latest version once the versions arrive", () => {
		state.versions = [versionOf(1), versionOf(2)];
		render(<MemorialPage projectId="4" />);

		expect(
			screen.getByRole("heading", { name: "Memorial do Envio" }),
		).toBeInTheDocument();
		expect(screen.getByText("Oficial · v02")).toBeInTheDocument();
	});

	it("marks the preview of an editable project without asking for the versions", () => {
		state.status = "REJECTED";
		state.versions = [versionOf(1)];
		render(<MemorialPage projectId="4" />);

		expect(screen.getByText("Prévia")).toBeInTheDocument();
		expect(state.versionsEnabled).not.toContain(true);
	});

	it("offers a retry instead of a preview label when the versions fail", () => {
		state.versionsFailed = true;
		render(<MemorialPage projectId="4" />);

		expect(screen.queryByText(/Prévia/)).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Tentar Novamente" }));
		expect(state.versionsRefetch).toHaveBeenCalled();
	});
});
