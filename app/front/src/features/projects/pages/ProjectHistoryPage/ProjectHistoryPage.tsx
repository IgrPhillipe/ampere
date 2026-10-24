import { EmptyState } from "@components/EmptyState";
import { History } from "lucide-react";

export const ProjectHistoryPage = () => (
	<div className="flex-1 px-6 py-8 md:px-8">
		<EmptyState
			title="Histórico do protocolo"
			description="A linha do tempo com as versões e as decisões deste protocolo será exibida aqui."
			icon={History}
		/>
	</div>
);
