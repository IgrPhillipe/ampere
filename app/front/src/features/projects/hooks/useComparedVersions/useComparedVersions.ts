import { parseAsInteger, useQueryStates } from "nuqs";

/** The pair under comparison lives in the URL, named as in the API, so it can be shared and reloaded. */
export const useComparedVersions = () => {
	const [query, setQuery] = useQueryStates({
		from: parseAsInteger,
		to: parseAsInteger,
	});

	const compared =
		query.from !== null && query.to !== null && query.from !== query.to
			? { from: query.from, to: query.to }
			: null;

	return {
		compared,
		compare: ({ from, to }: { from: number; to: number }) =>
			void setQuery({ from, to }),
		close: () => void setQuery({ from: null, to: null }),
	};
};
