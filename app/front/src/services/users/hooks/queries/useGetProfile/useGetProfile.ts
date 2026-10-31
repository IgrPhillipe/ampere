import { useQuery } from "@tanstack/react-query";

import { userKeys } from "../../../query-keys";
import { getProfile } from "../../../requests";

export const useGetProfile = () =>
	useQuery({
		queryKey: userKeys.profile(),
		queryFn: getProfile,
	});
