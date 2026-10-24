import type { FilterOption } from "@components/FilterMenu";
import { ListMenuButton, ListMenuButtonText } from "@components/ListMenuButton";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface MultiFilterMenuProps<TValue extends string> {
	label: string;
	/** Empty means no filter. */
	value: readonly TValue[];
	onValueChange: (value: TValue[]) => void;
	options: readonly FilterOption<TValue>[];
	allLabel: string;
	disabled?: boolean;
	className?: string;
}

export const MultiFilterMenu = <TValue extends string>({
	label,
	value,
	onValueChange,
	options,
	allLabel,
	disabled,
	className,
}: MultiFilterMenuProps<TValue>) => {
	const summary =
		value.length === 0
			? allLabel
			: value.length === 1
				? (options.find((option) => option.value === value[0])?.label ??
					value[0])
				: `${value.length} selecionados`;

	const toggle = (option: TValue, checked: boolean) =>
		onValueChange(
			checked
				? [...value, option]
				: value.filter((selected) => selected !== option),
		);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				disabled={disabled}
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
			</DropdownMenuTrigger>

			<DropdownMenuContent className="max-h-72 min-w-56">
				<DropdownMenuItem
					disabled={value.length === 0}
					onClick={() => onValueChange([])}
				>
					{allLabel}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				{options.map((option) => (
					<DropdownMenuCheckboxItem
						key={option.value}
						checked={value.includes(option.value)}
						onCheckedChange={(checked) => toggle(option.value, checked)}
					>
						{option.label}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
