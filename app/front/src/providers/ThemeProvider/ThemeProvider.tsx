import { useAppStore } from "@features/shared";
import type { ReactNode } from "react";
import { useEffect } from "react";

interface ThemeProviderProps {
	children: ReactNode;
}

/**
 * Reflete o tema do `useAppStore` na classe do `<html>`, que e o que ativa
 * o bloco `.dark` dos tokens em `src/styles/index.css`.
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
	const theme = useAppStore((state) => state.theme);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);

	return children;
};
