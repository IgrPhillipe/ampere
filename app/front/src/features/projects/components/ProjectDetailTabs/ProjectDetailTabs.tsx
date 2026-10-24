import { EmptyState } from "@components/EmptyState";
import { Button } from "@components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { cn } from "@lib/utils";
import type { Calculation } from "@services/calculation";
import type { ConsumerUnitGroup } from "@services/consumer-units";
import type { Finding } from "@services/project-review";
import type { ProjectDocument } from "@services/submission";
import { Calculator, CircleAlert, History, Users } from "lucide-react";

import {
	AutomaticVerification,
	type CalculationCheck,
} from "../AutomaticVerification";
import { CalculationSteps } from "../CalculationSteps";
import { ConsumerUnitGroupsTable } from "../ConsumerUnitGroupsTable";
import { ProjectDocuments } from "../ProjectDocuments";

const LoadError = ({
	title,
	onRetry,
}: {
	title: string;
	onRetry: () => void;
}) => (
	<EmptyState
		title={title}
		description="Confira o aviso exibido e tente novamente."
		icon={CircleAlert}
		action={
			<Button type="button" variant="outline" onClick={onRetry}>
				Tentar Novamente
			</Button>
		}
	/>
);

interface ProjectDetailTabsProps {
	projectId: string;
	/** `null` when the project was never calculated, `undefined` while loading. */
	calculation?: Calculation | null;
	/** `undefined` while loading. */
	groups?: ConsumerUnitGroup[];
	totalLoadKw: number;
	/** `undefined` while loading. */
	documents?: ProjectDocument[];
	/** Findings marked on the items they point to. */
	markedFindings?: Finding[];
	failed?: { calculation?: boolean; groups?: boolean; documents?: boolean };
	onRetry: () => void;
	groupHint?: string;
	onOpenGroup: (group: ConsumerUnitGroup) => void;
	onCheckFinding?: (check: CalculationCheck) => void;
	onDocumentFinding?: (document: ProjectDocument) => void;
	className?: string;
}

export const ProjectDetailTabs = ({
	projectId,
	calculation,
	groups,
	totalLoadKw,
	documents,
	markedFindings = [],
	failed = {},
	onRetry,
	groupHint,
	onOpenGroup,
	onCheckFinding,
	onDocumentFinding,
	className,
}: ProjectDetailTabsProps) => {
	const findingsOf = (stage: Finding["stage"]) =>
		markedFindings.filter((finding) => finding.stage === stage);

	return (
		<Tabs defaultValue="memoria" className={cn("px-6 py-8 md:px-8", className)}>
			<TabsList className="w-full justify-start overflow-x-auto">
				<TabsTrigger value="memoria" className="flex-none">
					Memória de Cálculo
				</TabsTrigger>
				<TabsTrigger value="unidades" className="flex-none">
					Unidades Consumidoras
				</TabsTrigger>
				<TabsTrigger value="documentos" className="flex-none">
					Documentos
				</TabsTrigger>
				<TabsTrigger value="historico" className="flex-none">
					Histórico
				</TabsTrigger>
			</TabsList>

			<TabsContent value="memoria" className="flex flex-col gap-10 pt-4">
				{failed.calculation ? (
					<LoadError
						title="Não foi possível carregar o cálculo"
						onRetry={onRetry}
					/>
				) : calculation === null ? (
					<EmptyState
						title="Este projeto não tem cálculo de demanda"
						description="O projeto foi enviado sem passar pela memória de cálculo."
						icon={Calculator}
					/>
				) : (
					<>
						<AutomaticVerification
							checks={calculation?.checks}
							isLoading={calculation === undefined}
							onCreateFinding={onCheckFinding}
						/>
						<CalculationSteps
							steps={calculation?.steps}
							isLoading={calculation === undefined}
							findings={findingsOf("CALCULATION")}
						/>
					</>
				)}
			</TabsContent>

			<TabsContent value="unidades" className="flex flex-col gap-4 pt-4">
				{failed.groups ? (
					<LoadError
						title="Não foi possível carregar as unidades"
						onRetry={onRetry}
					/>
				) : (
					<>
						{groupHint && groups && groups.length > 0 ? (
							<p className="text-sm text-muted-foreground">{groupHint}</p>
						) : null}
						<ConsumerUnitGroupsTable
							groups={groups ?? []}
							totalLoadKw={totalLoadKw}
							isLoading={groups === undefined}
							findings={findingsOf("CONSUMER_UNITS")}
							empty={
								<EmptyState
									title="Nenhum grupo cadastrado"
									description="O projeto foi enviado sem unidades consumidoras."
									icon={Users}
								/>
							}
							onOpenGroup={onOpenGroup}
						/>
					</>
				)}
			</TabsContent>

			<TabsContent value="documentos" className="pt-4">
				{failed.documents ? (
					<LoadError
						title="Não foi possível carregar os documentos"
						onRetry={onRetry}
					/>
				) : (
					<ProjectDocuments
						projectId={projectId}
						documents={documents}
						onCreateFinding={onDocumentFinding}
					/>
				)}
			</TabsContent>

			<TabsContent value="historico" className="pt-4">
				<EmptyState
					title="Histórico do protocolo"
					description="A linha do tempo com as versões e as decisões deste protocolo será exibida aqui."
					icon={History}
				/>
			</TabsContent>
		</Tabs>
	);
};
