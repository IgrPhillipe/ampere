import { Button } from "@components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@components/ui/tooltip";
import { Download } from "lucide-react";

interface CalculationExportButtonProps {
	disabled: boolean;
	isPending?: boolean;
	onExport?: () => void;
}

export const CalculationExportButton = ({
	disabled,
	isPending = false,
	onExport,
}: CalculationExportButtonProps) => {
	const button = (
		<Button
			type="button"
			variant="link"
			className="h-auto w-fit px-0"
			disabled={disabled || isPending || !onExport}
			onClick={onExport}
		>
			<Download aria-hidden="true" />
			Exportar Planilha
		</Button>
	);

	if (!disabled && !isPending && onExport) return button;

	return (
		<Tooltip>
			<TooltipTrigger
				render={<span tabIndex={0} className="inline-flex w-fit" />}
			>
				{button}
			</TooltipTrigger>
			<TooltipContent>
				{isPending
					? "Aguarde a exportação da planilha."
					: "É preciso calcular a demanda antes de exportar a planilha."}
			</TooltipContent>
		</Tooltip>
	);
};
