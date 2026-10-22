import { Label } from "@components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/ui/select";
import { cn } from "@lib/utils";
import { useId } from "react";

const ALL = "__all__";

export interface FilterOption {
	value: string;
	label: string;
}

interface FilterSelectProps {
	label: string;
	/** `null` means no filter. */
	value: string | null;
	onValueChange: (value: string | null) => void;
	/** An array, not a map: numeric ids as object keys would jump ahead of the rest. */
	options: readonly FilterOption[];
	/** The option that clears the filter: "Todos". */
	allLabel: string;
	disabled?: boolean;
	className?: string;
}

export const FilterSelect = ({
	label,
	value,
	onValueChange,
	options,
	allLabel,
	disabled,
	className,
}: FilterSelectProps) => {
	const id = useId();
	const items = [{ value: ALL, label: allLabel }, ...options];

	return (
		<div className={cn("flex w-full flex-col gap-1.5 sm:w-56", className)}>
			<Label htmlFor={id} className="text-xs text-muted-foreground">
				{label}
			</Label>
			<Select
				items={items}
				value={value ?? ALL}
				onValueChange={(next) => onValueChange(next === ALL ? null : next)}
				disabled={disabled}
			>
				<SelectTrigger id={id}>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{items.map((item) => (
						<SelectItem key={item.value} value={item.value}>
							{item.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};
