import { RowAction } from "@components/RowAction";

interface AnalyzeButtonProps {
	/** Overdue or due today. The Figma draws every row action alike; kept for callers. */
	urgent: boolean;
	onAnalyze: () => void;
	buttonClassName?: string;
}

export const AnalyzeButton = ({
	urgent,
	onAnalyze,
	buttonClassName,
}: AnalyzeButtonProps) => (
	<RowAction
		label="Analisar"
		required={urgent}
		buttonClassName={buttonClassName}
		onClick={onAnalyze}
	/>
);
