import { useQuery } from "@tanstack/react-query";

import { exampleKeys } from "../../../query-keys";
import { getExampleList } from "../../../requests";

export const useGetExampleList = () =>
	useQuery({
		queryKey: exampleKeys.lists(),
		queryFn: getExampleList,
	});
