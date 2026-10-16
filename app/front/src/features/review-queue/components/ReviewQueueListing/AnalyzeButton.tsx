import { RowAction } from "@components/RowAction";

interface AnalyzeButtonProps {
	/** Overdue or due today: a filled button. Otherwise it can wait, so a link. */
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
