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

### Títulos e separadores

Títulos usam Title Case: cada palavra começa em maiúscula, exceto artigos,
preposições e conjunções curtas (a, o, e, de, da, do, em, para). Vale para
títulos de página e de seção, itens da navegação, etapas do stepper, títulos de
drawer e o `pageTitle` da aba. Exemplos: "Novo Projeto", "Parâmetros Técnicos",
"Normas e Tabelas", "Decomposição do Cálculo".

Botões, rótulos de campo, mensagens, estados vazios e títulos em forma de
pergunta continuam em frase comum ("Novo projeto", "Aprovar e publicar a
tabela?").

Texto de interface não usa travessão nem ponto médio, nem como separador nem
como valor vazio. Separe com vírgula, dois-pontos, "e" ou parênteses, e troque o
valor vazio por texto com sentido ("Não informado", "Sem cálculo", "Pendente").
Intervalos são escritos com "a" ("1 a 6 de 6 projetos").

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
| Controle desabilitado | `--disabled` | `bg-disabled` |
| Texto desabilitado | `--disabled-foreground` | `text-disabled-foreground` |

`--accent` é verde: serve para realçar, não para interações neutras. Linhas de
tabela e controles neutros usam `--surface-hover`.

Se a identidade mudar, altere os tokens; não percorra componentes substituindo
cores fixas.

## Espaçamento, forma e movimento

O espaçamento usa uma base de **4 px**. Os tokens expõem 4, 8, 16, 24, 48,
72 e 96 px. Antes de criar um valor arbitrário, escolha o passo existente mais
próximo.

| Token | Valor | Uso típico |
| :--- | :--- | :--- |
| `--ds-radius-xs` | 4 px | botões e controles compactos |
| `--ds-radius-sm` | 8 px | campos e itens internos |
| `--ds-radius-md` | 16 px | cartões, tabelas e estados vazios |
| `--ds-radius-lg` | 32 px | blocos de destaque |
| `--ds-radius-pill` | circular | badges |
| `--ds-shadow-sm` | elevação discreta | campos, cartões e tabelas |
| `--ds-shadow-md` | elevação intermediária | menus e camadas flutuantes |

> **Raio de botão.** Todos os botões herdam 4 px de `--ds-radius-xs`. A pílula
> fica para badge. Se o desenho mudar, muda o token ou a primitiva compartilhada,
> não cada chamada de `Button`.

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
- `neutral`: controle com contorno e hover cinza, usado em paginação e navegação.

Não crie um botão com classes locais de cor, altura ou raio. Escolha `variant`
e `size`; complemente `className` apenas para posicionamento ou largura.

O design system define a aparência desabilitada, igual em todas as variantes:
fundo cinza claro (`--disabled`), texto cinza (`--disabled-foreground`), sem
contorno nem sombra e cursor `not-allowed`. `ghost` e `link` mantêm o fundo
transparente e só ficam cinza. O componente consumidor define quando o controle
fica desabilitado; por exemplo, a paginação bloqueia a seta
anterior na primeira página e a próxima seta na última página.

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

`Input` e `SelectTrigger` têm duas variantes:

- `default`: campo em caixa, com contorno e sombra. É o padrão.
- `underline`: campo sem caixa, só com a linha de base e o rótulo em
  sobrescrita. Para formulários longos, em que a moldura de cada campo compete
  com a hierarquia das seções. Usado na criação de projeto.

Passe a variante ao wrapper, não ao primitivo: `ControlledInput` e
`ControlledSelect` aceitam `variant` e aplicam a mesma escolha ao rótulo e ao
controle, então os dois nunca saem trocados.

Campo obrigatório usa `required`, nunca um asterisco digitado no texto do
rótulo: o marcador visual é `aria-hidden` e quem usa leitor de tela ouve a
palavra "obrigatório", em vez de "asterisco". O `required` também chega ao
controle — atributo nativo no `input`, `aria-required` no gatilho do select,
que é um `button` e não aceita o nativo.

```tsx
<ControlledInput control={form.control} name="name" label="Nome" variant="underline" />
```

No `underline`, foco e erro ficam na própria linha e nunca no anel: um `ring`
em volta de um campo sem moldura desenha uma caixa arredondada do nada. A linha
é sempre `border-b-2` para a troca de cor no foco não deslocar o layout, e usa
o mesmo token `ring` que esta seção pede para indicar foco.

Não recrie esse visual com classes locais numa página de feature. A tentativa
anterior usava seletores de descendente (`[&_input]:…`) passados como
`className` do próprio `input`: o seletor virava `input input`, não casava com
nada, e só os selects — envolvidos numa `div` — recebiam o estilo. As duas
metades do mesmo formulário renderizavam diferentes.

### Dados e estados

- `DataTable` padroniza cabeçalho, linhas, carregamento e resultado vazio.
- `SkeletonTable` representa carregamento sem deslocar a estrutura.
- `EmptyState` aceita ícone, título, descrição e ação.
- `Tabs` usa indicador inferior verde e não uma coleção de botões soltos.
- `Card` agrupa conteúdo relacionado; não deve envolver toda seção apenas para
  criar espaçamento.

### Séries do cálculo de demanda

As parcelas da demanda usam os tokens de gráfico, na ordem de cor do protótipo
H4. A mesma cor marca a linha da etapa e o segmento da barra "Composição das
cargas", pelo mapa `demandSeriesClassNames` da feature de projetos:

| Parcela | Token | Cor |
| :--- | :--- | :--- |
| `Drf` residencial | `chart-1` | verde |
| `Ds` áreas comuns | `chart-3` | azul |
| `Dve` recarga | `chart-4` | laranja |
| `Dc` comercial | `chart-2` | verde-escuro |

Os papéis tipográficos do H4 (Geist) são traduzidos para os da H3: etiqueta
mono em caixa alta, título de seção `text-lg font-semibold` sobre fio escuro,
fórmula `font-mono text-xs` e cifra do resultado `font-mono text-6xl`.

## Cabeçalho e navegação

O menu principal é **horizontal** a partir de telas grandes. Em telas menores,
o botão de menu abre a mesma lista verticalmente em um painel lateral. Não há
duas configurações distintas de navegação.

Os itens vivem em:

```text
app/front/src/components/layout/nav-items.ts
```

`APP_NAV_ITEMS` é a fonte única tanto para o cabeçalho quanto para o painel
móvel. Uma área sem rota pode aparecer com `disabled: true`; ela só se torna
interativa no mesmo commit que cria a rota. Item de uma área restrita leva
`roles`: "Normas e tabelas" é `roles: ["admin"]` e some para o projetista, em
vez de aparecer desabilitado.

```ts
{ to: "/", label: "Meus projetos", exact: true }
{ label: "Novo Projeto", disabled: true }
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
- [ ] Títulos em Title Case, sem travessão nem ponto médio no texto.
- [ ] Possui carregamento, erro e estado vazio quando aplicável.
- [ ] Funciona com teclado e foco visível.
- [ ] Foi conferida em largura móvel e desktop.
- [ ] Passa em `pnpm validate` e `pnpm build`.

## Escopo desta entrega

O design system fornece fundações e componentes. A implementação funcional da
tela “Meus projetos”, seus filtros, busca, paginação e integração com a API
pertence à branch específica da tela.
