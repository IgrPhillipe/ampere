import { type FilterOption } from "@components/FilterMenu";
import {
	Combobox,
	ComboboxContent,
	ComboboxItem,
} from "@components/ui/combobox";
import { useDebouncedValue } from "@features/shared";
import { type ReactNode, useEffect, useState } from "react";

const SEARCH_DEBOUNCE_MS = 300;

export interface InfiniteComboboxProps {
	/** Null means nothing picked. */
	value: string | null;
	onValueChange: (value: string | null) => void;
	/** The options loaded so far; the search runs on the server, not here. */
	options: readonly FilterOption[];
	/** The selected option may not be among the loaded pages, so its name comes apart. */
	selectedLabel?: string;
	/** Called with the debounced search, and with an empty one when the menu closes. */
	onSearchChange: (search: string) => void;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	isLoading: boolean;
	onLoadMore: () => void;
	searchPlaceholder: string;
	emptyMessage: string;
	disabled?: boolean;
	/** The `ComboboxTrigger` for the current pick. */
	trigger: (selected: FilterOption | null) => ReactNode;
	footer?: ReactNode;
	contentClassName?: string;
}

/** A combobox that searches on the server and loads the next page at the end of the list. */
export const InfiniteCombobox = ({
	value,
	onValueChange,
	options,
	selectedLabel,
	onSearchChange,
	hasNextPage,
	isFetchingNextPage,
	isLoading,
	onLoadMore,
	searchPlaceholder,
	emptyMessage,
	disabled,
	trigger,
	footer,
	contentClassName,
}: InfiniteComboboxProps) => {
	const [search, setSearch] = useState("");
	const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

	useEffect(() => {
		onSearchChange(debouncedSearch);
	}, [debouncedSearch, onSearchChange]);

	useEffect(() => {
		if (!sentinel || !hasNextPage || isFetchingNextPage) return;
		if (typeof IntersectionObserver === "undefined") return;

		const observer = new IntersectionObserver(([entry]) => {
			if (entry?.isIntersecting) onLoadMore();
		});
		observer.observe(sentinel);

		return () => observer.disconnect();
	}, [sentinel, hasNextPage, isFetchingNextPage, onLoadMore]);

	const selected: FilterOption | null =
		value === null
			? null
			: {
					value,
					label:
						selectedLabel ??
						options.find((option) => option.value === value)?.label ??
						value,
				};

	const handleOpenChange = (open: boolean) => {
		if (open) return;

		setSearch("");
		onSearchChange("");
	};

	return (
		<Combobox
			items={options}
			filter={null}
			value={selected}
			onValueChange={(next: FilterOption | null) =>
				onValueChange(next?.value ?? null)
			}
			isItemEqualToValue={(item: FilterOption, current: FilterOption) =>
				item.value === current.value
			}
			inputValue={search}
			onInputValueChange={setSearch}
			onOpenChange={handleOpenChange}
			locale="pt-BR"
			disabled={disabled}
		>
			{trigger(selected)}

			<ComboboxContent
				searchPlaceholder={searchPlaceholder}
				emptyMessage={isLoading ? "Carregando" : emptyMessage}
				footer={footer}
				className={contentClassName}
			>
				{options.length > 0 || isFetchingNextPage ? (
					<>
						{options.map((option) => (
							<ComboboxItem key={option.value} value={option}>
								{option.label}
							</ComboboxItem>
						))}
						{isFetchingNextPage ? (
							<div
								role="status"
								className="px-2 py-1.5 text-xs text-muted-foreground"
							>
								Carregando mais
							</div>
						) : null}
						{hasNextPage ? (
							<div ref={setSentinel} aria-hidden="true" className="h-px" />
						) : null}
					</>
				) : null}
			</ComboboxContent>
		</Combobox>
	);
};
