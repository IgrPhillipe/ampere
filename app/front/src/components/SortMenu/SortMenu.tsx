import { ListMenuButton, ListMenuButtonText } from "@components/ListMenuButton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuGroupLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import {
	type ListSort,
	type SortDirection,
	type SortDirections,
	sortDirectionSchema,
} from "@features/shared";
import { ArrowDown, ArrowUp } from "lucide-react";

export interface SortOption<TColumn extends string> {
	value: TColumn;
	label: string;
}

interface SortMenuProps<TColumn extends string> {
	options: readonly SortOption<TColumn>[];
	value: ListSort<TColumn>;
	/** Direction a column takes when picked from the menu. */
	directions: SortDirections<TColumn>;
	onValueChange: (sort: ListSort<TColumn>) => void;
	className?: string;
}

const directionLabels: Record<SortDirection, string> = {
	ASC: "Crescente",
	DESC: "Decrescente",
};

export const SortMenu = <TColumn extends string>({
	options,
	value,
	directions,
	onValueChange,
	className,
}: SortMenuProps<TColumn>) => {
	const label =
		options.find((option) => option.value === value.column)?.label ??
		value.column;
	const descending = value.direction === "DESC";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<ListMenuButton
						aria-label={`Ordenar por ${label.toLowerCase()}, ${directionLabels[value.direction].toLowerCase()}`}
						className={className}
					/>
				}
			>
				<ListMenuButtonText
					label="Ordenar por"
					value={label}
					icon={
						descending ? (
							<ArrowDown aria-hidden="true" />
						) : (
							<ArrowUp aria-hidden="true" />
						)
					}
				/>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="min-w-48">
				<DropdownMenuGroup>
					<DropdownMenuGroupLabel>Ordenar por</DropdownMenuGroupLabel>
					<DropdownMenuRadioGroup
						value={value.column}
						onValueChange={(column: TColumn) =>
							onValueChange({ column, direction: directions[column] })
						}
					>
						{options.map((option) => (
							<DropdownMenuRadioItem key={option.value} value={option.value}>
								{option.label}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuGroupLabel>Direção</DropdownMenuGroupLabel>
					<DropdownMenuRadioGroup
						value={value.direction}
						onValueChange={(direction: SortDirection) =>
							onValueChange({ column: value.column, direction })
						}
					>
						{sortDirectionSchema.options.map((direction) => (
							<DropdownMenuRadioItem key={direction} value={direction}>
								{directionLabels[direction]}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
