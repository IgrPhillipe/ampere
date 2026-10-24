import { ListMenuButton, ListMenuButtonText } from "@components/ListMenuButton";
import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@components/ui/popover";
import dayjs from "@lib/dayjs";
import { CalendarDays } from "lucide-react";
import { useState } from "react";

const ISO_DATE = "YYYY-MM-DD";

/** `YYYY-MM-DD` on both ends; `null` leaves that end open. */
export interface DateRange {
	from: string | null;
	to: string | null;
}

interface DateRangeFilterProps {
	label: string;
	value: DateRange;
	onValueChange: (value: DateRange) => void;
	allLabel: string;
	className?: string;
}

interface Draft {
	from?: Date;
	to?: Date;
}

const toDate = (value: string | null) =>
	value ? dayjs(value, ISO_DATE).toDate() : undefined;

const toIso = (date: Date) => dayjs(date).format(ISO_DATE);

const format = (value: string) => dayjs(value, ISO_DATE).format("DD/MM/YYYY");

const rangeLabel = ({ from, to }: DateRange) => {
	if (from && to) {
		return from === to ? format(from) : `${format(from)} a ${format(to)}`;
	}
	if (from) return `Desde ${format(from)}`;
	if (to) return `Até ${format(to)}`;
	return null;
};

export const DateRangeFilter = ({
	label,
	value,
	onValueChange,
	allLabel,
	className,
}: DateRangeFilterProps) => {
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState<Draft>({});
	const current = rangeLabel(value);

	const openChange = (next: boolean) => {
		setDraft({ from: toDate(value.from), to: toDate(value.to) });
		setOpen(next);
	};

	// The first click starts a new range, the second closes it; only a full range reaches the URL.
	const pick = (day: Date) => {
		if (!draft.from || draft.to || day < draft.from) {
			setDraft({ from: day });
			return;
		}

		onValueChange({ from: toIso(draft.from), to: toIso(day) });
		setOpen(false);
	};

	const clear = () => {
		onValueChange({ from: null, to: null });
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={openChange}>
			<PopoverTrigger
				render={
					<ListMenuButton
						active={current !== null}
						aria-label={`${label}: ${current ?? allLabel}`}
						className={className}
					/>
				}
			>
				<ListMenuButtonText
					label={label}
					value={current ?? allLabel}
					icon={<CalendarDays aria-hidden="true" />}
				/>
			</PopoverTrigger>

			<PopoverContent align="start" className="w-auto p-0">
				<Calendar
					mode="range"
					numberOfMonths={2}
					defaultMonth={draft.from}
					selected={draft.from ? { from: draft.from, to: draft.to } : undefined}
					onSelect={(_range, day) => pick(day)}
					classNames={{
						month: "flex w-full flex-col gap-4 [&+&]:hidden sm:[&+&]:flex",
					}}
				/>
				<div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
					<span className="text-xs text-muted-foreground">
						{draft.from && !draft.to
							? "Escolha a data final"
							: "Escolha a data inicial"}
					</span>
					<Button
						type="button"
						variant="ghost"
						size="xs"
						onClick={clear}
						disabled={current === null}
					>
						Limpar Período
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};
