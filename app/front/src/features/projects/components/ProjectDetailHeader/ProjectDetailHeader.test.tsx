import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { makeProjectDetail } from "@/test/fixtures/project-detail";

import { ProjectDetailHeader } from "./ProjectDetailHeader";

const technicalResponsibleCell = () =>
	screen.getByText("Responsável técnico").nextElementSibling;

describe("ProjectDetailHeader", () => {
	it("mostra o nome e o CREA do responsável técnico", () => {
		render(
			<ProjectDetailHeader
				project={makeProjectDetail({
					technicalResponsible: { name: "Ana Lima", crea: "1684D/PE" },
				})}
			/>,
		);

		expect(technicalResponsibleCell()).toHaveTextContent(
			"Ana Lima, CREA 1684D/PE",
		);
	});

	it("não troca o responsável técnico pelo dono sem CREA", () => {
		render(
			<ProjectDetailHeader
				project={makeProjectDetail({
					technicalResponsible: null,
					ownerName: "Carlos Projetista",
				})}
			/>,
		);

		expect(technicalResponsibleCell()).toHaveTextContent("Não informado");
	});
});
