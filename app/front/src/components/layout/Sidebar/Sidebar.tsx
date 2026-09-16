import { Sheet, SheetContent, SheetTitle } from "@components/ui/sheet";

import { SidebarNav } from "./SidebarNav";

const SidebarBody = ({ onNavigate }: { onNavigate?: () => void }) => (
	<div className="flex h-full flex-col gap-4 p-3">
		<div className="px-3 py-2">
			<span className="font-heading text-lg font-semibold tracking-tight">
				AMPERE
			</span>
		</div>

		<SidebarNav onNavigate={onNavigate} />
	</div>
);

interface SidebarProps {
	mobileOpen: boolean;
	onMobileOpenChange: (open: boolean) => void;
}

export const Sidebar = ({ mobileOpen, onMobileOpenChange }: SidebarProps) => (
	<>
		<aside className="hidden w-60 shrink-0 border-r bg-sidebar md:block">
			<SidebarBody />
		</aside>

		<Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
			<SheetContent side="left" className="w-64 bg-sidebar p-0">
				<SheetTitle className="sr-only">Menu de navegacao</SheetTitle>

				<SidebarBody onNavigate={() => onMobileOpenChange(false)} />
			</SheetContent>
		</Sheet>
	</>
);
