# Convenções do Front-end

Padrões de código, arquitetura e receitas do `app/front`. Documento único da
stack. Portado de um boilerplate pessoal e ajustado às decisões do AMPERE.

**Stack:** React 19, Vite 8, TypeScript 6, TanStack Router, TanStack Query 5,
TanStack Table 9, Zustand, Zod 4, React Hook Form, ky, Tailwind CSS 4,
shadcn/ui sobre Base UI, MSW

---

## Estrutura de Pastas

```
src/
├── components/
│   ├── ui/                 # primitivos do shadcn: kebab-case, sem pasta própria
│   ├── form/               # wrappers de formulario ligados ao react-hook-form
│   ├── layout/             # AppShell, AppLayout, Header, nav-items, PageLayout
│   └── <ComponentName>/    # componente compartilhado: pasta PascalCase + barrel
├── config/                 # variaveis de ambiente validadas (config.ts)
├── features/
│   ├── shared/             # utilitarios entre features (hooks, schemas, tipos)
│   └── <feature>/          # scaffold obrigatorio (ver abaixo)
├── lib/                    # http.ts, query-client.ts, api-error.ts, route-guard.ts, utils.ts
├── mocks/                  # MSW: worker e agregador de handlers
├── providers/              # providers globais, compostos em <Providers>
├── routes/                 # TanStack Router, roteamento por arquivo
├── services/               # camada de API, uma pasta por entidade
└── styles/                 # tokens.css + estilos globais em index.css
```

---

## Nomes

| Contexto | Padrão | Exemplo |
| :--- | :--- | :--- |
| Componentes e páginas | PascalCase | `ProjectsPage`, `DataTable` |
| Hooks | `use<Ação><Entidade>` | `useGetProjects`, `useZodForm` |
| Requests | camelCase verbo+substantivo | `getProjectList`, `createProject` |
| Variáveis | camelCase | `pageCount`, `isLoading` |
| Constantes | UPPER_SNAKE_CASE | `PAGE_SIZE`, `PUBLIC_PATHS` |
| Arquivos de schema | `<entidade>.schema.ts` | `project.schema.ts` |
| Arquivos de service | kebab-case | `query-keys.ts`, `requests.ts` |
| Componentes `ui/` | kebab-case (padrão do shadcn) | `dropdown-menu.tsx` |
| Arquivos de rota | kebab-case | `index.tsx`, `novo-projeto.tsx` |

**Idioma:** identificadores, comentários e commits em **inglês** ou português sem
acento, conforme o `CONTRIBUTING.md`; **texto de interface sempre em português**.

---

## Pasta por Unidade

Todo componente, página e hook segue o mesmo formato:

```
NomeDaUnidade/
  NomeDaUnidade.tsx   ← implementação
  index.ts            ← reexporta o export nomeado
```

A única exceção é `components/ui/`, código gerado pelo CLI do shadcn.

---

## Scaffold de uma Feature

Toda feature tem as seis pastas. Pasta sem uso recebe um `index.ts` com
`export {};`.

```
features/<feature>/
├── pages/<NomePage>/{<NomePage>.tsx, index.ts}
├── components/<Nome>/{<Nome>.tsx, index.ts}
├── hooks/<useNome>/{<useNome>.ts, index.ts}   ← lógica de UI, sem chamada de API
├── schemas/<nome>.schema.ts
├── types/index.ts
├── store/index.ts                              ← slice zustand da feature
└── index.ts                                    ← barrel, só a interface pública
```

Modelo vivo: `src/features/auth`.

---

## Aliases

Imports entre módulos distintos usam sempre alias, nunca caminho relativo.

| Alias | Resolve para |
| :--- | :--- |
| `@/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@features/*` | `src/features/*` |
| `@services/*` | `src/services/*` |
| `@providers/*` | `src/providers/*` |
| `@lib/*` | `src/lib/*` |
| `@config`, `@config/*` | `src/config` |
| `@styles/*` | `src/styles/*` |
| `@routes/*` | `src/routes/*` |
| `@assets/*` | `src/assets/*` |

