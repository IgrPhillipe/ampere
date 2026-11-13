import { AppBrand, Eyebrow } from "@components/layout";
import type { ReactNode } from "react";

interface AuthLayoutProps {
	/** Versalete line above the title. */
	eyebrow?: ReactNode;
	title: string;
	description: ReactNode;
	/** Requirements note closing the column, after the actions. */
	note?: ReactNode;
	children: ReactNode;
}

/** Access screens: the brand on top and the form in a single column. */
export const AuthLayout = ({
	eyebrow = "Acesso ao portal",
	title,
	description,
	note,
	children,
}: AuthLayoutProps) => (
	<div className="flex min-h-svh flex-col bg-background">
		<header className="h-16 shrink-0 border-b border-border">
			<div className="flex h-full w-full items-center px-4 md:px-10">
				<AppBrand />
			</div>
		</header>

		<main className="flex flex-1 flex-col">
			<div className="flex w-full flex-1 px-4 py-9 md:px-10 md:py-24">
				<div className="m-auto flex w-full max-w-[516px] flex-col gap-5">
					<div className="flex flex-col gap-3 border-b-[1.5px] border-foreground pb-5">
						<Eyebrow>{eyebrow}</Eyebrow>

						<h1 className="font-heading text-3xl font-medium tracking-[-0.032em]">
							{title}
						</h1>

						<p className="text-sm text-muted-foreground">{description}</p>
					</div>

					{children}

					{note ? (
						<p className="flex gap-3 text-xs text-muted-foreground">
							<span
								aria-hidden="true"
								className="mt-1.5 size-1.5 shrink-0 rounded-full bg-border-strong"
							/>
							<span>{note}</span>
						</p>
					) : null}
				</div>
			</div>
		</main>
	</div>
);
