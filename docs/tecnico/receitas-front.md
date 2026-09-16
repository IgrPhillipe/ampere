# Receitas do front-end

Passo a passo das quatro coisas que você vai repetir. Cada receita aponta um
arquivo real do repositório para copiar.

Antes de qualquer coisa:

```bash
cd app/front && cp .env.example .env && pnpm install && pnpm dev
```

---

## 1. Criar uma feature

> Feature é **tela**. Se o que você precisa é falar com a API, pule para a receita 2.

**Modelo:** `src/features/auth/`

1. Crie a pasta com as seis subpastas obrigatórias:

```bash
cd app/front/src/features
mkdir -p projects/{pages,components,hooks,schemas,types,store}
```

2. Em cada subpasta que ainda não tem conteúdo, crie um `index.ts` com:

```ts
export {};
```

3. Crie a página em `pages/ProjectListPage/`, sempre pasta + barrel:

```
pages/ProjectListPage/ProjectListPage.tsx   ← export const ProjectListPage = () => ...
pages/ProjectListPage/index.ts              ← export * from "./ProjectListPage";
pages/index.ts                              ← export * from "./ProjectListPage";
```

4. Crie o barrel da feature em `projects/index.ts`:

```ts
export * from "./components";
export * from "./hooks";
export * from "./pages";
export * from "./schemas";
export * from "./store";
export * from "./types";
```

5. Use o `PageLayout` na página, para o cabeçalho sair igual ao das outras:

```tsx
import { PageLayout } from "@components/layout";

export const ProjectListPage = () => (
	<PageLayout title="Projetos" description="Todos os seus projetos elétricos.">
		{/* conteúdo */}
	</PageLayout>
);
```

---

## 2. Criar um service (falar com a API)

> Service é **API**. Uma pasta por entidade.

**Modelo do padrão:** `src/services/example/` · **caso real:** `src/services/auth/`

1. Estrutura:

```
services/projects/
├── endpoints.ts
├── requests.ts
├── query-keys.ts
├── types.ts
├── index.ts
├── schemas/{project.schema.ts, index.ts}
├── mocks/{handlers.ts, factories.ts}
└── hooks/
    ├── index.ts
    ├── queries/<useGetProjects>/{useGetProjects.ts, index.ts}
    └── mutations/<useCreateProject>/{useCreateProject.ts, index.ts}
```

2. **`endpoints.ts`** — nunca escreva URL solta dentro do `requests.ts`:

```ts
export const ProjectsEndpoints = {
	list: "projects",
	detail: (id: string) => `projects/${id}`,
} as const;
```

3. **`schemas/project.schema.ts`** — o tipo sai do schema, nunca em paralelo:

```ts
import { z } from "zod";

export const projectSchema = z.object({ id: z.string(), name: z.string() });

export type Project = z.infer<typeof projectSchema>;
```

4. **`requests.ts`** — funções puras, sem React:

```ts
import type { ApiResponse } from "@features/shared";
import { http } from "@lib/http";

import { ProjectsEndpoints as e } from "./endpoints";
import type { Project } from "./schemas";

export const getProjects = () => http.get(e.list).json<ApiResponse<Project[]>>();
```

5. **`query-keys.ts`** — fábrica hierárquica, para invalidar em bloco:

```ts
export const projectKeys = {
	all: () => ["projects"] as const,
	lists: () => [...projectKeys.all(), "list"] as const,
	detail: (id: string) => [...projectKeys.all(), "detail", id] as const,
};
```

6. **Hook de query** — sem `onError`: o `queryClient` já mostra o toast.

```ts
import { useQuery } from "@tanstack/react-query";

import { projectKeys } from "../../../query-keys";
import { getProjects } from "../../../requests";

export const useGetProjects = () =>
	useQuery({ queryKey: projectKeys.lists(), queryFn: getProjects });
```

7. **Hook de mutation** — aqui o erro é tratado, porque sucesso e navegação são específicos:

```ts
export const useCreateProject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createProject,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

			toast.success("Projeto criado.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, { fallback: "Nao foi possivel criar o projeto." }),
			),
	});
};
```

8. **Mock** enquanto o back-end não existe. Em `mocks/handlers.ts`, e registre o
   array em `src/mocks/handlers/index.ts` — sem isso o handler não vale nada:

```ts
const url = (path: string) => `/api/${path}`;

export const projectHandlers = [
	http.get(url(ProjectsEndpoints.list), () => HttpResponse.json(makeProjectList())),
];
```

---

## 3. Criar uma rota

**Modelo:** `src/routes/index.tsx` (simples) e `src/routes/login.tsx` (com search param)

1. Crie o arquivo em `src/routes/`. O nome vira o caminho:
   `projetos.tsx` → `/projetos`, `projetos/index.tsx` → `/projetos`,
   `projetos/$id.tsx` → `/projetos/$id`.

2. Rota só faz fiação — a tela vem da feature:

```tsx
import { ProjectListPage } from "@features/projects";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projetos")({
	component: ProjectListPage,
});
```

3. Precisa de hook dentro da rota? Declare o componente **antes** do `Route` e
   **não exporte**:

```tsx
const ProjectDetailRoute = () => {
	const { id } = Route.useParams();

	return <ProjectDetailPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id")({
	component: ProjectDetailRoute,
});
```

> Os dois detalhes importam. **Antes** porque `createFileRoute` roda na
> avaliação do módulo e leria a const antes da inicialização. **Sem exportar**
> porque exportar quebra o `autoCodeSplitting` e a rota deixa de virar um chunk.

4. Restringir por papel:

```ts
export const Route = createFileRoute("/admin")({
	beforeLoad: requireRoles(["admin"]),
	component: AdminPage,
});
```

5. O `src/routeTree.gen.ts` é regenerado sozinho com o `pnpm dev` rodando.
   **Commite o arquivo gerado** — o `pnpm type-check` depende dele.

6. Para o item aparecer no menu lateral, acrescente em
   `src/components/layout/Sidebar/nav-items.ts`:

```ts
export const APP_NAV_ITEMS: NavItem[] = [
	{ to: "/projetos", label: "Projetos", icon: FolderIcon },
];
```

---

## 4. Adicionar um componente do shadcn

> **Leia antes de rodar o CLI.** Este projeto usa shadcn sobre **Base UI**, e o
> CLI gera componentes **Radix**. Todo componente novo precisa ser portado.

Já prontos, é só importar: `avatar`, `badge`, `button`, `card`, `checkbox`,
`dialog`, `dropdown-menu`, `field`, `input`, `label`, `popover`, `select`,
`separator`, `sheet`, `skeleton`, `switch`, `table`, `tabs`, `textarea`.

Para um que não está na lista:

1. Gere:

```bash
cd app/front && npx shadcn add <componente>
```

2. **Limpe o que o CLI erra.** Ele emite `import { cn } from "cn"` (alias não
   resolvido) e às vezes um `"use client"` que não faz sentido no Vite:

```bash
perl -0pi -e 's/^"use client"\n\n?//m; s/from "cn"/from "\@lib\/utils"/g' src/components/ui/<componente>.tsx
```

3. **Verifique se importa Radix:**

```bash
grep -n "radix" src/components/ui/<componente>.tsx
```

Sem resultado: acabou, o componente é só `div` + `cn`. Com resultado: porte,
usando a tabela de equivalências em `app/front/.migration/2026-09-base-ui-batch.md`.

4. **Abra a tela e interaja com o componente.** Três dos portes já feitos
   passaram no `tsc` e quebraram só no navegador — type-check não prova nada
   aqui. Abra, feche, clique, confira a animação.

5. Rode `pnpm validate` e registre o que mudou em `app/front/.migration/`.

---

## Onde as coisas estão

| Preciso de... | Está em |
| :--- | :--- |
| Cliente HTTP | `@lib/http` (`http`) |
| Mensagem de erro para toast | `@lib/api-error` (`getToastErrorMessage`) |
| Guard de rota | `@lib/route-guard` (`requireAuth`, `requireRoles`) |
| Sessão do usuário | `@features/auth/store` (`useAuthStore`) |
| Formulário com Zod | `@features/shared` (`useZodForm`) |
| Campo de formulário | `@components/form` (`ControlledInput`, `FormField`) |
| Tabela | `@components/DataTable` (`DataTable`, `createDataTableColumnHelper`) |
| Estado vazio / esqueleto | `@components/EmptyState`, `@components/SkeletonTable` |
| Cabeçalho de página | `@components/layout` (`PageLayout`) |
| Máscaras e validadores BR | `@features/shared` (CPF, CNPJ, CEP, telefone, BRL) |
| Variável de ambiente | `@config` (`AppConfig`) |

---

## Comandos

| Comando | O que faz |
| :--- | :--- |
| `pnpm dev` | sobe em http://localhost:5173 e regenera a árvore de rotas |
| `pnpm validate` | formata, corrige o lint e checa os tipos — **rode antes do PR** |
| `pnpm build` | type-check + bundle de produção |
| `pnpm lint` | Biome + ESLint, sem corrigir |

---

## Quando travar

- **Tela branca e nada no console** — provavelmente uma exceção engolida pelo
  CatchBoundary do router. Olhe o console filtrando por erro.
- **Tutorial da internet não bate com o código** — o TanStack Table aqui é v9, e
  quase todo tutorial é v8 (`useReactTable`, `getCoreRowModel`). O pacote traz
  um guia de migração em `node_modules/@tanstack/react-table/skills/`.
- **Componente do shadcn copiado da internet não funciona** — é Radix. Veja a receita 4.
- **Cor errada só no seu computador** — confira se o sistema está em modo escuro
  e leia a seção de tema em [`arquitetura-front.md`](arquitetura-front.md).
