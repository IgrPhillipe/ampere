import { ListMenuButton } from "@components/ListMenuButton";
import { Download } from "lucide-react";

interface ExportCsvButtonProps {
	disabled?: boolean;
	isPending?: boolean;
	onExport: () => void;
	className?: string;
}

export const ExportCsvButton = ({
	disabled = false,
	isPending = false,
	onExport,
	className,
}: ExportCsvButtonProps) => (
	<ListMenuButton
		className={className}
		disabled={disabled || isPending}
		focusableWhenDisabled={isPending}
		onClick={onExport}
	>
		<Download aria-hidden="true" />
		{isPending ? "Exportando..." : "Exportar CSV"}
	</ListMenuButton>
);
