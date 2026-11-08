# Design System do Front-end

Referência visual e regras de uso da interface do AMPERE. Evita que cada tela
recrie cores, espaçamentos e componentes de forma diferente.

## Fontes de Decisão

Ordem de precedência:

1. O [Protótipo Hi-Fi](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI)
   define o estilo e a estrutura: tipografia, cores, fios, espaçamento e a
   página "Documentação: Hierarquia visual", que explica cada regra. O front
   se ajusta ao Figma, e não o contrário.
2. A issue da história define comportamento, estados e conteúdo obrigatório.
3. O contrato do back-end define quais dados podem ser exibidos.

Telas sem protótipo seguem o mesmo sistema, a partir do padrão mais próximo.
A comparação mais recente está em
[`../produto/auditoria-figma.md`](../produto/auditoria-figma.md).

### Metáfora e Regras

A interface é um documento técnico em página branca de largura total. A
hierarquia vem de tipografia, peso, tom e espaço, não de cor. A mesa bege com
a folha flutuante do Figma não é adotada: as telas ocupam a largura toda.

- Texto em Geist; toda medição (valores, unidades, protocolos, índices,
  referências normativas e datas) em Geist Mono.
- Regular para linguagem, Medium para rótulo e título, SemiBold só para
  número.
- Três tons: `text-foreground`, `text-muted-foreground` e
  `text-faint-foreground`.
- Um único campo de conclusão verde por tela (`ConclusionField`).
- Situação em versalete mono, sem cor (`Badge`). A barra de 2 px na margem
  (`AttentionIndicator`) marca só as linhas que pedem ação. Não há vermelho.
- Título de seção com `SectionHeading`: 19 Medium sobre fio de 1,5 px.
- Cantos retos e sem sombra.

## Arquivos Principais

| Arquivo | Responsabilidade |
| :--- | :--- |
| `app/front/src/styles/tokens.css` | cores primitivas e semânticas, tipografia, espaçamento, raios, sombras e integração com Tailwind |
| `app/front/src/styles/index.css` | imports globais e estilos-base dos elementos HTML |
| `app/front/src/components/ui/` | primitivos compartilhados que consomem os tokens semânticos |
| `app/front/src/components/layout/` | cabeçalho, navegação, shell, rodapé e cabeçalho de página |
| `app/front/public/neoenergia-logo.svg` | logo colorida oficial usada pelo cabeçalho |

## Tipografia

Fontes: `Geist Variable` e `Geist Mono Variable`, pelos pacotes
`@fontsource-variable/geist` e `@fontsource-variable/geist-mono`.

| Degrau | Classe | Uso |
| :--- | :--- | :--- |
| 60 mono Medium | `text-6xl font-mono` | número do campo de conclusão |
| 40 Medium | `text-3xl` | título da tela |
| 19 Medium | `text-lg` | título de seção |
| 15,5 Medium | `text-base` | item e nome em lista |
| 13,5 Regular | `text-sm` | corpo |
| 10,5 mono versalete | `text-2xs font-mono uppercase tracking-[0.11em]` | eyebrow, cabeçalho de tabela, situação e metadado |

### Títulos e Separadores

Títulos usam Title Case: cada palavra começa em maiúscula, exceto artigos,
preposições e conjunções curtas (a, o, e, de, da, do, em, para). Vale para
títulos de página e de seção, itens da navegação, etapas do stepper, títulos de
drawer, o `pageTitle` da aba e o texto de todos os botões. Exemplos: "Novo
Projeto", "Parâmetros Técnicos", "Tabelas Normativas", "Salvar Grupo", "Aprovar e
Publicar".

