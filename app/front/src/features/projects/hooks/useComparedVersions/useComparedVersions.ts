import { parseAsInteger, useQueryStates } from "nuqs";

/** The pair under comparison lives in the URL, named as in the API, so it can be shared and reloaded. */
export const useComparedVersions = () => {
	const [query, setQuery] = useQueryStates({
		from: parseAsInteger,
		to: parseAsInteger,
	});

	// The API compares an older version to a newer one; a reversed link still opens.
	const compared =
		query.from !== null && query.to !== null && query.from !== query.to
			? {
					from: Math.min(query.from, query.to),
					to: Math.max(query.from, query.to),
				}
			: null;

	return {
		compared,
		compare: ({ from, to }: { from: number; to: number }) =>
			void setQuery({ from, to }),
		close: () => void setQuery({ from: null, to: null }),
	};
};
