# Front-end

> Interface web para entrada de dados do projeto elétrico e visualização do cálculo de demanda.

**Stack:** React 19 · Vite 8 · TypeScript 6 · TanStack Router · TanStack Query 5
· TanStack Table 9 · Zustand · Zod 4 · React Hook Form · ky · Tailwind CSS 4 ·
shadcn/ui sobre Base UI · MSW

---

## Propósito

- Formulário guiado para inserção dos parâmetros do projeto (tipo de edificação, unidades consumidoras, cargas instaladas)
- Exibição do resultado do cálculo de demanda com rastreabilidade das regras aplicadas
- Interface acessível para projetistas externos e analistas

---

## Como executar

Requisitos: **Node 24+** (há um `.nvmrc`) e **pnpm**.

```bash
cd app/front
cp .env.example .env
pnpm install
pnpm dev
```

A aplicação sobe em `http://localhost:5173`. As chamadas para `/api` passam pelo
proxy do Vite para `http://localhost:8080`, onde roda o back-end Spring Boot.

O front fala com a API real por padrão. Com `VITE_ENABLE_MSW=true`, o **MSW**
responde no lugar dela. Usuários de teste, os mesmos do seeder do back-end:

| E-mail | Senha | Papel |
| :--- | :--- | :--- |
| `user@ampere.local` | `senha@123` | user |
| `admin@ampere.local` | `senha@123` | admin |

> Os papéis são placeholders. Os definitivos dependem da Q1c em
> [`docs/produto/questoes-em-aberto.md`](../../docs/produto/questoes-em-aberto.md).

---

## Comandos

| Comando | O que faz |
| :--- | :--- |
| `pnpm dev` | servidor de desenvolvimento e geração da árvore de rotas |
| `pnpm validate` | formata, corrige o lint e checa os tipos — **rode antes do PR** |
| `pnpm build` | type-check + bundle de produção |
| `pnpm lint` | Biome + ESLint, sem corrigir |
| `pnpm preview` | serve o build de produção localmente |

Um hook de `pre-push` roda o `pnpm validate` apenas quando `app/front` mudou.

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| :--- | :--- | :--- |
| `VITE_API_URL` | Não (padrão `/api`) | URL base da API |
| `VITE_PROXY_TARGET` | Não (padrão `http://localhost:8080`) | destino do proxy de `/api` em desenvolvimento |
| `VITE_ENABLE_MSW` | Não (padrão `false`) | liga os mocks do MSW no lugar da API real |

São validadas na inicialização por `src/config/config.ts`. Importe `AppConfig`
de `@config` — nunca leia `import.meta.env` diretamente.

> O prefixo `VITE_` é obrigatório: o Vite só expõe ao navegador variáveis com
> esse prefixo.

---

## Documentação

| Documento | Conteúdo |
| :--- | :--- |
| [Convenções](../../docs/tecnico/convencoes-front.md) | **comece por aqui** — estrutura, nomes e aliases; camadas, roteamento, auth, erros e tema; e as receitas passo a passo para criar feature, service, rota e componente |
| [Design system](../../docs/tecnico/design-system-front.md) | identidade Neoenergia, tokens, componentes, navegação, logo e checklist visual |
| [`.migration/`](.migration/) | registro dos portes de Radix para Base UI |

Documentação técnica geral: [`docs/tecnico/README.md`](../../docs/tecnico/README.md)
README central: [`README.md`](../../README.md)

---

## Estrutura

```
src/
├── components/     ui/ (shadcn) · form/ · layout/ · compartilhados
├── config/         variáveis de ambiente validadas
├── features/       domínios: páginas, componentes, schemas, store
├── lib/            http, queryClient, api-error, route-guard, utils
├── mocks/          MSW
├── providers/      providers globais
├── routes/         TanStack Router (roteamento por arquivo)
├── services/       camada de API, uma pasta por entidade
└── styles/         tokens.css + estilos globais em index.css
```
