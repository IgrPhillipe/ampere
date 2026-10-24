import { useQuery } from "@tanstack/react-query";

import { projectKeys } from "../../../query-keys";
import { getProjectOwnerList } from "../../../requests";

interface UseGetProjectOwnerListOptions {
	enabled?: boolean;
}

export const useGetProjectOwnerList = ({
	enabled = true,
}: UseGetProjectOwnerListOptions = {}) =>
	useQuery({
		queryKey: projectKeys.owners(),
		queryFn: getProjectOwnerList,
		enabled,
	});
