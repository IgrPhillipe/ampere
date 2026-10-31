import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { makeProjectDetail } from "@/test/fixtures/project-detail";

import { ProjectDetailHeader } from "./ProjectDetailHeader";

const cell = (label: string) => screen.getByText(label).nextElementSibling;
const technicalResponsibleCell = () => cell("Responsável técnico");

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

	it("lê as unidades e a demanda do resumo do projeto", () => {
		render(
			<ProjectDetailHeader
				project={makeProjectDetail({ consumerUnitsCount: 8, demandKva: 61.2 })}
			/>,
		);

		expect(cell("Unidades")).toHaveTextContent("08 unidades");
		expect(cell("Demanda")).toHaveTextContent(/^61,2 kVA$/);
	});

	it("indica o projeto ainda sem cálculo", () => {
		render(
			<ProjectDetailHeader
				project={makeProjectDetail({ consumerUnitsCount: 1, demandKva: null })}
			/>,
		);

		expect(cell("Unidades")).toHaveTextContent("01 unidade");
		expect(cell("Demanda")).toHaveTextContent("Sem cálculo");
	});
});
