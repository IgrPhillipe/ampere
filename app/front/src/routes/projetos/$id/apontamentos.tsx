import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/projetos/$id/apontamentos")({
	beforeLoad: ({ params }) => {
		throw redirect({ to: "/projetos/$id", params });
	},
});
