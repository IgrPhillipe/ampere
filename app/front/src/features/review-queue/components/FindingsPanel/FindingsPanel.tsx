import { ConclusionField } from "@components/ConclusionField";
import { SectionHeading } from "@components/SectionHeading";
import { Skeleton } from "@components/ui/skeleton";
import {
	describeFindingReference,
	FindingDialog,
	type FindingReferenceOptions,
	FindingRow,
	isReservation,
} from "@features/projects";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { Finding, FindingStage } from "@services/project-review";
import type { ProjectDetail } from "@services/projects";
import { useState } from "react";

import type { FindingFormValues } from "../../schemas";
import type { FindingEditor } from "../../types";
import { isDraftFinding } from "../ReviewDecision/review-decision";
import { FindingCard, type FindingCardActions } from "./FindingCard";
import { FindingForm } from "./FindingForm";

interface FindingsPanelProps extends FindingCardActions {
	findings?: Finding[];
	isLoading?: boolean;
	editable: boolean;
	underReview: boolean;
	/** On an approved project, the unresolved findings are reservations. */
	project?: Pick<ProjectDetail, "status">;
	editor: FindingEditor;
	currentStage?: FindingStage;
	autoFocusForm?: boolean;
	referenceOptions: FindingReferenceOptions;
	isSaving: boolean;
	pendingId?: string;
	onSubmit: (values: FindingFormValues) => void;
	onCancelEdit: () => void;
	/** Warnings of the automatic checks; shown as the screen's conclusion when given. */
	triageAlerts?: number;
	/** `below` spreads the list and the form side by side under the section. */
	placement?: "side" | "below";
	className?: string;
}

export const FindingsPanel = ({
	findings,
	isLoading = false,
	editable,
	underReview,
	project,
	editor,
	currentStage,
	autoFocusForm = false,
	referenceOptions,
	isSaving,
	pendingId,
	onSubmit,
	onCancelEdit,
	triageAlerts,
	placement = "side",
	className,
	...actions
}: FindingsPanelProps) => {
	const current = findings?.filter(isDraftFinding) ?? [];
	const previous =
		findings?.filter((finding) => !isDraftFinding(finding)) ?? [];
	const editingId = editor.mode === "edit" ? editor.findingId : undefined;
	const reservationOf = (finding: Finding) =>
		project ? isReservation(finding, project) : false;

	const [openedId, setOpenedId] = useState<string | null>(null);
	const opened = findings?.find((finding) => finding.id === openedId);
	const close = () => setOpenedId(null);
	// The dialog closes first: editing happens in the side form.
	const dialogActions: FindingCardActions = {
		onEdit: (finding) => {
			close();
			actions.onEdit(finding);
		},
		onDelete: (finding) => {
			close();
			actions.onDelete(finding);
		},
		onResolve: actions.onResolve,
	};

	const renderList = (items: Finding[]) => (
		<ul className="flex flex-col">
			{items.map((finding, position) => (
				<FindingRow
					key={finding.id}
					finding={finding}
					index={position + 1}
					reference={describeFindingReference(finding, referenceOptions)}
					showVersion={!isDraftFinding(finding)}
					reservation={reservationOf(finding)}
					isSelected={finding.id === editingId}
					onOpen={() => setOpenedId(finding.id)}
				/>
			))}
		</ul>
	);

	const subheading =
		"font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase";

	const list =
		isLoading || !findings ? (
			<div aria-busy="true" className="flex flex-col gap-3 pt-4">
				<Skeleton className="h-5 w-40" />
				<Skeleton className="h-16 w-full" />
			</div>
		) : (
			<>
				<section
					aria-labelledby="apontamentos-atuais-titulo"
					className="flex flex-col pt-4"
				>
					<h3 id="apontamentos-atuais-titulo" className={subheading}>
						Desta Análise
					</h3>
					{current.length === 0 ? (
						<p className="border-b border-border py-4 text-sm text-muted-foreground">
							Nenhum apontamento registrado nesta análise.
						</p>
					) : (
						renderList(current)
					)}
				</section>

				{previous.length > 0 ? (
					<section
						aria-labelledby="apontamentos-anteriores-titulo"
						className="flex flex-col pt-6"
					>
						<h3 id="apontamentos-anteriores-titulo" className={subheading}>
							{underReview ? "Da Análise Anterior" : "Enviados ao Projetista"}
						</h3>
						{underReview ? (
							<p className="mt-1.5 text-sm text-muted-foreground">
								Confira a resposta do projetista e aceite a correção ou reabra o
								apontamento.
							</p>
						) : null}
						{renderList(previous)}
					</section>
				) : null}
			</>
		);

	return (
		<aside
			aria-labelledby="apontamentos-titulo"
			className={cn(
				"flex flex-col gap-9.5 px-6 py-8 md:px-10",
				placement === "below" &&
					"@container lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-x-12",
				className,
			)}
		>
			{triageAlerts !== undefined && placement === "side" ? (
				<ConclusionField
					label="Triagem automática"
					value={padCount(triageAlerts)}
					caption={
						triageAlerts === 1
							? "Alerta para conferência humana"
							: "Alertas para conferência humana"
					}
				/>
			) : null}

			<div className="flex flex-col">
				<SectionHeading
					id="apontamentos-titulo"
					meta={findings ? padCount(findings.length) : undefined}
				>
					Apontamentos
				</SectionHeading>
				{list}
			</div>

			{editable ? (
				// A new key replays the highlight each time another section fills the form.
				<section
					key={autoFocusForm ? editor.key : "idle"}
					aria-labelledby="formulario-apontamento-titulo"
					className={cn(
						"-mx-3 px-3 py-3",
						autoFocusForm && "motion-safe:animate-highlight",
					)}
				>
					<h3
						id="formulario-apontamento-titulo"
						className="mb-4 text-base font-medium text-foreground"
					>
						{editor.mode === "edit" ? "Editar Apontamento" : "Novo Apontamento"}
					</h3>
					<FindingForm
						key={editor.key}
						editor={editor}
						currentStage={currentStage}
						referenceOptions={referenceOptions}
						isPending={isSaving}
						autoFocus={autoFocusForm}
						onSubmit={onSubmit}
						onCancel={onCancelEdit}
					/>
				</section>
			) : null}

			<FindingDialog
				finding={opened}
				referenceOf={(finding) =>
					describeFindingReference(finding, referenceOptions)
				}
				onClose={close}
			>
				{(finding) => (
					<FindingCard
						finding={finding}
						reservation={reservationOf(finding)}
						referenceOptions={referenceOptions}
						editable={editable}
						pendingId={pendingId}
						{...dialogActions}
					/>
				)}
			</FindingDialog>
		</aside>
	);
};
