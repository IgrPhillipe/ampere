import { useQuery } from "@tanstack/react-query";

import { projectReviewKeys } from "../../../query-keys";
import { getDocumentFile } from "../../../requests";

export const useGetDocumentFile = (
	projectId: string,
	documentId: string | undefined,
	{ enabled = true }: { enabled?: boolean } = {},
) =>
	useQuery({
		queryKey: projectReviewKeys.documentFile(projectId, documentId ?? ""),
		queryFn: () => getDocumentFile(projectId, documentId ?? ""),
		enabled: enabled && documentId !== undefined,
		retry: false,
		staleTime: Number.POSITIVE_INFINITY,
	});
