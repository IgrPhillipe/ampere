import { Button } from "@components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";
import { Label } from "@components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/ui/select";
import {
	type ReviewQueueItem,
	useGetReviewerList,
} from "@services/review-queue";
import { useId, useState } from "react";

import { UNASSIGNED_REVIEWER_LABEL } from "../../constants";

/** Up to this many protocols are listed; beyond it, only the count. */
const LISTED_PROJECTS = 5;

interface AssignReviewerDialogProps {
	open: boolean;
	projects: readonly ReviewQueueItem[];
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (reviewerId: string) => void;
}

const formatProjectCount = (count: number) =>
	count === 1 ? "1 projeto" : `${count} projetos`;

interface AssignReviewerFormProps
	extends Omit<AssignReviewerDialogProps, "open" | "onOpenChange"> {
	onCancel: () => void;
}

const AssignReviewerForm = ({
	projects,
	isPending,
	onCancel,
	onConfirm,
}: AssignReviewerFormProps) => {
	const fieldId = useId();
	const reviewersQuery = useGetReviewerList();
	const [reviewerId, setReviewerId] = useState<string | null>(null);
	// The API sends them by name; the record only resolves the chosen label,
	// since numeric-like keys would reorder it by id.
	const reviewerList = reviewersQuery.data?.data ?? [];
	const reviewers = Object.fromEntries(
		reviewerList.map(({ id, name }) => [id, name]),
	);
	const listed = projects.slice(0, LISTED_PROJECTS);
	const hidden = projects.length - listed.length;

	return (
		<>
			<div className="flex flex-col gap-5">
				<ul className="flex flex-col gap-1 text-sm" aria-label="Projetos">
					{listed.map((project) => (
						<li key={project.id} className="flex gap-2">
							<span className="font-mono text-foreground">
								{project.protocol}
							</span>
							<span className="truncate text-muted-foreground">
								{project.reviewerName ?? UNASSIGNED_REVIEWER_LABEL}
							</span>
						</li>
					))}
					{hidden > 0 ? (
						<li className="text-muted-foreground">
							e mais {formatProjectCount(hidden)}
						</li>
					) : null}
				</ul>

				<div className="flex flex-col gap-2">
					<Label id={fieldId}>Analista</Label>
					<Select
						items={reviewers}
						value={reviewerId}
						onValueChange={(value) => setReviewerId(value as string | null)}
						disabled={isPending || reviewersQuery.isPending}
					>
						<SelectTrigger aria-labelledby={fieldId}>
							<SelectValue
								placeholder="Selecione o analista"
								className="min-w-0 truncate"
							/>
						</SelectTrigger>
						<SelectContent>
							{reviewerList.map(({ id, name }) => (
								<SelectItem key={id} value={id}>
									{name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<DialogFooter>
				<Button
					type="button"
					variant="ghost"
					onClick={onCancel}
					disabled={isPending}
				>
					Cancelar
				</Button>
				<Button
					type="button"
					onClick={() => reviewerId && onConfirm(reviewerId)}
					disabled={isPending || !reviewerId}
				>
					{isPending ? "Atribuindo..." : "Atribuir"}
				</Button>
			</DialogFooter>
		</>
	);
};

/** Assigns or reassigns the selected projects; drafts follow the new analyst. */
export const AssignReviewerDialog = ({
	open,
	projects,
	isPending,
	onOpenChange,
	onConfirm,
}: AssignReviewerDialogProps) => (
	<Dialog
		open={open}
		onOpenChange={(nextOpen) => {
			if (!isPending) onOpenChange(nextOpen);
		}}
	>
		<DialogContent className="bg-card" showCloseButton={!isPending}>
			<DialogHeader>
				<DialogTitle className="font-heading text-xl">
					Atribuir Analista
				</DialogTitle>
				<DialogDescription>
					Escolha o analista de {formatProjectCount(projects.length)}. Na
					reatribuição, os apontamentos em rascunho passam para o novo analista;
					os publicados ficam com o autor.
				</DialogDescription>
			</DialogHeader>

			<AssignReviewerForm
				// Closing remounts it, so the choice starts empty on reopening.
				key={open ? "open" : "closed"}
				projects={projects}
				isPending={isPending}
				onCancel={() => onOpenChange(false)}
				onConfirm={onConfirm}
			/>
		</DialogContent>
	</Dialog>
);
