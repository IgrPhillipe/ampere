import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface ProjectDetailFooterProps {
	backLabel: string;
	onBack: () => void;
	summary?: ReactNode;
	children?: ReactNode;
	className?: string;
}

export const ProjectDetailFooter = ({
	backLabel,
	onBack,
	summary,
	children,
	className,
}: ProjectDetailFooterProps) => (
	<div
		className={cn(
			"flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 md:px-8",
			className,
		)}
	>
		<div className="flex shrink-0 items-center gap-4">
			<Button
				type="button"
				variant="outline"
				size="icon"
				aria-label={backLabel}
				onClick={onBack}
			>
				<ArrowLeft aria-hidden="true" />
			</Button>
			{summary}
		</div>

		{children}
	</div>
);
