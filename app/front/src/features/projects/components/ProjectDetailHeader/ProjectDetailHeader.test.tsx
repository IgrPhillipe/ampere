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

	it("mostra a data da aprovação de um projeto expirado", () => {
		render(
			<ProjectDetailHeader
				project={makeProjectDetail({
					status: "EXPIRED",
					reviewedAt: "2023-11-09T15:00:00Z",
					reviewDeadline: null,
					deadlineStatus: null,
					daysRemaining: null,
				})}
			/>,
		);

		expect(cell("Aprovado em")).toHaveTextContent("09/11/2023");
	});

	it("mostra a data da última movimentação", () => {
		render(
			<ProjectDetailHeader
				project={makeProjectDetail({
					lastActivityAt: "2026-10-20T15:00:00Z",
				})}
			/>,
		);

		expect(cell("Última movimentação")).toHaveTextContent("20/10/2026");
	});

	it("mostra o prazo de retorno e o analista responsável", () => {
		render(
			<ProjectDetailHeader
				project={makeProjectDetail({
					reviewDeadline: "2026-11-01",
					reviewerName: "Alice Analista",
				})}
			/>,
		);

		expect(cell("Retorno até")).toHaveTextContent("01/11/2026");
		expect(cell("Retorno até")).toHaveTextContent("30 dias restantes");
		expect(cell("Analista")).toHaveTextContent("Alice Analista");
	});

	it("avisa quando o prazo de retorno venceu", () => {
		render(
			<ProjectDetailHeader
				project={makeProjectDetail({
					reviewDeadline: "2026-11-03",
					deadlineStatus: "OVERDUE",
					daysRemaining: -10,
				})}
			/>,
		);

		expect(cell("Retorno até")).toHaveTextContent("03/11/2026Atrasado 10 dias");
		expect(cell("Retorno até")).toHaveAttribute(
			"title",
			"03/11/2026, Atrasado 10 dias",
		);
	});

	it("avisa quando o prazo de retorno vence hoje", () => {
		render(
			<ProjectDetailHeader
				project={makeProjectDetail({
					reviewDeadline: "2026-11-13",
					deadlineStatus: "DUE_TODAY",
					daysRemaining: 0,
				})}
			/>,
		);

		expect(cell("Retorno até")).toHaveTextContent("Vence hoje");
	});

	it("não mostra prazo nem analista fora da análise", () => {
		render(
			<ProjectDetailHeader
				project={makeProjectDetail({
					status: "APPROVED",
					reviewedAt: "2026-11-10T12:00:00Z",
					reviewDeadline: null,
					deadlineStatus: null,
					daysRemaining: null,
				})}
			/>,
		);

		expect(screen.queryByText("Retorno até")).not.toBeInTheDocument();
		expect(screen.queryByText("Analista")).not.toBeInTheDocument();
	});

	it("informa quando o projeto ainda aguarda atribuição", () => {
		render(
			<ProjectDetailHeader
				project={makeProjectDetail({ reviewerName: null })}
			/>,
		);

		expect(cell("Analista")).toHaveTextContent("Aguardando atribuição");
	});
});
