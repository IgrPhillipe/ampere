import { PageLayout } from "@components/layout";
import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface ProjectDetailLayoutProps {
	header: ReactNode;
	notices?: ReactNode;
	/** The bar with the actions of the profile. */
	footer: ReactNode;
	aside: ReactNode;
	/** The long content, usually the `ProjectDetailTabs`. */
	children: ReactNode;
	className?: string;
}

/** The DOM follows the phone order, summary and actions first; from `lg` the grid moves the bar to the bottom. */
export const ProjectDetailLayout = ({
	header,
	notices,
	footer,
	aside,
	children,
	className,
}: ProjectDetailLayoutProps) => (
	<PageLayout
		bleed
		className={cn(
			"mx-auto min-h-full w-full max-w-page pb-0 md:pb-0",
			className,
		)}
	>
		<div className="flex flex-1 flex-col bg-card lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:grid-rows-[auto_auto_1fr_auto]">
			<div className="lg:col-span-2 lg:row-start-1">{header}</div>

			{notices ? (
				<div className="lg:col-span-2 lg:row-start-2">{notices}</div>
			) : null}

			<div className="border-b border-border lg:col-span-2 lg:row-start-4 lg:border-t lg:border-b-0">
				{footer}
			</div>

			<div className="border-b border-border lg:col-start-2 lg:row-start-3 lg:border-b-0 lg:border-l">
				{aside}
			</div>

			<div className="min-w-0 lg:col-start-1 lg:row-start-3">{children}</div>
		</div>
	</PageLayout>
);
