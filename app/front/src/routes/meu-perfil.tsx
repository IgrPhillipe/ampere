import { ProfilePage } from "@features/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/meu-perfil")({
	component: ProfilePage,
});
