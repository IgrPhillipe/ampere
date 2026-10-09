import { Button } from "@components/ui/button";
import { ArrowRight } from "lucide-react";

export const AnalyzeButton = () => (
	<Button
		type="button"
		variant="link"
		size="xs"
		aria-disabled="true"
		title="A análise individual estará disponível em uma próxima etapa."
		onClick={(event) => event.preventDefault()}
		className="font-medium text-foreground underline decoration-current/40 hover:text-foreground hover:decoration-current"
	>
		Analisar
		<ArrowRight aria-hidden="true" />
	</Button>
);
