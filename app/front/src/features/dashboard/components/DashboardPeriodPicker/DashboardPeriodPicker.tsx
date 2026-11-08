import { cn } from "@lib/utils";
import {
	type DashboardPeriod,
	dashboardPeriodSchema,
} from "@services/dashboard";

import { dashboardPeriodLabels } from "../../constants";

interface DashboardPeriodPickerProps {
	value: DashboardPeriod;
	onValueChange: (value: DashboardPeriod) => void;
	className?: string;
}

export const DashboardPeriodPicker = ({
	value,
	onValueChange,
	className,
}: DashboardPeriodPickerProps) => (
	<div
		role="group"
		aria-label="Período dos indicadores"
		className={cn("flex border border-border", className)}
	>
		{dashboardPeriodSchema.options.map((period) => (
			<button
				key={period}
				type="button"
				aria-pressed={value === period}
				onClick={() => onValueChange(period)}
				className="h-8 px-3 font-mono text-2xs tracking-[0.11em] text-muted-foreground uppercase transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset aria-pressed:bg-foreground aria-pressed:text-background"
			>
				{dashboardPeriodLabels[period]}
			</button>
		))}
	</div>
);
