import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/projetos/$id/memorial")({
	beforeLoad: ({ params, location }) => {
		throw redirect({
			to: "/projetos/$id/documentos",
			params,
			hash: location.hash,
		});
	},
});
