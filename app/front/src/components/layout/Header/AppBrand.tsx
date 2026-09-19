import { Link } from "@tanstack/react-router";

export const AppBrand = () => (
	<Link
		to="/"
		aria-label="AMPERE — ir para Meus projetos"
		className="flex shrink-0 items-center gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
	>
		<img
			src="/neoenergia-logo.svg"
			alt=""
			aria-hidden="true"
			className="h-8 w-auto"
		/>

		<span className="hidden text-[0.625rem] font-medium tracking-[0.18em] text-muted-foreground uppercase sm:inline">
			Projetos elétricos
		</span>
	</Link>
);
