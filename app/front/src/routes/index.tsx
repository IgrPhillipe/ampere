import { redirectToRoleHome } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: redirectToRoleHome(),
});
