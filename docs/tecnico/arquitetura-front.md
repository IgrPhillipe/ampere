# Arquitetura do front-end

Como o `app/front` está organizado e por quê.

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

### As duas inversões sancionadas

Existem exatamente duas, e são deliberadas:

1. `services/` importa `ApiResponse` de `@features/shared`. O envelope de
   resposta é um tipo compartilhado, não lógica de domínio.
2. `lib/http` e `lib/route-guard` importam `@features/auth/store`. O cliente
   HTTP precisa do token para o header `Authorization` e as guards precisam
   saber se há sessão. A store zustand é um singleton de módulo, então isso não
   cria ciclo — o store não importa nada de `lib`.

Qualquer outra inversão é bug.

---

## `features/` × `services/`: a divisão que mais confunde

É a única distinção conceitual que precisa ficar clara:

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

A regra prática: **uma entidade da API consumida por várias telas justifica um
service próprio.** Se você está escrevendo `http.get(...)` dentro de uma feature,
está no lugar errado.

---

## Roteamento

- Roteamento por arquivo em `src/routes/`, cada arquivo exportando `Route`.
- `src/routeTree.gen.ts` é **gerado** pelo plugin do Vite e **commitado**, para
  que `pnpm type-check` funcione sem precisar rodar o dev server antes.
  Nunca edite à mão.
- `autoCodeSplitting: true`: cada rota vira um chunk separado. Para isso
  funcionar, **o componente da rota não pode ser exportado** — mantenha-o como
  uma const local, declarada **antes** do `export const Route` (o
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
5. `useLogout` limpa o store, **limpa o cache do TanStack Query** (senão os
   dados do usuário anterior reaparecem no próximo login) e volta para `/login`.

Para restringir por papel: `beforeLoad: requireRoles(["admin"])`.

> Os papéis hoje são um placeholder (`"user" | "admin"`). Os papéis reais
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

O `queryClient` já liga isso num toast global, então **hooks de query não
precisam de `onError`**. Mutations tratam o próprio erro, porque sucesso e
navegação costumam ser específicos.

---

## Estado

| Tipo | Ferramenta | Onde |
| :--- | :--- | :--- |
| Servidor / cache | TanStack Query | `services/<entidade>/hooks/` |
| Global do app | zustand `useAppStore` | `features/shared/store/` |
| Global de uma feature | slice zustand | `features/<feature>/store/` |
| Na URL (filtros, paginação) | nuqs | `features/<feature>/search-params.ts` |
| Local simples | `useState` | no componente |
| Local persistido | `useLocalStorage` | `@features/shared` |

---

## Mocks (MSW)

O back-end Java ainda não existe, então o MSW responde no lugar dele em
desenvolvimento. Handlers ficam em `services/<entidade>/mocks/handlers.ts` e são
agregados em `src/mocks/handlers/index.ts`.

O worker só sobe em `import.meta.env.DEV`, e **a falha é não-fatal**: navegador
sem service worker apenas registra um aviso e as chamadas seguem para a API real
via proxy. Isso é proposital — antes, qualquer falha ao registrar derrubava a
aplicação inteira numa tela branca.

> O mock é andaime de desenvolvimento. A Entrega 02 exige que as histórias leiam
> e escrevam no banco de verdade.

---

## Tema

Os tokens são variáveis CSS em `src/styles/index.css`, em `:root` e `.dark`.
O `ThemeProvider` reflete `useAppStore.theme` na classe do `<html>`.

`@custom-variant dark (&:where(.dark, .dark *))` no topo do arquivo é
**obrigatório**: sem ele os utilitários `dark:` do Tailwind v4 seguiriam o
`prefers-color-scheme` do sistema operacional enquanto os tokens seguiriam a
classe, e o tema quebra pela metade.

Para aplicar a identidade visual do AMPERE, mexa só nas variáveis de `:root` e
`.dark`. Nenhum componente tem cor fixa.
