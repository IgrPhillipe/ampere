import { Input } from "@components/ui/input";
import { cn } from "@lib/utils";
import { Search, X } from "lucide-react";
import type { ChangeEvent } from "react";

interface SearchInputProps {
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	/** Rotulo do campo para leitor de tela. O placeholder nao serve de nome. */
	label: string;
	className?: string;
}

/**
 * `appearance-none` no cancel-button: `type="search"` desenha o proprio botao de
 * limpar no navegador, que colidia com o desenhado abaixo. Os dois estao certos
 * sozinhos; so se atropelam juntos.
 */
const inputClassName =
	"rounded-none border-x-0 border-t-0 pr-11 pl-10 shadow-none [&::-webkit-search-cancel-button]:appearance-none";

/** Campo de busca com lupa e botao de limpar. */
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
				className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
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
					className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				>
					<X className="size-4" aria-hidden="true" />
				</button>
			) : null}
		</div>
	);
};