Os aliases ficam em **dois lugares**, mantidos em sincronia:
`tsconfig.app.json` (usado pelo `tsc`) e `tsconfig.json` (lido por ferramentas
como o CLI do shadcn, que não enxergam project references). O `vite.config.ts`
repete os mesmos caminhos em `resolve.alias`.

---

## Regras

- Nunca importe o interior de uma feature: use `@features/auth`, não
  `@features/auth/pages/LoginPage`. Dentro da própria feature, caminho
  relativo é permitido.
- `services/*/requests.ts` são funções puras, sem hook e sem React.
- Formulários: sempre `useZodForm`, nunca `useForm` direto.
- Tipos inferidos do Zod: `z.infer<typeof schema>`, nunca uma interface escrita à mão em paralelo.
- Só arrow functions. As exceções são `src/components/ui/**` e `src/lib/utils.ts`,
  já configuradas no ESLint e no Biome.
- Nunca leia `import.meta.env` fora de `src/config/config.ts`; importe `AppConfig` de `@config`.
- Nunca instancie `ky` ou `QueryClient` fora de `src/lib`.
- Rotas são só fiação: nada de regra de negócio em `src/routes`.
- Todo componente compartilhado aceita `className?: string` e funde com `cn()`
  **por último**, para que o consumidor consiga sobrescrever.
- Resposta de API se valida com `.parse()` do schema Zod, nunca com
  `.json<T>()`: genérico é promessa de tipo, não verificação.

### Props

| Camada | Convenção | Exemplo |
| :--- | :--- | :--- |
| Componente-folha | `value` / `onValueChange` (convenção Base UI) | `SearchInput`, `ProjectStatusFilters` |
| Container | nomes de domínio | `status` / `onStatusChange` |
| Ação específica | `on<Verbo><Substantivo>` | `onViewFindings`, `onResumeSubmission` |

- Dois callbacks com a **mesma assinatura** viram objeto de opções. Como
  parâmetros posicionais, trocar a ordem compila e quebra em silêncio.
- Mais de dois filhos fixos: use `children` ou slots `ReactNode`, não props de
  pass-through. `PageLayout` (`actions` + `children`), `EmptyState` (`icon`,
  `action`) e `ProjectToolbar` (`filters`, `search`) servem de modelo.

### Onde Cada Tipo Mora

| Arquivo | O que guarda |
| :--- | :--- |
| `services/<e>/schemas/` | inferido do Zod: o que **vem** da API |
| `services/<e>/types.ts` | o que **vai** para a API (parâmetros de request) |
| `features/<f>/types/` | o que só existe na tela |
| `features/shared/types/` | o que atravessa features |
| `features/shared/schemas/api.schema.ts` | o envelope de resposta, um lugar só |

---

## Componentes de UI

