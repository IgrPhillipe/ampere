import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fila-de-analise/$id")({
	beforeLoad: ({ params }) => {
		throw redirect({ to: "/projetos/$id", params });
	},
});
