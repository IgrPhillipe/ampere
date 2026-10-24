import { ListMenuButton, ListMenuButtonText } from "@components/ListMenuButton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const ALL = "__all__";

export interface FilterOption<TValue extends string = string> {
	value: TValue;
	label: string;
}

interface FilterMenuProps<TValue extends string> {
	label: string;
	value: TValue | null;
	onValueChange: (value: TValue | null) => void;
	/** An array, not a map: numeric ids as object keys would jump ahead of the rest. */
	options: readonly FilterOption<TValue>[];
	allLabel: string;
	disabled?: boolean;
	className?: string;
}

export const FilterMenu = <TValue extends string>({
	label,
	value,
	onValueChange,
	options,
	allLabel,
	disabled,
	className,
}: FilterMenuProps<TValue>) => {
	const selected = options.find((option) => option.value === value);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				disabled={disabled}
				render={
					<ListMenuButton
						active={value !== null}
						aria-label={`${label}: ${selected?.label ?? value ?? allLabel}`}
						className={className}
					/>
				}
			>
				<ListMenuButtonText
					label={label}
					value={selected?.label ?? value ?? allLabel}
					icon={<ChevronDown aria-hidden="true" />}
				/>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="max-h-72 min-w-56">
				<DropdownMenuRadioGroup
					value={value ?? ALL}
					onValueChange={(next: string) =>
						onValueChange(next === ALL ? null : (next as TValue))
					}
				>
					<DropdownMenuRadioItem value={ALL}>{allLabel}</DropdownMenuRadioItem>
					{options.map((option) => (
						<DropdownMenuRadioItem key={option.value} value={option.value}>
							{option.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
