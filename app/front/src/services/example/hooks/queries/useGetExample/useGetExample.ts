import { useQuery } from "@tanstack/react-query";

import { exampleKeys } from "../../../query-keys";
import { getExample } from "../../../requests";

export const useGetExample = (id: string) =>
	useQuery({
		queryKey: exampleKeys.detail(id),
		queryFn: () => getExample(id),
	});
