import { textFieldSchema } from "@features/shared";
import { z } from "zod";

const envSchema = z.object({
	/**
	 * O default mora no schema, nao num `||` depois do parse: com
	 * `textFieldSchema` obrigatorio, o `parse` estourava antes e o fallback
	 * documentado era codigo inalcancavel. Quem clonava o repositorio e
	 * esquecia o `.env.example` recebia erro do Zod no carregamento do modulo.
	 */
	VITE_API_URL: textFieldSchema.optional().default("/api"),
	/**
	 * Liga os mocks do MSW. Desligado por padrao: o back-end existe e a Entrega
	 * 02 exige que as historias leiam e escrevam no banco de verdade, entao o
	 * caminho normal de desenvolvimento e a API real. Ligue quando precisar
	 * mexer no front sem subir o back.
	 *
	 * Vem como string do `import.meta.env` — variavel de ambiente nao tem tipo.
	 */
	VITE_ENABLE_MSW: z
		.enum(["true", "false"])
		.optional()
		.default("false")
		.transform((value) => value === "true"),
});

const env = envSchema.parse(import.meta.env);

export type Env = z.infer<typeof envSchema>;

export const AppConfig = {
	API_URL: env.VITE_API_URL,
	ENABLE_MSW: env.VITE_ENABLE_MSW,
	/**
	 * Builtin do Vite, nao configuracao da aplicacao — mas a regra de nao ler
	 * `import.meta.env` fora daqui vale para ele tambem, entao sai por aqui em
	 * vez de ganhar excecao.
	 */
	IS_DEV: import.meta.env.DEV,
};