Badges e rótulos de status também usam Title Case ("Aguardando Revisão", "Em
Análise", "Falta Dado"). Rótulos de campo, mensagens, estados vazios e títulos
em forma de pergunta continuam em frase comum ("Aprovar e publicar a
tabela?").

Texto de interface não usa travessão nem ponto médio, nem como separador nem
como valor vazio. Separe com vírgula, dois-pontos, "e" ou parênteses, e troque o
valor vazio por texto com sentido ("Não informado", "Sem cálculo", "Pendente").
Intervalos são escritos com "a" ("1 a 6 de 6 projetos").

Datas usam `DD/MM/YYYY` ("09/10/2026"), sempre por `formatDate` e `formatDateTime`
de `@features/shared`, nunca com um `format` solto do dayjs.

## Cores

| Papel | Valor | Tailwind |
| :--- | :--- | :--- |
| Fundo | `#FFFFFF` | `bg-background` |
| Tinta | `#1E1A13` | `text-foreground` |
| Texto médio | `#60594B` | `text-muted-foreground` |
| Texto fraco | `#857C6B` | `text-faint-foreground` |
| Campo de conclusão | `#00702E` | `bg-primary` |
| Realce do resultado oficial | `#F0F2EC` | `bg-accent` |
| Bege claro | `#F3EFE7` | `bg-muted` |
| Fios | `#DED7C9`, `#D4CBBA`, `#EAE4D9` | `border-border`, `border-border-strong`, `border-border-soft` |
| Atenção | `#FF9C1A` | `bg-attention`, só na barra da margem ou num ponto |
| Ação destrutiva | `#9A5200` | `text-destructive`, só em link de texto |

As cores da marca são acento e nunca preenchem superfície, salvo o campo de
conclusão. Verde não aparece em texto, ícone ou borda sobre o papel.

## Espaçamento, Forma e Movimento

Os passos do Figma são 6, 12, 20 e 38 px (`1.5`, `3`, `5` e `9.5` no
Tailwind). O conteúdo fica a 40 px das bordas da janela.

Todos os raios valem zero e não há sombra, exceto a sombra discreta das
camadas flutuantes (`--ds-shadow-md`).

Transições são curtas e funcionais. Conteúdo que precisa aparecer
imediatamente não é animado.

## Componentes Compartilhados

Os primitivos ficam em `src/components/ui`. Preservam a API do shadcn, portados
para Base UI e ajustados ao design system.

### Botões

- `default`: a única ação principal da tela, cheia em `#00702E`.
- `secondary`: preenchido em tinta, usado no item selecionado de controles segmentados.
- `outline`: ação secundária com contorno em tinta.
- `ghost`: ação discreta em barras e menus.
- `destructive`: operação perigosa em destaque, em laranja escuro.
- `destructive-ghost`: excluir ou remover. Link de texto em laranja escuro.
- `link`: ação textual em tinta.
- `neutral`: controle com contorno, usado em paginação e navegação.

Não crie botão com classes locais de cor, altura ou raio. Escolha `variant` e
`size`; use `className` apenas para posicionamento ou largura.

Desabilitado é vazado em todas as variantes: fundo transparente, contorno
`border-border-strong` e texto `--disabled-foreground`. O componente consumidor
define quando o controle fica desabilitado.

```tsx
<Button>Novo Projeto</Button>
<Button variant="outline">Cancelar</Button>
```

### Badges

Badge é só para situação: texto mono em versalete, sem fundo e sem cor. O tom
e o peso contam o estado; a barra de 2 px na margem marca a linha que pede
ação.

| Variante | Aparência | Exemplos |
| :--- | :--- | :--- |
| `destructive`, `warning` | tinta, Medium | Reprovado, Atrasado, Aguardando Envio, Vence Hoje |
| `default`, `info`, `success`, `outline`, `secondary` | tinta | Em Análise, Aprovado, Publicada |
| `neutral` | tom fraco | Rascunho, No Prazo, Substituída |
| `tag` | contorno de 1 px | Reanálise |

Contagens (pendências, alertas, UCs) não viram badge: são números em mono na
própria coluna, e o zero fica em branco.

```tsx
<Badge variant="neutral">Rascunho</Badge>
<Badge variant="destructive">Reprovado</Badge>
```

### Campos e Controles

`Input`, `Textarea`, `Select`, `Checkbox` e `Switch` compartilham altura,
contorno, foco e estado desabilitado. Em formulários, use os wrappers de
`@components/form`, que conectam rótulo, descrição e erro acessível.

`Input`, `Textarea` e `SelectTrigger` têm duas variantes:

- `underline`: campo sem caixa, só com a linha de base e o rótulo em
  sobrescrita. É o padrão em todo o sistema: cadastro, login, grupos,
  apontamentos, parecer e tabelas normativas.
- `default`: campo em caixa, com contorno e sombra. Não é usado hoje; um campo
  em caixa arredondada destoa dos demais.

A variante é passada ao wrapper, não ao primitivo. `ControlledInput`,
`ControlledSelect`, `ControlledTextarea` e `ControlledCombobox` aceitam
`variant` e aplicam a mesma escolha ao rótulo e ao controle, o que impede os
dois de ficarem com variantes diferentes.

Campo obrigatório usa `required`, nunca asterisco digitado no texto do rótulo.
O marcador visual é `aria-hidden`, e o leitor de tela anuncia "obrigatório" em
vez de "asterisco". O `required` também chega ao controle: atributo nativo no
`input`, `aria-required` no gatilho do select, que é um `button` e não aceita o
atributo nativo.

```tsx
<ControlledInput control={form.control} name="name" label="Nome" required />
```

No `underline`, foco e erro ficam na própria linha, nunca no anel: um `ring` em
volta de um campo sem moldura desenha uma caixa arredondada inexistente no
desenho. A linha é sempre `border-b-2`, para que a troca de cor no foco não
desloque o layout, e usa o mesmo token `ring` que esta seção define para foco.

Não recrie esse visual com classes locais numa página de feature. Uma
implementação anterior passava seletores de descendente (`[&_input]:…`) como
`className` do próprio `input`: o seletor virava `input input` e não casava com
nada. Só os selects, envolvidos numa `div`, recebiam o estilo, e as duas metades
do mesmo formulário renderizavam diferentes.

### Dados e Estados

- `DataTable` padroniza cabeçalho, linhas, carregamento e resultado vazio.
- `SkeletonTable` representa carregamento sem deslocar a estrutura.
- `EmptyState` aceita ícone, título, descrição e ação.
- `ConfirmDialog` pede confirmação antes de uma ação; `destructive` deixa o botão vermelho, e o diálogo não fecha enquanto a requisição roda.
- `Tabs` usa indicador inferior verde, não uma coleção de botões soltos.
- `Card` agrupa conteúdo relacionado; não envolve uma seção inteira apenas para
  criar espaçamento.

### Tooltips de Atenção

O ícone de atenção (`AttentionIndicator`) marca a linha que pede ação e sempre
explica o motivo num tooltip. A cor vem da severidade: `critical` (vermelho)
para o que trava o fluxo, como projeto reprovado ou prazo vencido, e `warning`
(laranja) para o que ainda pode esperar, como envio pendente, prazo que vence
hoje ou alerta de pré-validação. O tooltip usa o token `tooltip` (cinza
translúcido, texto branco) e o texto segue um formato único, `TooltipMessage`:

| Parte | Conteúdo | Exemplo |
| :--- | :--- | :--- |
| `title` | o problema, em poucas palavras e com o número quando houver; não diz quem o causou | "Prazo vencido há 10 dias" |
| `details` | os fatos que sustentam o problema, um por linha, sem ponto final | "Venceu em 29/09/2026", "2 alertas na pré-validação do cálculo" |
| `action` | o que a pessoa deve fazer, numa frase | "Priorize esta análise." |

Na coluna de ação, o botão cheio é só para o que a pessoa precisa fazer agora
(corrigir, enviar, continuar, analisar um prazo crítico); consulta ou ação que
pode esperar é um link de texto sublinhado. A diferença é de formato, não de
cor: a gravidade já está no badge e no ícone.

O problema mais grave vem no título; os outros entram em `details`. O leitor de
tela recebe as mesmas partes numa frase só (`tooltipMessageText`). As mensagens
de cada tela ficam juntas numa função (`getProjectAttention`,
`getQueueItemAttention`), nunca espalhadas pelos componentes.

### Séries do Cálculo de Demanda

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

## Cabeçalho e Navegação

O menu principal é **horizontal** a partir de telas grandes. Em telas menores,
o botão de menu abre a mesma lista verticalmente em um painel lateral. Não há
duas configurações distintas de navegação.

Os itens ficam em:

```text
app/front/src/components/layout/nav-items.ts
```

`APP_NAV_ITEMS` é a fonte única do cabeçalho e do painel móvel. Uma área sem
rota pode aparecer com `disabled: true` e só se torna interativa no mesmo commit
que cria a rota. Item de área restrita leva `roles`: "Tabelas Normativas" é
`roles: ["admin"]` e fica oculto para o projetista, em vez de aparecer
desabilitado.

```ts
{ to: "/", label: "Meus projetos", exact: true }
{ label: "Novo Projeto", disabled: true }
```

O cabeçalho contém:

- fundo branco com fio inferior;
- logo oficial e o nome “AMPERE” em versalete;
- menu centralizado, com a rota ativa em tinta e Medium;
- opções futuras visíveis, porém desabilitadas;
- nome e papel do usuário em mono versalete, com o menu de logout;
- adaptação móvel sem mudar a ordem das opções.

## Uso da Logo

O arquivo `public/neoenergia-logo.svg` vem do cabeçalho do site oficial da
Neoenergia. A aplicação serve uma cópia local para não depender de conexão com
o domínio institucional em tempo de execução.

Regras:

- não redesenhar, recolorir, deformar ou recortar a marca;
- preservar a proporção com `width: auto`;
- manter área livre ao redor da imagem;
- usar `AppBrand` em vez de repetir a tag de imagem;
- substituir o arquivo somente por material oficial fornecido ou publicado
  pela Neoenergia.

## Tema e Acessibilidade

Esta versão do design system define apenas o **tema claro**. A classe `.dark`
continua reconhecida pela infraestrutura, mas não existe segunda paleta. Não
adicione correções isoladas com `dark:`. Um tema escuro futuro define todos os
tokens e é validado como entrega própria.

Requisitos para novos componentes:

- navegação completa por teclado;
- foco visível usando `ring-ring`;
- nome acessível para botões compostos apenas por ícone;
- estados `disabled` e `aria-invalid` perceptíveis sem depender só da cor;
- texto principal com contraste adequado sobre a superfície;
- respeito à hierarquia de títulos da página.

## Checklist para Novas Telas

- [ ] Usa `PageLayout` sob o `AppShell`, com eyebrow e título 40.
- [ ] Segue o frame do Figma ou o padrão mais próximo dele.
- [ ] Tem no máximo um campo de conclusão e uma ação principal.
- [ ] Usa tokens semânticos, sem hexadecimal no componente.
- [ ] Reutiliza componentes de `components/ui` e compartilhados.
- [ ] Mantém texto de interface em português.
- [ ] Títulos em Title Case, sem travessão nem ponto médio no texto.
- [ ] Possui carregamento, erro e estado vazio quando aplicável.
- [ ] Funciona com teclado e foco visível.
- [ ] Foi conferida em largura móvel e desktop.
- [ ] Passa em `pnpm validate` e `pnpm build`.

## Escopo Desta Entrega

O design system fornece fundações e componentes. A implementação funcional da
tela “Meus projetos” (filtros, busca, paginação e integração com a API)
pertence à branch específica da tela.
