# Lote de portes Base UI — scaffold do AMPERE

2026-09-15. Nove componentes gerados pelo registry do shadcn (Radix) e reescritos
para `@base-ui/react`. `radix-ui` foi removido das dependencias: nada em `src/`
importa mais.

## Portados

`avatar` · `dialog` · `sheet` (deriva do dialog) · `dropdown-menu` (→ `Menu`) ·
`select` · `popover` · `tabs` · `switch` · `checkbox` · `separator` · `badge` ·
`field` (novo, base do `components/form`)

`label` virou um `<label>` nativo: o Base UI nao tem Label solto, so `Field.Label`.

## Mapa de equivalencias

| Radix | Base UI |
| :--- | :--- |
| `Dialog.Overlay` | `Dialog.Backdrop` |
| `Dialog.Content` | `Dialog.Popup` |
| `DropdownMenu.Content` | `Menu.Portal` > `Menu.Positioner` > `Menu.Popup` |
| `DropdownMenu.Label` | `Menu.GroupLabel` (**so dentro de `Menu.Group`**) |
| `Tabs.Trigger` / `Tabs.Content` | `Tabs.Tab` / `Tabs.Panel` |
| `asChild` + `Slot` | prop `render`, ou o hook `useRender` |
| `data-[state=open]` | `data-open` / `data-closed` |
| animacao de entrada/saida | `data-starting-style` / `data-ending-style` |

O `Positioner` e obrigatorio entre `Portal` e `Popup` em menu, select e popover.
Sem ele o popup nao posiciona.

## Tres armadilhas que so aparecem em runtime

Todas passaram no `tsc` e so quebraram no navegador. Vale abrir a tela depois de
portar qualquer componente novo.

1. **`Menu.GroupLabel` fora de `Menu.Group` lanca excecao.** No Radix o Label
   funciona solto. Aqui o erro e engolido pelo CatchBoundary do TanStack Router
   e o menu inteiro simplesmente nao abre, sem nada visivel na tela.
   Por isso `DropdownMenuLabel` renderiza um `div`; para rotular um grupo de
   verdade existe `DropdownMenuGroupLabel`.

2. **`Select.Value` mostra o valor, nao o rotulo.** O Radix mostra o `ItemText`.
   Aqui e preciso passar `items` ao `Select` (mapa valor → rotulo), senao o
   gatilho exibe `"b"` em vez de `"Opcao B"`. Documentado em `select.tsx`.

3. **`@custom-variant dark` era obrigatorio e nao existia.** Os tokens seguiam a
   classe `.dark`, mas os utilitarios `dark:` do Tailwind v4 seguem o
   `prefers-color-scheme` do sistema. Resultado: com o SO em modo escuro, o
   `dark:data-unchecked:bg-foreground` do switch pintava o thumb de preto num
   tema claro. Corrigido em `src/styles/index.css` com
   `@custom-variant dark (&:where(.dark, .dark *))`.

## Verificacao feita

Rota temporaria montando select, tabs, switch, checkbox e popover, mais o fluxo
real de login → `AppShell` → dropdown do usuario → sheet mobile → logout.
Conferido: abertura e fechamento, `aria-checked` / `data-active` / `role="menu"`,
troca de painel das tabs, rotulo do select, backdrop do sheet e a virada de
tokens no modo escuro.

## Pendente

`calendar`, `chart` e `command` nao foram portados — entram quando uma tela
pedir. O registry do shadcn vai gerar a versao Radix; siga a tabela acima.
