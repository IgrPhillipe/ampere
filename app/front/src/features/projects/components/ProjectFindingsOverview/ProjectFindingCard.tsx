import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { formatDate } from "@features/shared";
import type { Finding } from "@services/project-review";
import { ArrowRight } from "lucide-react";

const severityLabels = {
	BLOCKING: "Bloqueante",
	ADJUSTMENT: "Ajuste",
} as const;

const severityVariants = {
	BLOCKING: "destructive",
	ADJUSTMENT: "warning",
} as const;

const statusLabels = {
	DRAFT: "Rascunho",
	OPEN: "Aguardando resposta",
	FIXED: "Corrigido",
	CONTESTED: "Contestado",
	RESOLVED: "Resolvido",
} as const;

const stageLabels = {
	PROJECT_DATA: "Dados da edificação",
	CONSUMER_UNITS: "Unidades consumidoras",
	CALCULATION: "Cálculo de demanda",
	DOCUMENTS: "Documentos",
} as const;

const referenceOf = (finding: Finding) => {
	if (finding.consumerUnitGroupId) {
		return `Grupo ${finding.consumerUnitGroupId}`;
	}

	if (finding.calculationStepCode) {
		return `Etapa ${finding.calculationStepCode}`;
	}

	if (finding.documentType) {
		return finding.documentType.replaceAll("_", " ");
	}

	return null;
};

interface ProjectFindingCardProps {
	finding: Finding;
	onOpenStage: (finding: Finding) => void;
}

export const ProjectFindingCard = ({
	finding,
	onOpenStage,
}: ProjectFindingCardProps) => {
	const reference = referenceOf(finding);

	return (
		<li className="flex flex-col gap-4 border-b border-border py-5 last:border-b-0">
			<div className="flex flex-wrap items-center gap-2">
				<Badge variant={severityVariants[finding.severity]}>
					{severityLabels[finding.severity]}
				</Badge>
				<Badge variant="outline">{statusLabels[finding.status]}</Badge>
				<span className="font-mono text-xs text-muted-foreground">
					{stageLabels[finding.stage]}
					{reference ? ` · ${reference}` : null}
				</span>
			</div>

			<div className="space-y-2">
				<p className="text-sm whitespace-pre-line text-foreground">
					{finding.description}
				</p>
				{finding.standardItem ? (
					<p className="font-mono text-xs text-muted-foreground">
						Referência: {finding.standardItem}
					</p>
				) : null}
			</div>

			<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
				<p className="text-xs text-muted-foreground">
					Registrado por {finding.authorName ?? "analista"} em{" "}
					<time dateTime={finding.createdAt}>
						{formatDate(finding.createdAt)}
					</time>
				</p>

				<Button
					type="button"
					variant="outline"
					size="xs"
					onClick={() => onOpenStage(finding)}
				>
					Ir para a etapa
					<ArrowRight aria-hidden="true" />
				</Button>
			</div>
		</li>
	);
};
