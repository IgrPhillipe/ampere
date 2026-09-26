import { Button } from "@components/ui/button";
import { Link } from "@tanstack/react-router";

export const NotFound = () => (
	<div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
		<div className="flex flex-col gap-1">
			<p className="font-heading text-3xl font-semibold">404</p>

			<p className="text-sm text-muted-foreground">
				Esta pagina nao existe ou foi movida.
			</p>
		</div>

		<Button render={<Link to="/" />}>Voltar para o Início</Button>
	</div>
);
