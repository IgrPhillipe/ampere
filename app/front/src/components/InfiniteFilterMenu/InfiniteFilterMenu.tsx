import {
	InfiniteCombobox,
	type InfiniteComboboxProps,
} from "@components/InfiniteCombobox";
import { ListMenuButton, ListMenuButtonText } from "@components/ListMenuButton";
import { Button } from "@components/ui/button";
import { ComboboxTrigger } from "@components/ui/combobox";
import { ChevronDown } from "lucide-react";

interface InfiniteFilterMenuProps
	extends Omit<
		InfiniteComboboxProps,
		"trigger" | "footer" | "contentClassName"
	> {
	label: string;
	allLabel: string;
	className?: string;
}

export const InfiniteFilterMenu = ({
	label,
	allLabel,
	className,
	...props
}: InfiniteFilterMenuProps) => (
	<InfiniteCombobox
		{...props}
		trigger={(selected) => {
			const summary = selected?.label ?? allLabel;

			return (
				<ComboboxTrigger
					render={
						<ListMenuButton
							active={selected !== null}
							aria-label={`${label}: ${summary}`}
							className={className}
						/>
					}
				>
					<ListMenuButtonText
						label={label}
						value={summary}
						icon={<ChevronDown aria-hidden="true" />}
					/>
				</ComboboxTrigger>
			);
		}}
		footer={
			<Button
				type="button"
				variant="ghost"
				size="xs"
				disabled={props.value === null}
				onClick={() => props.onValueChange(null)}
				className="w-full justify-start"
			>
				{allLabel}
			</Button>
		}
	/>
);
