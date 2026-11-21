import type { ReactNode } from "react";

interface DashboardLayoutProps {
	band: ReactNode;
	/** What to follow: lists and charts, on the wider column. */
	main: ReactNode;
	/** What needs action now, on the right. */
	aside: ReactNode;
}

/** Every panel's frame: the green band, then the follow-up and the "Exige Ação" columns. */
export const DashboardLayout = ({
	band,
	main,
	aside,
}: DashboardLayoutProps) => (
	<div className="flex flex-1 flex-col bg-card">
		{band}

		{/* One explicit column on mobile, so a wide chart scrolls inside it instead of widening it. */}
		<div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)]">
			<div className="flex flex-col gap-10 px-gutter py-7 md:px-gutter-md">
				{main}
			</div>

			<div className="border-t border-border px-gutter py-7 md:px-gutter-md lg:border-t-0 lg:border-l">
				{aside}
			</div>
		</div>
	</div>
);
