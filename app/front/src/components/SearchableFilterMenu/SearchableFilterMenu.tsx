import { ListMenuButton, ListMenuButtonText } from "@components/ListMenuButton";
import { Button } from "@components/ui/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxItem,
	ComboboxTrigger,
} from "@components/ui/combobox";
import { ChevronDown } from "lucide-react";

interface SearchableFilterMenuProps {
	label: string;
	/** Empty means no filter. */
	value: readonly string[];
	onValueChange: (value: string[]) => void;
	options: readonly string[];
	allLabel: string;
	searchPlaceholder: string;
	emptyMessage: string;
	disabled?: boolean;
	className?: string;
}

export const SearchableFilterMenu = ({
	label,
	value,
	onValueChange,
	options,
	allLabel,
	searchPlaceholder,
	emptyMessage,
	disabled,
	className,
}: SearchableFilterMenuProps) => {
	const summary =
		value.length === 0
			? allLabel
			: value.length === 1
				? value[0]
				: `${value.length} selecionados`;

	return (
		<Combobox
			items={options}
			multiple
			value={[...value]}
			onValueChange={(next: string[]) => onValueChange(next)}
			locale="pt-BR"
			disabled={disabled}
		>
			<ComboboxTrigger
				render={
					<ListMenuButton
						active={value.length > 0}
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

			<ComboboxContent
				searchPlaceholder={searchPlaceholder}
				emptyMessage={emptyMessage}
				footer={
					<Button
						type="button"
						variant="ghost"
						size="xs"
						disabled={value.length === 0}
						onClick={() => onValueChange([])}
						className="w-full justify-start"
					>
						{allLabel}
					</Button>
				}
			>
				{(option: string) => (
					<ComboboxItem key={option} value={option}>
						{option}
					</ComboboxItem>
				)}
			</ComboboxContent>
		</Combobox>
	);
};
