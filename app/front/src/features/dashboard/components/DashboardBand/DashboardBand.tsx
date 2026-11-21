import { Skeleton } from "@components/ui/skeleton";
import { cn } from "@lib/utils";
import { type ReactNode, useId } from "react";

export interface DashboardBandTile {
	label: string;
	/** `undefined` while loading, `null` when there is nothing to measure. */
	value: ReactNode | null | undefined;
	/** Shown in place of a `null` value. */
	emptyLabel?: string;
}

interface DashboardBandProps {
	title: string;
	tiles: DashboardBandTile[];
	/** Shown in place of the tiles, such as before the first submission. */
	empty?: ReactNode;
	className?: string;
}

/** The panel's conclusion field: four figures on the green band, the same on every panel. */
export const DashboardBand = ({
	title,
	tiles,
	empty,
	className,
}: DashboardBandProps) => {
	const titleId = useId();

	return (
		<section
			aria-labelledby={titleId}
			className={cn("bg-primary text-primary-foreground", className)}
		>
			<h2
				id={titleId}
				className="px-gutter pt-5 font-mono text-2xs tracking-[0.11em] uppercase opacity-85 md:px-gutter-md"
			>
				{title}
			</h2>

			{empty ? (
				<p className="px-gutter pt-3 pb-6 text-base md:px-gutter-md">{empty}</p>
			) : (
				<dl className="grid grid-cols-2 lg:grid-cols-4">
					{tiles.map(({ label, value, emptyLabel }) => (
						<div
							key={label}
							className="relative flex min-h-26 flex-col-reverse justify-center gap-2 pr-5 pl-gutter odd:after:absolute odd:after:inset-y-5 odd:after:right-0 odd:after:w-px odd:after:bg-primary-foreground/25 md:pl-gutter-md lg:not-last:after:absolute lg:not-last:after:inset-y-5 lg:not-last:after:right-0 lg:not-last:after:w-px lg:not-last:after:bg-primary-foreground/25"
						>
							<dt className="font-mono text-2xs tracking-[0.11em] uppercase opacity-85">
								{label}
							</dt>
							<dd className="font-mono text-[2.125rem] leading-none font-medium tracking-[-0.03em] whitespace-nowrap">
								{value === undefined ? (
									<Skeleton className="h-10 w-16 bg-primary-foreground/25" />
								) : (
									(value ?? (
										<span className="text-base font-medium">{emptyLabel}</span>
									))
								)}
							</dd>
						</div>
					))}
				</dl>
			)}
		</section>
	);
};
