import { ControlledTextarea } from "@components/form";
import { Button } from "@components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";
import { padCount, useZodForm } from "@features/shared";
import type { ReviewDecision } from "@services/project-review";

import { type DecisionFormValues, decisionFormSchema } from "../../schemas";

const copy = {
	APPROVE: {
		title: "Aprovar o projeto?",
		confirm: "Aprovar Projeto",
		pending: "Aprovando...",
		placeholder: "Memória de cálculo e documentos conferidos sem divergências.",
	},
	REJECT: {
		title: "Reprovar o projeto com apontamentos?",
		confirm: "Reprovar com Apontamentos",
		pending: "Reprovando...",
		placeholder: "Corrigir os itens apontados antes do reenvio.",
	},
} as const satisfies Record<ReviewDecision, Record<string, string>>;

interface DecisionDialogProps {
	decision: ReviewDecision | null;
	pendingCount: number;
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (decision: ReviewDecision, opinion: string) => void;
}

export const DecisionDialog = ({
	decision,
	pendingCount,
	isPending,
	onOpenChange,
	onConfirm,
}: DecisionDialogProps) => (
	<Dialog open={decision !== null} onOpenChange={onOpenChange}>
		<DialogContent className="bg-card">
			{decision ? (
				<DecisionForm
					key={decision}
					decision={decision}
					pendingCount={pendingCount}
					isPending={isPending}
					onCancel={() => onOpenChange(false)}
					onConfirm={onConfirm}
				/>
			) : null}
		</DialogContent>
	</Dialog>
);

interface DecisionFormProps {
	decision: ReviewDecision;
	pendingCount: number;
	isPending: boolean;
	onCancel: () => void;
	onConfirm: (decision: ReviewDecision, opinion: string) => void;
}

const DecisionForm = ({
	decision,
	pendingCount,
	isPending,
	onCancel,
	onConfirm,
}: DecisionFormProps) => {
	const form = useZodForm(decisionFormSchema, { opinion: "" });
	const text = copy[decision];

	const description =
		decision === "APPROVE"
			? "O status passa a Aprovado e o parecer fica registrado na análise."
			: `O status passa a Reprovado com ${padCount(pendingCount)} ${
					pendingCount === 1 ? "pendência" : "pendências"
				}, e o projetista recebe os apontamentos nas etapas indicadas.`;

	const submit = ({ opinion }: DecisionFormValues) =>
		onConfirm(decision, opinion);

	return (
		<form
			noValidate
			onSubmit={form.handleSubmit(submit)}
			className="flex flex-col gap-4"
		>
			<DialogHeader>
				<DialogTitle className="font-heading text-xl">{text.title}</DialogTitle>
				<DialogDescription>{description}</DialogDescription>
			</DialogHeader>

			<ControlledTextarea
				control={form.control}
				name="opinion"
				label="Parecer"
				placeholder={text.placeholder}
				maxLength={2000}
				required
			/>

			<DialogFooter>
				<Button type="button" variant="ghost" onClick={onCancel}>
					Cancelar
				</Button>

				<Button
					type="submit"
					variant={decision === "REJECT" ? "destructive" : "default"}
					disabled={isPending}
				>
					{isPending ? text.pending : text.confirm}
				</Button>
			</DialogFooter>
		</form>
	);
};
