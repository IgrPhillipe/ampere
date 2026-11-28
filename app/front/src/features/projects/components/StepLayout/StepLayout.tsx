import { cn } from "@lib/utils";
import type { ReactNode } from "react";

import { useStepPanelLayout } from "./step-layout";

interface StepLayoutProps {
	panel: ReactNode;
	/** Where the panel goes when the designer's view stacks, above or below the data. */
	stacks: "before" | "after";
	/** Room for the traceability values beside the data. */
	wide?: boolean;
	children: ReactNode;
}

/** The step's data with its panel; in review the panel comes first, as a strip, so the findings keep the only side column. */
export const StepLayout = ({
	panel,
	stacks,
	wide = false,
	children,
}: StepLayoutProps) => {
	if (useStepPanelLayout() === "strip") {
		return (
			<div className="flex flex-1 flex-col">
				<div className="flex flex-col border-b border-border">{panel}</div>
				{children}
			</div>
		);
	}

	return (
		<div
			className={cn(
				"grid flex-1",
				wide
					? "@5xl:grid-cols-[minmax(0,1fr)_440px]"
					: "@5xl:grid-cols-[minmax(0,1fr)_400px]",
			)}
		>
			{children}
			<div
				className={cn(
					"flex flex-col border-border @5xl:border-l",
					stacks === "before"
						? "order-first border-b @5xl:order-none @5xl:border-b-0"
						: "border-t @5xl:border-t-0",
				)}
			>
				{panel}
			</div>
		</div>
	);
};
