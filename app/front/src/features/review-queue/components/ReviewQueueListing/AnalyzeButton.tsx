import { RowAction } from "@components/RowAction";

interface AnalyzeButtonProps {
	/** Overdue or due today. The Figma draws every row action alike; kept for callers. */
	urgent: boolean;
	/** Someone else holds the project, so it opens for consultation. */
	consult?: boolean;
	onAnalyze: () => void;
	buttonClassName?: string;
}

export const AnalyzeButton = ({
	urgent,
	consult = false,
	onAnalyze,
	buttonClassName,
}: AnalyzeButtonProps) => (
	<RowAction
		label={consult ? "Consultar" : "Analisar"}
		required={urgent && !consult}
		buttonClassName={buttonClassName}
		onClick={onAnalyze}
	/>
);
