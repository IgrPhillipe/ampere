import { MyReviewsPage } from "@features/review-queue";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/meus-pareceres")({
	beforeLoad: requireRoles(ROLE_ACCESS.myReviews),
	head: () => ({ meta: [{ title: pageTitle("Meus Pareceres") }] }),
	component: MyReviewsPage,
});
