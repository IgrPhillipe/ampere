import { useQuery } from "@tanstack/react-query";

import { submissionKeys } from "../../../query-keys";
import { getSubmissionChecklist } from "../../../requests";

export const useGetSubmission = (projectId: string) =>
	useQuery({
		queryKey: submissionKeys.checklist(projectId),
		queryFn: () => getSubmissionChecklist(projectId),
	});
