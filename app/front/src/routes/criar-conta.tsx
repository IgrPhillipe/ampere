import { RegisterPage } from "@features/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/criar-conta")({
	component: RegisterPage,
});
