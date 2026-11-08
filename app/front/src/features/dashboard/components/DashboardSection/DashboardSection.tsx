import { SectionHeading } from "@components/SectionHeading";
import { cn } from "@lib/utils";
import type { ReactNode } from "react";
import { useId } from "react";

interface DashboardSectionProps {
	title: string;
	/** Versalete caption on the right of the title. */
	caption?: string;
	children: ReactNode;
	className?: string;
}

export const DashboardSection = ({
	title,
	caption,
	children,
	className,
}: DashboardSectionProps) => {
	const titleId = useId();

	return (
		<section
			aria-labelledby={titleId}
			className={cn("flex flex-col", className)}
		>
			<SectionHeading id={titleId} meta={caption}>
				{title}
			</SectionHeading>
			{children}
		</section>
	);
};

/** Muted line shown when a section has nothing to list. */
export const DashboardSectionEmpty = ({
	children,
}: {
	children: ReactNode;
}) => <p className="py-5 text-sm text-muted-foreground">{children}</p>;
