import { ListMenuButton } from "@components/ListMenuButton";
import { Download } from "lucide-react";

interface ExportCsvButtonProps {
	isPending?: boolean;
	onExport: () => void;
	className?: string;
}

export const ExportCsvButton = ({
	isPending = false,
	onExport,
	className,
}: ExportCsvButtonProps) => (
	<ListMenuButton
		className={className}
		disabled={isPending}
		focusableWhenDisabled
		onClick={onExport}
	>
		<Download aria-hidden="true" />
		{isPending ? "Exportando..." : "Exportar CSV"}
	</ListMenuButton>
);
