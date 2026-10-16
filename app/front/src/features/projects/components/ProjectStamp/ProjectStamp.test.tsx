import type { ProjectDetail } from "@services/projects";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectStamp } from "./ProjectStamp";

const project = (technicalResponsible: ProjectDetail["technicalResponsible"]) =>
	({
		standards: [{ name: "DIS-NOR-053", revision: "REV 06" }],
		createdAt: "2026-10-16T12:00:00Z",
		technicalResponsible,
	}) as unknown as ProjectDetail;

describe("ProjectStamp", () => {
	it("shows the owner's name and CREA as the technical responsible", () => {
		render(
			<ProjectStamp
				project={project({ name: "Carla Souza", crea: "654321/PE" })}
			/>,
		);

		expect(screen.getByText("Carla Souza, CREA 654321/PE")).toBeInTheDocument();
	});

	it("says it is not informed when the owner has no CREA", () => {
		render(<ProjectStamp project={project(null)} />);

		expect(screen.getAllByText("Não informado").length).toBeGreaterThan(0);
	});
});
