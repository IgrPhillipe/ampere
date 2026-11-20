import { type DateRange, DateRangeFilter } from "@components/DateRangeFilter";
import { MultiFilterMenu } from "@components/MultiFilterMenu";
import { SearchableFilterMenu } from "@components/SearchableFilterMenu";
import { SearchInput } from "@components/SearchInput";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import {
	CONCESSION_STATES,
	type ConcessionState,
	concessionMunicipalityNames,
	concessionStateNames,
} from "@services/locations";
import {
	type MyReviewCounts,
	type MyReviewFilter,
	myReviewFilterSchema,
} from "@services/review-queue";

import { myReviewFilterCountKeys, myReviewFilterLabels } from "../../constants";

const stateOptions = CONCESSION_STATES.map((value) => ({
	value,
	label: concessionStateNames[value],
}));

interface MyReviewsToolbarProps {
	search: string;
	onSearchChange: (value: string) => void;
	decision: MyReviewFilter;
	onDecisionChange: (value: MyReviewFilter) => void;
	/** Without `counts` the chips show no number yet. */
	counts?: MyReviewCounts;
	state: ConcessionState[];
	onStateChange: (value: ConcessionState[]) => void;
	municipality: string[];
	onMunicipalityChange: (value: string[]) => void;
	period: DateRange;
	onPeriodChange: (value: DateRange) => void;
	className?: string;
}

/** H13: search, decision chips with their counts and the dropdowns on one line, over a rule. */
export const MyReviewsToolbar = ({
	search,
	onSearchChange,
	decision,
	onDecisionChange,
	counts,
	state,
	onStateChange,
	municipality,
	onMunicipalityChange,
	period,
	onPeriodChange,
	className,
}: MyReviewsToolbarProps) => (
	<div
		className={cn(
			"flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border px-gutter py-5 md:px-gutter-md",
			className,
		)}
	>
		<div className="w-full md:w-72 md:shrink-0">
			<SearchInput
				value={search}
				onValueChange={onSearchChange}
				placeholder="Protocolo, projeto ou projetista"
				label="Buscar nos meus pareceres"
			/>
		</div>

		<div
			role="group"
			aria-label="Filtrar pareceres por decisão"
			className="flex border border-border"
		>
			{myReviewFilterSchema.options.map((option) => (
				<button
					key={option}
					type="button"
					aria-pressed={decision === option}
					onClick={() => onDecisionChange(option)}
					className="flex h-8 items-center gap-2 px-3 font-mono text-2xs tracking-[0.11em] text-muted-foreground uppercase transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset aria-pressed:bg-foreground aria-pressed:text-background"
				>
					{myReviewFilterLabels[option]}
					{/* Keeps the label and the count apart for screen readers. */}{" "}
					{counts ? (
						<span className="font-semibold">
							{padCount(counts[myReviewFilterCountKeys[option]])}
						</span>
					) : null}
				</button>
			))}
		</div>

		<div className="flex flex-wrap items-center gap-1.5">
			<DateRangeFilter
				label="Decidido em"
				allLabel="Qualquer data"
				value={period}
				onValueChange={onPeriodChange}
			/>
			<MultiFilterMenu
				label="UF"
				allLabel="Todas"
				options={stateOptions}
				value={state}
				onValueChange={onStateChange}
			/>
			<SearchableFilterMenu
				label="Município"
				allLabel="Todos"
				searchPlaceholder="Buscar município"
				emptyMessage="Nenhum município encontrado."
				options={concessionMunicipalityNames(state)}
				value={municipality}
				onValueChange={onMunicipalityChange}
			/>
		</div>
	</div>
);
