# Convenções do front-end

Padrões de código do `app/front`. Portado do boilerplate pessoal e ajustado às
decisões do AMPERE.

**Stack:** React 19 · Vite 8 · TypeScript 6 · TanStack Router · TanStack Query 5
· TanStack Table 9 · Zustand · Zod 4 · React Hook Form · ky · Tailwind CSS 4 ·
shadcn/ui sobre Base UI · MSW

---

## Estrutura de pastas

```
src/
├── components/
│   ├── ui/                 # primitivos do shadcn — kebab-case, sem pasta propria
│   ├── form/               # wrappers de formulario ligados ao react-hook-form
│   ├── layout/             # AppShell, Sidebar, Header, Footer, PageLayout
│   └── <ComponentName>/    # componente compartilhado — pasta PascalCase + barrel
├── config/                 # variaveis de ambiente validadas (config.ts)
├── features/
│   ├── shared/             # utilitarios entre features (hooks, schemas, tipos)
│   └── <feature>/          # scaffold obrigatorio (ver abaixo)
├── lib/                    # http.ts, query-client.ts, api-error.ts, route-guard.ts, utils.ts
├── mocks/                  # MSW: worker e agregador de handlers
├── providers/              # providers globais, compostos em <Providers>
├── routes/                 # TanStack Router, roteamento por arquivo
├── services/               # camada de API, uma pasta por entidade
└── styles/                 # index.css com os tokens
```

---

## Nomes

| Contexto | Padrão | Exemplo |
| :--- | :--- | :--- |
| Componentes e páginas | PascalCase | `ProjectListPage`, `DataTable` |
| Hooks | `use<Ação><Entidade>` | `useGetProjects`, `useZodForm` |
| Requests | camelCase verbo+substantivo | `getProjects`, `createProject` |
| Variáveis | camelCase | `pageCount`, `isLoading` |
| Constantes | UPPER_SNAKE_CASE | `PAGE_SIZE`, `PUBLIC_PATHS` |
| Arquivos de schema | `<entidade>.schema.ts` | `project.schema.ts` |
| Arquivos de service | kebab-case | `query-keys.ts`, `requests.ts` |
| Componentes `ui/` | kebab-case (padrão do shadcn) | `dropdown-menu.tsx` |
| Arquivos de rota | kebab-case | `index.tsx`, `novo-projeto.tsx` |

**Idioma:** identificadores, comentários e commits em **inglês** ou português sem
acento, conforme o `CONTRIBUTING.md`; **texto de interface sempre em português**.

---

## Pasta por unidade

Todo componente, página e hook segue o mesmo formato — sem exceção:

```
NomeDaUnidade/
  NomeDaUnidade.tsx   ← implementação
  index.ts            ← reexporta o export nomeado
```

A única exceção é `components/ui/`, que é código gerado pelo CLI do shadcn.

---

## Scaffold de uma feature

Toda feature tem as seis pastas. Se alguma não for usada, deixe um `index.ts`
com `export {};`.

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

Sempre por alias, nunca caminho relativo entre módulos distintos.

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

Os aliases vivem em **dois lugares** e precisam ficar em sincronia:
`tsconfig.app.json` (o que o `tsc` usa) e `tsconfig.json` (o que ferramentas
como o CLI do shadcn leem, já que elas não enxergam project references). O
`vite.config.ts` repete os mesmos caminhos em `resolve.alias`.

---

## Regras

- Nunca importe o interior de uma feature: `@features/auth` ✅,
  `@features/auth/pages/LoginPage` ❌. Dentro da própria feature, caminho
  relativo é normal.
- `services/*/requests.ts` são funções puras — sem hook, sem React.
- Formulários: sempre `useZodForm`, nunca `useForm` direto.
- Tipos inferidos do Zod: `z.infer<typeof schema>`, nunca uma interface escrita à mão em paralelo.
- Só arrow functions. As exceções são `src/components/ui/**` e `src/lib/utils.ts`,
  já configuradas no ESLint e no Biome.
- Nunca leia `import.meta.env` fora de `src/config/config.ts` — importe `AppConfig` de `@config`.
- Nunca instancie `ky` ou `QueryClient` fora de `src/lib`.
- Rotas são só fiação: nada de regra de negócio em `src/routes`.

---

## Componentes de UI

O projeto usa **shadcn/ui sobre Base UI**, não sobre Radix. O CLI do shadcn gera
componentes Radix, então **todo componente novo precisa ser portado à mão**.
O procedimento e as armadilhas conhecidas estão em
[`receitas-front.md`](receitas-front.md) e em `app/front/.migration/`.

Já portados e prontos para uso: `avatar`, `badge`, `button`, `card`, `checkbox`,
`dialog`, `dropdown-menu`, `field`, `input`, `label`, `popover`, `select`,
`separator`, `sheet`, `skeleton`, `switch`, `table`, `tabs`, `textarea`.

---

## Formatação e lint

- **Biome** formata (tabs, aspas duplas) e ordena os imports em três blocos:
  node → pacotes → aliases → relativos.
- **ESLint** cobre o que o Biome não cobre: regras de hooks do React, fast
  refresh e imports não usados.
- Um plugin GritQL do Biome recusa `function` declarado fora das exceções acima.

Rode `pnpm validate` antes de abrir PR. Um hook de `pre-push` roda isso
automaticamente, mas só quando `app/front` mudou.
