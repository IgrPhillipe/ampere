import { ReviewQueuePage } from "@features/review-queue";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/fila-de-analise/")({
	beforeLoad: requireRoles(ROLE_ACCESS.reviewQueue),
	head: () => ({ meta: [{ title: pageTitle("Fila de Análise") }] }),
	component: ReviewQueuePage,
});
