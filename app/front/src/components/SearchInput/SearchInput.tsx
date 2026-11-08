import { Input } from "@components/ui/input";
import { cn } from "@lib/utils";
import { Search, X } from "lucide-react";
import type { ChangeEvent } from "react";

interface SearchInputProps {
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	/** Field label for screen readers. The placeholder is not a name. */
	label: string;
	className?: string;
}

const inputClassName =
	"rounded-none border-x-0 border-t-0 pr-10 pl-7 shadow-none [&::-webkit-search-cancel-button]:appearance-none";

export const SearchInput = ({
	value,
	onValueChange,
	placeholder,
	label,
	className,
}: SearchInputProps) => {
	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		onValueChange(event.target.value);
	};

	return (
		<div className={cn("relative w-full max-w-xl", className)}>
			<Search
				className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-faint-foreground"
				aria-hidden="true"
			/>
			<Input
				type="search"
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
				aria-label={label}
				className={inputClassName}
			/>
			{value ? (
				<button
					type="button"
					onClick={() => onValueChange("")}
					aria-label="Limpar busca"
					className="absolute top-1/2 right-0 flex size-8 -translate-y-1/2 items-center justify-center text-faint-foreground hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				>
					<X className="size-4" aria-hidden="true" />
				</button>
			) : null}
		</div>
	);
};
