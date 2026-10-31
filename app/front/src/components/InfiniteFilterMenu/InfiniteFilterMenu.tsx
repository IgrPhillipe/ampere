import { type FilterOption } from "@components/FilterMenu";
import { ListMenuButton, ListMenuButtonText } from "@components/ListMenuButton";
import { Button } from "@components/ui/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxItem,
	ComboboxTrigger,
} from "@components/ui/combobox";
import { useDebouncedValue } from "@features/shared";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const SEARCH_DEBOUNCE_MS = 300;

interface InfiniteFilterMenuProps {
	label: string;
	/** Null means no filter. */
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
	allLabel: string;
	/** The label of the button that clears the selection; defaults to `allLabel`. */
	clearLabel?: string;
	searchPlaceholder: string;
	emptyMessage: string;
	disabled?: boolean;
	className?: string;
}

export const InfiniteFilterMenu = ({
	label,
	value,
	onValueChange,
	options,
	selectedLabel,
	onSearchChange,
	hasNextPage,
	isFetchingNextPage,
	isLoading,
	onLoadMore,
	allLabel,
	clearLabel = allLabel,
	searchPlaceholder,
	emptyMessage,
	disabled,
	className,
}: InfiniteFilterMenuProps) => {
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
	const summary = selected?.label ?? allLabel;

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
			<ComboboxTrigger
				render={
					<ListMenuButton
						active={value !== null}
						aria-label={`${label}: ${summary}`}
						className={className}
					/>
				}
			>
				<ListMenuButtonText
					label={label}
					value={summary}
					icon={<ChevronDown aria-hidden="true" />}
				/>
			</ComboboxTrigger>

			<ComboboxContent
				searchPlaceholder={searchPlaceholder}
				emptyMessage={isLoading ? "Carregando" : emptyMessage}
				footer={
					<Button
						type="button"
						variant="ghost"
						size="xs"
						disabled={value === null}
						onClick={() => onValueChange(null)}
						className="w-full justify-start"
					>
						{clearLabel}
					</Button>
				}
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
