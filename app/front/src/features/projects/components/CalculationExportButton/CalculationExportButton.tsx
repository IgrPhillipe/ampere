import { Button } from "@components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@components/ui/tooltip";
import { cn } from "@lib/utils";
import { Download } from "lucide-react";

export type CalculationExportBlocker = "noCalculation" | "outdated" | "error";

const blockerHints: Record<CalculationExportBlocker, string> = {
	noCalculation: "É preciso calcular a demanda antes de exportar a planilha.",
	outdated: "Recalcule a demanda antes de exportar a planilha.",
	error: "Tente novamente antes de exportar a planilha.",
};

interface CalculationExportButtonProps {
	blocker?: CalculationExportBlocker;
	disabled?: boolean;
	isPending?: boolean;
	onExport?: () => void;
	className?: string;
}

export const CalculationExportButton = ({
	blocker,
	disabled = false,
	isPending = false,
	onExport,
	className,
}: CalculationExportButtonProps) => {
	const hint = isPending
		? "Aguarde a exportação da planilha."
		: blocker && blockerHints[blocker];

	// The tooltip stays mounted in every state so the button keeps its focus.
	return (
		<Tooltip disabled={!hint}>
			<TooltipTrigger
				render={
					<span
						tabIndex={blocker ? 0 : undefined}
						className={cn("inline-flex w-fit", className)}
					/>
				}
			>
				<Button
					type="button"
					variant="link"
					className="h-auto w-fit px-0"
					disabled={disabled || isPending || !!blocker || !onExport}
					focusableWhenDisabled={isPending}
					onClick={onExport}
				>
					<Download aria-hidden="true" />
					{isPending ? "Exportando..." : "Exportar Planilha"}
				</Button>
			</TooltipTrigger>
			<TooltipContent>{hint}</TooltipContent>
		</Tooltip>
	);
};
