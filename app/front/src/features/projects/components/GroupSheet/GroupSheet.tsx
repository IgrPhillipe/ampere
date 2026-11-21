import { ConfirmDialog } from "@components/ConfirmDialog";
import { Button } from "@components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@components/ui/sheet";
import {
	type ConsumerUnitGroup,
	type ConsumerUnitGroupPayload,
	useCreateConsumerUnitGroup,
	useDeleteConsumerUnitGroup,
	useUpdateConsumerUnitGroup,
} from "@services/consumer-units";
import type { Finding } from "@services/project-review";
import { useState } from "react";

import { FixFindingPrompt, type FixFindingQueue } from "../FixFindingPrompt";
import { EvChargingGroupForm } from "./EvChargingGroupForm";
import type { GroupFormProps } from "./group-form";
import { LoadGroupForm } from "./LoadGroupForm";
import { ResidentialGroupForm } from "./ResidentialGroupForm";

export interface OpenedGroup {
	group: ConsumerUnitGroup;
	focusField?: string;
	/** Not saved yet: a three-phase apartment needs its loads before the back accepts it. */
	draft?: boolean;
}

interface GroupSheetProps {
	projectId: string;
	readOnly?: boolean;
	opened: OpenedGroup | null;
	onClose: () => void;
	/** A draft was saved as a new group. */
	onCreated?: () => void;
	/** The analyst registers a finding tied to the open group. */
	onCreateFinding?: (group: ConsumerUnitGroup) => void;
	/** Findings the designer can answer now; saving a pointed group offers to mark them fixed. */
	respondableFindings?: Finding[];
}

const renderGroupForm = (
	group: ConsumerUnitGroup,
	props: Omit<GroupFormProps<ConsumerUnitGroup>, "group">,
) => {
	switch (group.kind) {
		case "RESIDENTIAL":
			return <ResidentialGroupForm group={group} {...props} />;
		case "LOAD":
			return <LoadGroupForm group={group} {...props} />;
		case "EV_CHARGING":
			return <EvChargingGroupForm group={group} {...props} />;
	}
};

export const GroupSheet = ({
	projectId,
	readOnly = false,
	opened,
	onClose,
	onCreated,
	onCreateFinding,
	respondableFindings = [],
}: GroupSheetProps) => {
	const createGroup = useCreateConsumerUnitGroup(projectId);
	const updateGroup = useUpdateConsumerUnitGroup(projectId);
	const deleteGroup = useDeleteConsumerUnitGroup(projectId);
	const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
	const [fixQueue, setFixQueue] = useState<FixFindingQueue | null>(null);
	// Opens once the sheet has slid out, or the leaving sheet covers the prompt.
	const [pendingFixQueue, setPendingFixQueue] =
		useState<FixFindingQueue | null>(null);

	const group = opened?.group;
	const closeSheet = () => {
		setDeleteConfirmationOpen(false);
		onClose();
	};

	const save = (payload: ConsumerUnitGroupPayload) => {
		if (!group) return;

		if (opened?.draft) {
			createGroup.mutate(
				{ projectId, payload },
				{
					onSuccess: () => {
						onCreated?.();
						closeSheet();
					},
				},
			);
			return;
		}

		const pointed = respondableFindings.filter(
			(finding) => finding.consumerUnitGroupId === group.id,
		);

		updateGroup.mutate(
			{ projectId, groupId: group.id, payload },
			{
				onSuccess: () => {
					closeSheet();
					if (pointed.length > 0)
						setPendingFixQueue({
							findings: pointed,
							suggestion: `Corrigi o grupo ${payload.name || group.name}.`,
						});
				},
			},
		);
	};

	const remove = () => {
		if (!group) return;

		deleteGroup.mutate(
			{ projectId, groupId: group.id },
			{ onSuccess: closeSheet },
		);
	};

	return (
		<>
			<Sheet
				open={opened !== null}
				onOpenChange={(open) => {
					if (!open && !deleteGroup.isPending) closeSheet();
				}}
				onOpenChangeComplete={(open) => {
					if (open || !pendingFixQueue) return;

					setFixQueue(pendingFixQueue);
					setPendingFixQueue(null);
				}}
			>
				<SheetContent className="w-full gap-0 bg-card sm:max-w-xl">
					{group ? (
						<>
							<SheetHeader className="border-b border-border px-6 py-6">
								<SheetTitle className="font-heading text-lg font-medium">
									{group.name}
								</SheetTitle>
								<SheetDescription>{group.summary}</SheetDescription>
								{onCreateFinding && !opened?.draft ? (
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="mt-2 self-start"
										onClick={() => {
											closeSheet();
											onCreateFinding(group);
										}}
									>
										Registrar Apontamento
									</Button>
								) : null}
							</SheetHeader>

							{/* `key` resets the form when another group opens. */}
							<div key={group.id} className="flex min-h-0 flex-1 flex-col">
								{renderGroupForm(group, {
									focusField: opened?.focusField,
									readOnly,
									isNew: opened?.draft ?? false,
									isSaving: createGroup.isPending || updateGroup.isPending,
									isDeleting: deleteGroup.isPending,
									onSave: save,
									onCancel: closeSheet,
									onDelete: () => setDeleteConfirmationOpen(true),
								})}
							</div>
						</>
					) : null}
				</SheetContent>
			</Sheet>

			{group ? (
				<ConfirmDialog
					open={deleteConfirmationOpen}
					title="Excluir grupo?"
					description={
						<>
							O grupo <strong className="text-foreground">{group.name}</strong>{" "}
							será removido do projeto. Esta ação não pode ser desfeita.
						</>
					}
					confirmLabel="Excluir Grupo"
					pendingLabel="Excluindo..."
					isPending={deleteGroup.isPending}
					destructive
					onOpenChange={setDeleteConfirmationOpen}
					onConfirm={remove}
				/>
			) : null}

			<FixFindingPrompt
				projectId={projectId}
				queue={fixQueue}
				onQueueChange={setFixQueue}
			/>
		</>
	);
};
