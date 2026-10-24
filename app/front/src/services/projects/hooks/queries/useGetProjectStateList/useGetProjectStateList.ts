import { useQuery } from "@tanstack/react-query";

import { projectKeys } from "../../../query-keys";
import { getProjectStateList } from "../../../requests";

export const useGetProjectStateList = () =>
	useQuery({ queryKey: projectKeys.states(), queryFn: getProjectStateList });
