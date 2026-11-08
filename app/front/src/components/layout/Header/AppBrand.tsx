import { Link } from "@tanstack/react-router";

export const AppBrand = () => (
	<Link
		to="/"
		aria-label="AMPERE, ir para a página inicial"
		className="flex shrink-0 items-center gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
	>
		<img
			src="/neoenergia-logo.svg"
			alt=""
			aria-hidden="true"
			className="h-7 w-auto"
		/>

		<span aria-hidden="true" className="hidden h-5 w-px bg-border sm:block" />

		<span className="hidden font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase sm:inline">
			AMPERE
		</span>
	</Link>
);