O projeto usa **shadcn/ui sobre Base UI**, não sobre Radix. O CLI do shadcn gera
componentes Radix, então **todo componente novo precisa ser portado à mão**.
O procedimento e as armadilhas conhecidas estão em
[Receita: Adicionar um Componente do shadcn](#receita-adicionar-um-componente-do-shadcn)
e em `app/front/.migration/`.

Já portados e prontos para uso: `avatar`, `badge`, `button`, `card`, `checkbox`,
`dialog`, `dropdown-menu`, `field`, `input`, `label`, `popover`, `select`,
`separator`, `sheet`, `skeleton`, `switch`, `table`, `tabs`, `textarea`.

As regras visuais, tokens e variantes estão em
[`design-system-front.md`](design-system-front.md). Componentes de feature não
declaram paleta paralela.

---

## Formatação e Lint

- **Biome** formata (tabs, aspas duplas) e ordena os imports em três blocos,
  nesta ordem: node, pacotes, aliases, relativos.
- **ESLint** cobre o que o Biome não cobre: regras de hooks do React, fast
  refresh e imports não usados.
- Um plugin GritQL do Biome recusa `function` declarado fora das exceções acima.

Rode `pnpm validate` antes de abrir PR. O hook de `pre-push` executa o mesmo
comando automaticamente, apenas quando `app/front` muda.

---

## Camadas

```
┌─────────────────────────────────┐
│           routes/               │  roteamento por arquivo (TanStack Router)
├─────────────────────────────────┤
│      features/<feature>/        │  domínio: páginas, componentes, schemas, store
├─────────────────────────────────┤
│         components/             │  UI compartilhada (ui/, form/, layout/)
├─────────────────────────────────┤
│          services/              │  API: requests, query-keys, hooks de query/mutation
├─────────────────────────────────┤
│          providers/             │  providers globais, compostos em main.tsx
├─────────────────────────────────┤
│            lib/                 │  singletons: http, queryClient, api-error, route-guard
├─────────────────────────────────┤
│           config/               │  variáveis de ambiente validadas com Zod
└─────────────────────────────────┘
```

**Fluxo de dependência:** routes → features → services → lib → config.
Camada de cima importa camada de baixo, nunca o contrário.

### A Inversão Sancionada

Existe exatamente uma: `services/` importa o envelope de resposta
(`apiResponseSchema`, `ApiResponse`) de `@features/shared`. O envelope é
contrato compartilhado, não lógica de domínio, e a store zustand é singleton de
módulo, então não há ciclo.

Estado usado por **todas** as camadas (a sessão, os papéis de usuário) fica em
`features/shared/store` e `features/shared/types`, não dentro da feature que
mais o consome. As dez violações da primeira regra vinham daí: o `lib/http`
precisa do token, o `route-guard` precisa saber se há sessão e o `Header`
precisa do usuário. Nenhum dos três respeitava a regra enquanto a store ficava
em `features/auth`.

Qualquer outra inversão é bug.

---

## Divisão entre `features/` e `services/`

Distinção conceitual entre as duas pastas:

- **`features/<nome>/` é a tela.** Página, componentes, schema do formulário,
  tipos e estado local do domínio.
- **`services/<entidade>/` é a API.** Endpoints, funções de request, chaves de
  cache e os hooks de query/mutation.

O par real no código é `features/auth` + `services/auth`:

| Arquivo | Camada | Responsabilidade |
| :--- | :--- | :--- |
| `features/auth/pages/LoginPage` | feature | o formulário que a pessoa vê |
| `features/auth/schemas/login.schema.ts` | feature | validação dos campos |
| `features/auth/store/index.ts` | feature | sessão persistida (zustand) |
| `services/auth/endpoints.ts` | service | `auth/login`, `auth/me` |
| `services/auth/requests.ts` | service | as chamadas `ky` |
| `services/auth/hooks/mutations/useLogin` | service | mutation + navegação + toast |

Regra prática: **uma entidade da API consumida por várias telas justifica um
service próprio.** `http.get(...)` dentro de uma feature está no lugar errado.

---

## Roteamento

- Roteamento por arquivo em `src/routes/`, cada arquivo exportando `Route`.
- `src/routeTree.gen.ts` é **gerado** pelo plugin do Vite e **commitado**, para
  que `pnpm type-check` funcione sem rodar o dev server antes. Nunca edite à
  mão.
- `autoCodeSplitting: true`: cada rota vira um chunk separado. Para isso
  funcionar, **o componente da rota não pode ser exportado**: mantenha-o como
  const local, declarada **antes** do `export const Route` (o
  `createFileRoute` roda na avaliação do módulo e leria a const antes da
  inicialização).
- `__root.tsx` faz duas coisas: a guard de autenticação em `beforeLoad` e a
  escolha da casca (`AppShell` para rotas autenticadas, `<Outlet/>` cru para
  `/login`).

## Autenticação

1. `__root.tsx` chama `requireAuth()` em tudo que não está em `PUBLIC_PATHS`.
2. `requireAuth` espera a re-hidratação do store e, sem sessão, redireciona
   para `/login?redirect=<origem>`.
3. `useLogin` grava a sessão, navega para o `redirect` e mostra o toast.
4. `lib/http` injeta `Authorization: Bearer <token>` em toda requisição.
5. `useLogout` limpa o store, **limpa o cache do TanStack Query** (sem isso, os
   dados do usuário anterior reaparecem no próximo login) e volta para `/login`.

Para restringir por papel: `beforeLoad: requireRoles(["admin"])`.

> Os papéis atuais são placeholder (`"user" | "admin"`). Os papéis reais
> dependem da Q1c de [`../produto/questoes-em-aberto.md`](../produto/questoes-em-aberto.md).

---

## Erros de API

O back-end é Spring Boot, então `lib/api-error.ts` entende os dois formatos que
ele devolve: `ProblemDetail` (RFC 7807) e o corpo padrão do Boot.

`getToastErrorMessage` nunca deixa detalhe técnico chegar à tela:

- falha de rede ou timeout → "Não foi possível falar com o servidor..."
- status 5xx → "Erro interno. Tente novamente."
- corpo ilegível (HTML no lugar de JSON, típico de proxy caído) → erro interno
- stack trace de Java ou mensagem de transporte → filtrado, cai no fallback
- só então a mensagem real da API é exibida

O `queryClient` liga isso a um toast global, então **hooks de query não
precisam de `onError`**. Mutations tratam o próprio erro, porque sucesso e
navegação costumam ser específicos.

---

## Estado

| Tipo | Ferramenta | Onde |
| :--- | :--- | :--- |
| Servidor / cache | TanStack Query | `services/<entidade>/hooks/` |
| Global do app | zustand `useAppStore` | `features/shared/store/` |
| Global de uma feature | slice zustand | `features/<feature>/store/` |
| Na URL (filtros, paginação) | nuqs | `features/<feature>/hooks/use<Feature>Filters/` |
| Local simples | `useState` | no componente |
| Local persistido | `useLocalStorage` | `@features/shared` |

---

## Mocks (MSW)

O back-end existe, então **o caminho normal de desenvolvimento usa a API real**:

```bash
cd app/back && docker compose up -d
cd app/front && pnpm dev
```

O MSW fica **desligado por padrão**. Para trabalhar no front sem subir o back,
ative no `.env`:

```bash
VITE_ENABLE_MSW=true
```

Handlers ficam em `services/<entidade>/mocks/handlers.ts` e são agregados em
`src/mocks/handlers/index.ts`; sem esse registro, o handler não tem efeito.

O worker só sobe com `AppConfig.ENABLE_MSW` **e** `import.meta.env.DEV`. A falha
ao registrar é **não-fatal**: navegador sem service worker registra um aviso e as
chamadas seguem para a API real via proxy, em vez de derrubar a aplicação.

> O mock é apoio de desenvolvimento e não substitui a API: as histórias da
> disciplina precisam ler e escrever no banco. Com o MSW ligado, um `POST` sem
> handler cai no proxy e volta 502.

### Quando a API Devolve 500 em Toda Consulta

`ddl-auto=update` não acrescenta coluna a tabela que já tem linhas. Um banco de
desenvolvimento antigo sobe com o schema defasado, o login funciona e a listagem
quebra. A solução está no `app/back/README.md`: `DDL_AUTO=create`, **uma vez**,
e depois remova a variável. Enquanto ela existir, todo restart apaga os dados.

---

## Tema

Os tokens são variáveis CSS em `src/styles/tokens.css`; `src/styles/index.css`
apenas reúne os imports e estilos-base. Cores de componentes devem usar tokens
semânticos como `primary`, `card`, `muted`, `border` e `destructive`.

`@custom-variant dark (&:where(.dark, .dark *))` no topo do arquivo é
mantido para compatibilidade com a infraestrutura existente. O design system
atual define apenas tema claro: ainda não há uma paleta `.dark` completa.

Não corrija componentes individualmente com `dark:`. Um futuro tema escuro deve
ser implementado de uma vez em `tokens.css`, com validação de contraste.
Especificação completa em [`design-system-front.md`](design-system-front.md).

---

## Receita: Criar uma Feature

> Feature é **tela**. Para falar com a API, use a
> [Receita: Criar um Service](#receita-criar-um-service-falar-com-a-api).

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

3. Crie a página em `pages/ProjectsPage/`, sempre pasta + barrel:

```
pages/ProjectsPage/ProjectsPage.tsx   ← export const ProjectsPage = () => ...
pages/ProjectsPage/index.ts           ← export * from "./ProjectsPage";
pages/index.ts                        ← export * from "./ProjectsPage";
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

5. Use o `PageLayout` na página, para manter o cabeçalho igual ao das outras:

```tsx
import { PageLayout } from "@components/layout";

export const ProjectsPage = () => (
	<PageLayout title="Projetos" description="Todos os seus projetos elétricos.">
		{/* conteúdo */}
	</PageLayout>
);
```

---

## Receita: Criar um Service (Falar com a API)

> Service é **API**. Uma pasta por entidade.

**Modelo:** `src/services/projects/`, a fatia que valida a resposta com Zod,
comportamento esperado de toda fatia.

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

2. **`endpoints.ts`**. Nunca escreva URL solta dentro do `requests.ts`:

```ts
export const ProjectsEndpoints = {
	list: "projects",
	detail: (id: string) => `projects/${id}`,
} as const;
```

3. **`schemas/project.schema.ts`**. O tipo sai do schema, nunca em paralelo:

```ts
import { z } from "zod";

export const projectSchema = z.object({ id: z.string(), name: z.string() });

export type Project = z.infer<typeof projectSchema>;
```

4. **`requests.ts`**. Funções puras, sem React:

```ts
import { apiResponseSchema } from "@features/shared";
import { http } from "@lib/http";

import { ProjectsEndpoints as e } from "./endpoints";
import { projectSchema } from "./schemas";

const listResponseSchema = apiResponseSchema(z.array(projectSchema));

export const getProjectList = async () => {
	const response = await http.get(e.list).json<unknown>();

	return listResponseSchema.parse(response);
};
```

> `.json<T>()` seria promessa de tipo, não verificação: se o back mudar a forma
> da resposta, o TypeScript continua satisfeito e a falha aparece longe dali,
> como `undefined` no meio de um componente.

5. **`query-keys.ts`**. Fábrica hierárquica, para invalidar em bloco:

```ts
export const projectKeys = {
	all: () => ["projects"] as const,
	lists: () => [...projectKeys.all(), "list"] as const,
	detail: (id: string) => [...projectKeys.all(), "detail", id] as const,
};
```

6. **Hook de query**. Sem `onError`: o `queryClient` já mostra o toast.

```ts
import { useQuery } from "@tanstack/react-query";

import { projectKeys } from "../../../query-keys";
import { getProjectList } from "../../../requests";

export const useGetProjects = () =>
	useQuery({ queryKey: projectKeys.lists(), queryFn: getProjectList });
```

7. **Hook de mutation**. O erro é tratado aqui, porque sucesso e navegação são específicos:

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

8. **Mock** enquanto o back-end não existe. Fica em `mocks/handlers.ts`, com o
   array registrado em `src/mocks/handlers/index.ts`; sem o registro, o handler
   não tem efeito:

```ts
const url = (path: string) => `/api/${path}`;

export const projectHandlers = [
	http.get(url(ProjectsEndpoints.list), () => HttpResponse.json(makeProjectList())),
];
```

---

## Receita: Criar uma Rota

**Modelo:** `src/routes/index.tsx` (simples) e `src/routes/login.tsx` (com search param)

1. Crie o arquivo em `src/routes/`. O nome vira o caminho:
   `projetos.tsx` → `/projetos`, `projetos/index.tsx` → `/projetos`,
   `projetos/$id.tsx` → `/projetos/$id`.

2. Rota só faz fiação; a tela vem da feature:

```tsx
import { ProjectsPage } from "@features/projects";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projetos")({
	component: ProjectsPage,
});
```

3. Com hook dentro da rota, declare o componente **antes** do `Route` e **não o
   exporte**:

```tsx
const ProjectDetailRoute = () => {
	const { id } = Route.useParams();

	return <ProjectDetailPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id")({
	component: ProjectDetailRoute,
});
```

> **Antes** porque `createFileRoute` roda na avaliação do módulo e leria a
> const antes da inicialização. **Sem exportar** porque exportar quebra o
> `autoCodeSplitting` e a rota deixa de virar um chunk.

4. Restringir por papel:

```ts
export const Route = createFileRoute("/admin")({
	beforeLoad: requireRoles(["admin"]),
	component: AdminPage,
});
```

5. O `src/routeTree.gen.ts` é regenerado automaticamente com o `pnpm dev` em
   execução. **Commite o arquivo gerado**: o `pnpm type-check` depende dele.

6. Para o item aparecer na navegação principal, acrescente em
   `src/components/layout/nav-items.ts`:

```ts
export const APP_NAV_ITEMS: NavItem[] = [
	{ to: "/projetos", label: "Projetos" },
];
```

O array é a fonte única do cabeçalho horizontal e do painel móvel. Não habilite
um item antes de a rota existir.

---

## Receita: Adicionar um Componente do shadcn

> **Antes de rodar o CLI:** este projeto usa shadcn sobre **Base UI**, e o CLI
> gera componentes **Radix**. Todo componente novo precisa ser portado.

Já portados, prontos para importar: `avatar`, `badge`, `button`, `card`, `checkbox`,
`dialog`, `dropdown-menu`, `field`, `input`, `label`, `popover`, `select`,
`separator`, `sheet`, `skeleton`, `switch`, `table`, `tabs`, `textarea`.

Para um componente fora da lista:

1. Gere:

```bash
cd app/front && npx shadcn add <componente>
```

2. **Corrija a saída do CLI.** Ele emite `import { cn } from "cn"` (alias não
   resolvido) e às vezes um `"use client"` sem efeito no Vite:

```bash
perl -0pi -e 's/^"use client"\n\n?//m; s/from "cn"/from "\@lib\/utils"/g' src/components/ui/<componente>.tsx
```

3. **Verifique se importa Radix:**

```bash
grep -n "radix" src/components/ui/<componente>.tsx
```

Sem resultado: o componente é só `div` + `cn` e está pronto. Com resultado:
porte usando a tabela de equivalências em `app/front/.migration/2026-09-base-ui-batch.md`.

4. **Abra a tela e interaja com o componente.** Três portes anteriores
   passaram no `tsc` e quebraram só no navegador; o type-check não garante o
   funcionamento. Abra, feche, clique e confira a animação.

5. Rode `pnpm validate` e registre o que mudou em `app/front/.migration/`.

---

## Onde as Coisas Estão

| Preciso de... | Está em |
| :--- | :--- |
| Cliente HTTP | `@lib/http` (`http`) |
| Mensagem de erro para toast | `@lib/api-error` (`getToastErrorMessage`) |
| Guard de rota | `@lib/route-guard` (`requireAuth`, `requireRoles`) |
| Sessão do usuário | `@features/shared` (`useAuthStore`) |
| Formulário com Zod | `@features/shared` (`useZodForm`) |
| Campo de formulário | `@components/form` (`ControlledInput`, `FormField`) |
| Tabela | `@components/DataTable` (`DataTable`, `createDataTableColumnHelper`) |
| Estado vazio / esqueleto | `@components/EmptyState`, `@components/SkeletonTable` |
| Cabeçalho de página | `@components/layout` (`PageLayout`) |
| Tokens e regras visuais | [`design-system-front.md`](design-system-front.md) |
| Busca com atraso | `@features/shared` (`useDebouncedValue`) |
| Campo de busca / paginação | `@components/SearchInput`, `@components/Pagination` |
| Envelope de resposta | `@features/shared` (`apiResponseSchema`, `paginatedResponseSchema`) |
| Variável de ambiente | `@config` (`AppConfig`) |

---

## Comandos

| Comando | O que faz |
| :--- | :--- |
| `pnpm dev` | sobe em http://localhost:5173 e regenera a árvore de rotas |
| `pnpm validate` | formata, corrige o lint e checa os tipos; **rode antes do PR** |
| `pnpm build` | type-check + bundle de produção |
| `pnpm lint` | Biome + ESLint, sem corrigir |

---

## Quando Travar

- **Tela branca e nada no console**: provavelmente uma exceção capturada pelo
  CatchBoundary do router. Filtre o console por erro.
- **Tutorial da internet não bate com o código**: o TanStack Table do projeto é
  v9, e quase todo tutorial é v8 (`useReactTable`, `getCoreRowModel`). O pacote
  inclui um guia de migração em `node_modules/@tanstack/react-table/skills/`.
- **Componente do shadcn copiado da internet não funciona**: é Radix. Procedimento
  em [Receita: Adicionar um Componente do shadcn](#receita-adicionar-um-componente-do-shadcn).
- **Cor ou espaçamento diferente do restante**: confirme se o componente usa os
  tokens semânticos e consulte o design system antes de criar uma classe local.
