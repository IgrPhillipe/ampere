import { cn } from "@lib/utils";
import { useId, useState } from "react";

const LONG_TEXT = 280;

interface ExpandableTextProps {
	text: string;
	className?: string;
}

/** Long text opens clamped to four lines, with a toggle to read the rest. */
export const ExpandableText = ({ text, className }: ExpandableTextProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const id = useId();
	const isLong = text.length > LONG_TEXT;

	return (
		<div className="flex flex-col items-start gap-1">
			<p
				id={id}
				className={cn(
					"text-sm break-words whitespace-pre-line text-foreground",
					isLong && !isOpen && "line-clamp-4",
					className,
				)}
			>
				{text}
			</p>
			{isLong ? (
				<button
					type="button"
					aria-expanded={isOpen}
					aria-controls={id}
					onClick={() => setIsOpen((open) => !open)}
					className="text-xs font-medium text-foreground underline decoration-current/40 underline-offset-4 hover:decoration-current focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				>
					{isOpen ? "Ver Menos" : "Ver Mais"}
				</button>
			) : null}
		</div>
	);
};
