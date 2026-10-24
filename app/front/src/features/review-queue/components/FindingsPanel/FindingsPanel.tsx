import { Skeleton } from "@components/ui/skeleton";
import type { FindingReferenceOptions } from "@features/projects";
import { cn } from "@lib/utils";
import type { Finding } from "@services/project-review";

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
	editor: FindingEditor;
	autoFocusForm?: boolean;
	referenceOptions: FindingReferenceOptions;
	isSaving: boolean;
	pendingId?: string;
	onSubmit: (values: FindingFormValues) => void;
	onCancelEdit: () => void;
	className?: string;
}

export const FindingsPanel = ({
	findings,
	isLoading = false,
	editable,
	underReview,
	editor,
	autoFocusForm = false,
	referenceOptions,
	isSaving,
	pendingId,
	onSubmit,
	onCancelEdit,
	className,
	...actions
}: FindingsPanelProps) => {
	const current = findings?.filter(isDraftFinding) ?? [];
	const previous =
		findings?.filter((finding) => !isDraftFinding(finding)) ?? [];
	const editingId = editor.mode === "edit" ? editor.findingId : undefined;

	const renderList = (items: Finding[]) => (
		<ul className="flex flex-col">
			{items.map((finding) => (
				<FindingCard
					key={finding.id}
					finding={finding}
					referenceOptions={referenceOptions}
					editable={editable}
					pendingId={pendingId}
					isSelected={finding.id === editingId}
					{...actions}
				/>
			))}
		</ul>
	);

	return (
		<aside
			aria-labelledby="apontamentos-titulo"
			className={cn("flex flex-col gap-8 px-6 py-8 md:px-8", className)}
		>
			<h2
				id="apontamentos-titulo"
				className="border-b-2 border-foreground pb-3 text-lg font-semibold text-foreground"
			>
				Apontamentos
			</h2>

			{editable ? (
				// A new key replays the highlight each time another section fills the form.
				<section
					key={autoFocusForm ? editor.key : "idle"}
					aria-labelledby="formulario-apontamento-titulo"
					className={cn(
						"-mx-3 rounded-xs px-3 py-3",
						autoFocusForm && "motion-safe:animate-highlight",
					)}
				>
					<h3
						id="formulario-apontamento-titulo"
						className="mb-4 text-base font-semibold text-foreground"
					>
						{editor.mode === "edit" ? "Editar Apontamento" : "Novo Apontamento"}
					</h3>
					<FindingForm
						key={editor.key}
						editor={editor}
						referenceOptions={referenceOptions}
						isPending={isSaving}
						autoFocus={autoFocusForm}
						onSubmit={onSubmit}
						onCancel={onCancelEdit}
					/>
				</section>
			) : null}

			{isLoading || !findings ? (
				<div aria-busy="true" className="flex flex-col gap-3">
					<Skeleton className="h-5 w-40" />
					<Skeleton className="h-16 w-full" />
				</div>
			) : (
				<>
					<section aria-labelledby="apontamentos-atuais-titulo">
						<h3
							id="apontamentos-atuais-titulo"
							className="text-base font-semibold text-foreground"
						>
							Desta Análise
						</h3>
						{current.length === 0 ? (
							<p className="mt-2 text-sm text-muted-foreground">
								Nenhum apontamento registrado nesta análise.
							</p>
						) : (
							renderList(current)
						)}
					</section>

					{previous.length > 0 ? (
						<section aria-labelledby="apontamentos-anteriores-titulo">
							<h3
								id="apontamentos-anteriores-titulo"
								className="text-base font-semibold text-foreground"
							>
								{underReview ? "Da Análise Anterior" : "Enviados ao Projetista"}
							</h3>
							{underReview ? (
								<p className="mt-1 text-sm text-muted-foreground">
									Confira a resposta do projetista e aceite a correção ou reabra
									o apontamento.
								</p>
							) : null}
							{renderList(previous)}
						</section>
					) : null}
				</>
			)}
		</aside>
	);
};
