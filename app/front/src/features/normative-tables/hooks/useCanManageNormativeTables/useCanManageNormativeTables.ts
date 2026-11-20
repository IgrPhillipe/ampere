import { useAuthStore } from "@features/shared";

/** Reviewer and admin register and approve revisions; the API keeps whoever registered from approving. */
export const useCanManageNormativeTables = () =>
	useAuthStore(
		(state) => state.user?.role === "reviewer" || state.user?.role === "admin",
	);
