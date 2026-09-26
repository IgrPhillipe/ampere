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
	useDeleteConsumerUnitGroup,
	useUpdateConsumerUnitGroup,
} from "@services/consumer-units";

import { EvChargingGroupForm } from "./EvChargingGroupForm";
import type { GroupFormProps } from "./group-form";
import { LoadGroupForm } from "./LoadGroupForm";
import { ResidentialGroupForm } from "./ResidentialGroupForm";

export interface OpenedGroup {
	group: ConsumerUnitGroup;
	focusField?: string;
}

interface GroupSheetProps {
	projectId: string;
	readOnly?: boolean;
	opened: OpenedGroup | null;
	onClose: () => void;
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
}: GroupSheetProps) => {
	const updateGroup = useUpdateConsumerUnitGroup(projectId);
	const deleteGroup = useDeleteConsumerUnitGroup(projectId);

	const group = opened?.group;

	const save = (payload: ConsumerUnitGroupPayload) => {
		if (!group) return;

		updateGroup.mutate(
			{ projectId, groupId: group.id, payload },
			{ onSuccess: onClose },
		);
	};

	const remove = () => {
		if (!group) return;

		deleteGroup.mutate(
			{ projectId, groupId: group.id },
			{ onSuccess: onClose },
		);
	};

	return (
		<Sheet
			open={opened !== null}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<SheetContent className="w-full gap-0 bg-card sm:max-w-xl">
				{group ? (
					<>
						<SheetHeader className="border-b border-border px-6 py-6">
							<SheetTitle className="font-heading text-xl">
								{group.name}
							</SheetTitle>
							<SheetDescription>{group.summary}</SheetDescription>
						</SheetHeader>

						{/* `key` resets the form when another group opens. */}
						<div key={group.id} className="flex min-h-0 flex-1 flex-col">
							{renderGroupForm(group, {
								focusField: opened?.focusField,
								readOnly,
								isSaving: updateGroup.isPending,
								isDeleting: deleteGroup.isPending,
								onSave: save,
								onCancel: onClose,
								onDelete: remove,
							})}
						</div>
					</>
				) : null}
			</SheetContent>
		</Sheet>
	);
};
