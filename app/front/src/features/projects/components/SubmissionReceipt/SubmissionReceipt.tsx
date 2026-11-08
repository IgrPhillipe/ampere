import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

export interface ReceiptItem {
	key: string;
	title: ReactNode;
	description?: ReactNode;
	/** Versalete on the right: a count, a format, a deadline or a status. */
	meta?: ReactNode;
}

interface ReceiptListProps {
	items: ReceiptItem[];
	/** `check` marks each row as done instead of numbering it. */
	marker?: "index" | "check";
	className?: string;
}

/** Numbered rows of the confirmation screens: what was sent, what was fixed, what comes next. */
export const ReceiptList = ({
	items,
	marker = "index",
	className,
}: ReceiptListProps) => (
	<ol className={cn("flex flex-col", className)}>
		{items.map(({ key, title, description, meta }, index) => (
			<li
				key={key}
				className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-y-1.5 border-b border-border py-3 last:border-b-0"
			>
				{marker === "check" ? (
					<Check aria-hidden="true" className="mt-1 size-4 text-foreground" />
				) : (
					<span className="pt-1 font-mono text-2xs tracking-[0.11em] text-faint-foreground">
						{padCount(index + 1)}
					</span>
				)}

				<div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
					<span className="text-base font-medium">{title}</span>
					{meta ? (
						<span className="font-mono text-2xs tracking-[0.11em] whitespace-nowrap text-faint-foreground uppercase">
							{meta}
						</span>
					) : null}
				</div>

				{description ? (
					<p className="col-start-2 text-sm text-muted-foreground">
						{description}
					</p>
				) : null}
			</li>
		))}
	</ol>
);
