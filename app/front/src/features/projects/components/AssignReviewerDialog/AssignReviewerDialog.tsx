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
import { Label } from "@components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/ui/select";
import { useGetReviewerList } from "@services/review-queue";
import { useId, useState } from "react";

/** What the dialog reads of the project under review. */
export interface AssignableProject {
	protocol: string;
	ownerId?: string | null;
	reviewerId?: string | null;
}

interface AssignReviewerDialogProps {
	open: boolean;
	project: AssignableProject;
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (reviewerId: string) => void;
}

interface AssignReviewerFormProps
	extends Omit<AssignReviewerDialogProps, "open" | "onOpenChange"> {
	onCancel: () => void;
}

const AssignReviewerForm = ({
	project,
	isPending,
	onCancel,
	onConfirm,
}: AssignReviewerFormProps) => {
	const fieldId = useId();
	const reviewersQuery = useGetReviewerList();
	const [chosenId, setChosenId] = useState<string | null>(null);
	// The API sends them by name; the record only resolves the chosen label,
	// since numeric-like keys would reorder it by id.
	const reviewerList = (reviewersQuery.data?.data ?? []).filter(
		({ active }) => active,
	);
	const reviewers = Object.fromEntries(
		reviewerList.map(({ id, name }) => [id, name]),
	);
	// An analyst who left the refreshed list cannot be confirmed.
	const reviewerId = chosenId && chosenId in reviewers ? chosenId : null;
	const unchanged = reviewerId === project.reviewerId;

	return (
		<>
			<div className="flex flex-col gap-2">
				<Label id={fieldId}>Analista</Label>
				<Select
					items={reviewers}
					value={reviewerId}
					onValueChange={(value) => setChosenId(value as string | null)}
					disabled={isPending || reviewersQuery.isPending}
				>
					<SelectTrigger aria-labelledby={fieldId}>
						<SelectValue
							placeholder="Selecione o analista"
							className="min-w-0 truncate"
						/>
					</SelectTrigger>
					<SelectContent>
						{reviewerList.map(({ id, name, role }) => {
							// The API refuses the owner as analyst of their own project.
							const isOwner = id === project.ownerId;
							const isCurrent = id === project.reviewerId;
							return (
								<SelectItem key={id} value={id} disabled={isOwner}>
									<span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
										<span className="truncate">{name}</span>
										{role === "admin" ? (
											<Badge variant="neutral">Gestor</Badge>
										) : null}
										{isOwner ? (
											<span className="text-xs text-disabled-foreground">
												Dono do projeto
											</span>
										) : null}
										{isCurrent ? (
											<span className="text-xs text-muted-foreground">
												Analista atual
											</span>
										) : null}
									</span>
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>
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
					disabled={isPending || !reviewerId || unchanged}
				>
					{isPending ? "Atribuindo..." : "Atribuir"}
				</Button>
			</DialogFooter>
		</>
	);
};

/** Assigns or reassigns the project's analyst; drafts follow the new analyst. */
export const AssignReviewerDialog = ({
	open,
	project,
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
					{project.reviewerId ? "Trocar Analista" : "Atribuir Analista"}
				</DialogTitle>
				<DialogDescription>
					Escolha o analista do projeto {project.protocol}. Na troca, os
					apontamentos em rascunho passam para o novo analista; os publicados
					ficam com o autor.
				</DialogDescription>
			</DialogHeader>

			<AssignReviewerForm
				// Closing remounts it, so the choice starts empty on reopening.
				key={open ? "open" : "closed"}
				project={project}
				isPending={isPending}
				onCancel={() => onOpenChange(false)}
				onConfirm={onConfirm}
			/>
		</DialogContent>
	</Dialog>
);
