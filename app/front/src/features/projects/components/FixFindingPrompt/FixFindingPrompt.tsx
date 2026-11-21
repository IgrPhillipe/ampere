import { ControlledTextarea } from "@components/form";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";
import { useZodForm } from "@features/shared";
import { type Finding, useRespondFinding } from "@services/project-review";
import { useEffect, useState } from "react";

import {
	findingSeverityBadgeVariants,
	findingSeverityLabels,
} from "../../constants";
import {
	type FindingResponseValues,
	findingResponseSchema,
} from "../../schemas";

export interface FixFindingQueue {
	/** Findings of the saved item still waiting on the designer, asked one at a time. */
	findings: Finding[];
	/** Answer the dialog suggests, editable before confirming. */
	suggestion: string;
}

interface FixFindingPromptProps {
	projectId: string;
	queue: FixFindingQueue | null;
	onQueueChange: (queue: FixFindingQueue | null) => void;
}

/**
 * Offers to mark the findings of an item as fixed right after the designer saves it.
 * Never marks without asking: the analyst must not receive as fixed what was not.
 */
export const FixFindingPrompt = ({
	projectId,
	queue,
	onQueueChange,
}: FixFindingPromptProps) => {
	const respondMutation = useRespondFinding();
	const current = queue?.findings[0];
	// Keeps the last finding on screen while the dialog plays its closing animation.
	const [shown, setShown] = useState(current);
	if (current && current !== shown) setShown(current);
	const finding = current ?? shown;
	const suggestion = queue?.suggestion;
	const remaining = queue?.findings.length ?? 0;

	const form = useZodForm(findingResponseSchema, {
		status: "FIXED",
		response: suggestion ?? "",
	});

	// Each finding of the queue starts from the suggestion again.
	useEffect(() => {
		if (suggestion === undefined) return;

		form.reset({ status: "FIXED", response: suggestion });
	}, [form, current?.id, suggestion]);

	const next = () => {
		if (!queue || queue.findings.length <= 1) {
			onQueueChange(null);
			return;
		}

		onQueueChange({ ...queue, findings: queue.findings.slice(1) });
	};

	const confirm = ({ response }: FindingResponseValues) => {
		if (!current) return;

		respondMutation.mutate(
			{
				projectId,
				findingId: current.id,
				status: "FIXED",
				response: response || undefined,
			},
			{ onSuccess: next },
		);
	};

	const isPending = respondMutation.isPending;

	return (
		<Dialog
			open={current !== undefined}
			onOpenChange={(open) => {
				// Dismissing leaves every finding of the queue open, as declining does.
				if (!open && !isPending) onQueueChange(null);
			}}
		>
			<DialogContent
				className="bg-card sm:max-w-lg"
				showCloseButton={!isPending}
			>
				{finding ? (
					<form
						noValidate
						aria-label="Marcar apontamento como corrigido"
						className="flex flex-col gap-4"
						onSubmit={form.handleSubmit(confirm)}
					>
						<DialogHeader>
							<DialogTitle className="font-heading text-xl">
								Marcar o apontamento como corrigido?
							</DialogTitle>
							<DialogDescription>
								{remaining > 1
									? `O item salvo tem ${remaining} apontamentos abertos. Confirme cada um que foi corrigido.`
									: "O item salvo tem um apontamento aberto. Confirme se ele foi corrigido."}
							</DialogDescription>
						</DialogHeader>

						<div className="flex flex-col gap-2">
							<Badge
								variant={findingSeverityBadgeVariants[finding.severity]}
								className="self-start"
							>
								{findingSeverityLabels[finding.severity]}
							</Badge>
							<p className="text-sm leading-snug font-medium break-words whitespace-pre-line text-foreground">
								{finding.description}
							</p>
						</div>

						<ControlledTextarea
							control={form.control}
							name="response"
							label="Resposta"
							description="Opcional. Informe ao analista o que foi corrigido."
							maxLength={2000}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="ghost"
								disabled={isPending}
								onClick={next}
							>
								Manter Aberto
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Salvando..." : "Marcar Corrigido"}
							</Button>
						</DialogFooter>
					</form>
				) : null}
			</DialogContent>
		</Dialog>
	);
};
