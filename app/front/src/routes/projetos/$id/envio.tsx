import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/projetos/$id/envio")({
	beforeLoad: ({ params }) => {
		throw redirect({ to: "/projetos/$id", params });
	},
});
