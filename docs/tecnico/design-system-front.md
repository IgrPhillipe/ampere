# Design system do front-end

Referência visual e regras de uso da interface do AMPERE. Este documento evita
que cada tela recrie cores, espaçamentos e componentes de forma diferente.

## Fontes de decisão

A interface segue esta ordem de precedência:

1. O [site oficial da Neoenergia Pernambuco](https://www.neoenergia.com/web/pernambuco)
   define a linguagem visual da marca: paleta, tipografia, formas e ritmo.
2. Os protótipos de alta fidelidade definem a estrutura e a hierarquia de cada
   tela do AMPERE.
3. A issue da história define comportamento, estados e conteúdo obrigatório.
4. O contrato do back-end define quais dados podem ser exibidos.

Quando duas fontes divergirem, não se copia cegamente a página institucional:
o AMPERE mantém a estrutura do protótipo e aplica a linguagem visual da
Neoenergia aos seus próprios fluxos.

## Arquivos principais

| Arquivo | Responsabilidade |
| :--- | :--- |
| `app/front/src/styles/tokens.css` | cores primitivas e semânticas, tipografia, espaçamento, raios, sombras e integração com Tailwind |
| `app/front/src/styles/index.css` | imports globais e estilos-base dos elementos HTML |
| `app/front/src/components/ui/` | primitivos compartilhados que consomem os tokens semânticos |
| `app/front/src/components/layout/` | cabeçalho, navegação, shell, rodapé e cabeçalho de página |
| `app/front/public/neoenergia-logo.svg` | logo colorida oficial usada pelo cabeçalho |

## Tipografia

A fonte institucional da Neoenergia é a **IberPangea**, mas seu arquivo não é
distribuído neste repositório. Não copie a fonte de páginas públicas nem adicione
um arquivo sem licença explícita.

O AMPERE usa esta pilha:

```css
"IberPangea", "IBM Plex Sans Variable", "Segoe UI", sans-serif
```

Na prática, `IBM Plex Sans Variable` é a fonte instalada e utilizada. Se a
Neoenergia fornecer o arquivo e a autorização da IberPangea, basta registrá-lo;
os componentes já referenciam `--ds-font-brand`.

Os tamanhos seguem os tokens `--ds-text-xs` até `--ds-text-2xl`. Use as classes
semânticas do Tailwind (`text-sm`, `text-lg`, `text-2xl`) em vez de números
arbitrários, salvo quando o protótipo exigir um detalhe tipográfico específico.

## Cores

### Paleta da marca

| Token | Valor | Uso |
| :--- | :--- | :--- |
| `--neo-green` | `#00A443` | verde institucional, marca e elementos decorativos |
| `--neo-green-dark` | `#00402A` | contraste forte e superfícies secundárias |
| `--neo-green-strong` | `#007F33` | ações primárias com texto branco |
| `--neo-green-accent` | `#26BF64` | destaques pontuais |
| `--neo-sky` | `#0DA9FF` | apoio para gráficos e informação |
| `--neo-sunset` | `#FF9C1A` | alerta, pendência e destaque |
| `--neo-sand` | `#FFF5EC` | fundo geral da aplicação |
| `--neo-ink` | `#002015` | texto principal |

O verde institucional `#00A443` permanece na identidade visual. Para botões
com texto branco, `--primary` aponta para `#007F33`, que oferece contraste
superior sem descaracterizar a marca.

### Tokens semânticos

Componentes não devem consumir diretamente `--neo-*`. Use sempre o papel
semântico correspondente:

| Papel | CSS | Tailwind |
| :--- | :--- | :--- |
| Fundo da aplicação | `--background` | `bg-background` |
| Superfície branca | `--card` | `bg-card` |
| Texto principal | `--foreground` | `text-foreground` |
| Texto secundário | `--muted-foreground` | `text-muted-foreground` |
| Ação principal | `--primary` | `bg-primary`, `text-primary` |
| Realce suave | `--accent` | `bg-accent` |
| Hover de superfície | `--surface-hover` | `bg-surface-hover` |
| Erro | `--destructive` | `text-destructive` |
| Alerta | `--warning` | `bg-warning` |
| Contorno e separador | `--border` | `border-border` |
| Foco de teclado | `--ring` | `ring-ring` |

`--accent` é verde: serve para realçar, não para o hover de uma linha de tabela.
Hover neutro é `--surface-hover`.

Se a identidade mudar, altere os tokens; não percorra componentes substituindo
cores fixas.

## Espaçamento, forma e movimento

O espaçamento usa uma base de **4 px**. Os tokens expõem 4, 8, 16, 24, 48,
72 e 96 px. Antes de criar um valor arbitrário, escolha o passo existente mais
próximo.

| Token | Valor | Uso típico |
| :--- | :--- | :--- |
| `--ds-radius-xs` | 4 px | botões e checkbox da listagem |
| `--ds-radius-sm` | 8 px | campos e itens internos |
| `--ds-radius-md` | 16 px | cartões, tabelas e estados vazios |
| `--ds-radius-lg` | 32 px | blocos de destaque |
| `--ds-radius-pill` | circular | badges |
| `--ds-shadow-sm` | elevação discreta | campos, cartões e tabelas |
| `--ds-shadow-md` | elevação intermediária | menus e camadas flutuantes |

> **Raio de botão.** A marca prevê botão em pílula, mas as telas aprovadas da
> listagem usam 4 px. O valor que vale no código é `--ds-radius-xs`; a pílula
> fica para badge. Se o desenho mudar, muda o token, não a chamada.

Transições devem ser curtas e funcionais. Não use animação para conteúdo que
precisa aparecer imediatamente.

## Componentes compartilhados

Os primitivos ficam em `src/components/ui`. Eles preservam a API do shadcn,
mas foram portados para Base UI e ajustados ao design system.

### Botões

- `default`: ação principal verde.
- `secondary`: ação forte em verde escuro.
- `outline`: ação secundária com contorno verde.
- `ghost`: ação discreta em barras e menus.
- `destructive`: operação perigosa.
- `link`: ação textual.

Não crie um botão com classes locais de cor ou altura. Escolha `variant` e
`size`; complemente `className` apenas para posicionamento ou largura.

```tsx
<Button>Novo projeto</Button>
<Button variant="outline">Cancelar</Button>
```

### Badges

Use badges para estados curtos. `success`, `warning` e `destructive` usam fundo
suave para não competir com a ação principal. O texto exibido continua em
português; valores da API são convertidos antes de chegar ao componente.

```tsx
<Badge variant="success">Aprovado</Badge>
<Badge variant="warning">Aguardando envio</Badge>
<Badge variant="destructive">Reprovado</Badge>
```

### Campos e controles

`Input`, `Textarea`, `Select`, `Checkbox` e `Switch` compartilham altura,
contorno, foco e estado desabilitado. Em formulários, prefira os wrappers de
`@components/form`, que já conectam rótulo, descrição e erro acessível.

### Dados e estados

- `DataTable` padroniza cabeçalho, linhas, carregamento e resultado vazio.
- `SkeletonTable` representa carregamento sem deslocar a estrutura.
- `EmptyState` aceita ícone, título, descrição e ação.
- `Tabs` usa indicador inferior verde e não uma coleção de botões soltos.
- `Card` agrupa conteúdo relacionado; não deve envolver toda seção apenas para
  criar espaçamento.

## Cabeçalho e navegação

O menu principal é **horizontal** a partir de telas grandes. Em telas menores,
o botão de menu abre a mesma lista verticalmente em um painel lateral. Não há
duas configurações distintas de navegação.

Os itens vivem em:

```text
app/front/src/components/layout/Sidebar/nav-items.ts
```

Apesar do caminho legado `Sidebar`, `APP_NAV_ITEMS` é a fonte única tanto para
o cabeçalho quanto para o painel móvel. Uma área sem rota pode aparecer com
`disabled: true`; ela só se torna interativa no mesmo commit que cria a rota.

```ts
{ to: "/", label: "Meus projetos", exact: true }
{ label: "Novo projeto", disabled: true }
```

O cabeçalho possui:

- logo oficial e identificação “Projetos elétricos”;
- rota ativa com indicador verde;
- opções futuras visíveis, porém desabilitadas;
- identificação do usuário e ação de logout;
- adaptação móvel sem mudar a ordem das opções.

## Uso da logo

O arquivo `public/neoenergia-logo.svg` veio do cabeçalho do site oficial da
Neoenergia. A aplicação serve uma cópia local para não depender de conexão com
o domínio institucional em tempo de execução.

Regras:

- não redesenhar, recolorir, deformar ou recortar a marca;
- preservar a proporção com `width: auto`;
- manter área livre ao redor da imagem;
- usar `AppBrand` em vez de repetir a tag de imagem;
- substituir o arquivo somente por material oficial fornecido ou publicado
  pela Neoenergia.

## Tema e acessibilidade

Esta versão do design system define apenas o **tema claro**. A classe `.dark`
continua reconhecida pela infraestrutura, mas não existe uma segunda paleta.
Não adicione correções isoladas com `dark:`. Um tema escuro futuro deve definir
todos os tokens e ser validado como uma entrega própria.

Requisitos para novos componentes:

- navegação completa por teclado;
- foco visível usando `ring-ring`;
- nome acessível para botões compostos apenas por ícone;
- estados `disabled` e `aria-invalid` perceptíveis sem depender só da cor;
- texto principal com contraste adequado sobre a superfície;
- respeito à hierarquia de títulos da página.

## Checklist para novas telas

- [ ] Usa `PageLayout` sob o `AppShell`.
- [ ] Usa tokens semânticos, sem hexadecimal no componente.
- [ ] Reutiliza componentes de `components/ui` e compartilhados.
- [ ] Mantém texto de interface em português.
- [ ] Possui carregamento, erro e estado vazio quando aplicável.
- [ ] Funciona com teclado e foco visível.
- [ ] Foi conferida em largura móvel e desktop.
- [ ] Passa em `pnpm validate` e `pnpm build`.

## Escopo desta entrega

O design system fornece fundações e componentes. A implementação funcional da
tela “Meus projetos”, seus filtros, busca, paginação e integração com a API
pertence à branch específica da tela.
