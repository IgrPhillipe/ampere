# Lote de Portes Base UI: Scaffold do AMPERE

2026-09-15. Componentes gerados pelo registry do shadcn (Radix) e reescritos para
`@base-ui/react`, mais o `field`, criado do zero. `radix-ui` saiu das
dependências: nenhum arquivo em `src/` o importa.

## Portados

`avatar`, `dialog`, `sheet` (deriva do dialog), `dropdown-menu` (→ `Menu`),
`select`, `popover`, `tabs`, `switch`, `checkbox`, `separator`, `badge`,
`field` (novo, base do `components/form`)

`label` virou um `<label>` nativo: o Base UI não tem Label avulso, apenas `Field.Label`.

## Mapa de Equivalências

| Radix | Base UI |
| :--- | :--- |
| `Dialog.Overlay` | `Dialog.Backdrop` |
| `Dialog.Content` | `Dialog.Popup` |
| `DropdownMenu.Content` | `Menu.Portal` > `Menu.Positioner` > `Menu.Popup` |
| `DropdownMenu.Label` | `Menu.GroupLabel` (**apenas dentro de `Menu.Group`**) |
| `Tabs.Trigger` / `Tabs.Content` | `Tabs.Tab` / `Tabs.Panel` |
| `asChild` + `Slot` | prop `render` ou hook `useRender` |
| `data-[state=open]` | `data-open` / `data-closed` |
| animação de entrada/saída | `data-starting-style` / `data-ending-style` |

O `Positioner` é obrigatório entre `Portal` e `Popup` em menu, select e popover.
Sem ele, o popup não posiciona.

## Três Armadilhas que Só Aparecem em Runtime

As três passaram no `tsc` e só quebraram no navegador. Todo componente novo
portado exige verificação da tela no navegador.

1. **`Menu.GroupLabel` fora de `Menu.Group` lança exceção.** No Radix, o Label
   funciona avulso. No Base UI, o CatchBoundary do TanStack Router engole o erro
   e o menu não abre, sem nenhum aviso na tela.
   Por isso `DropdownMenuLabel` renderiza um `div`. Para rotular um grupo,
   use `DropdownMenuGroupLabel`.

2. **`Select.Value` mostra o valor, não o rótulo.** O Radix mostra o `ItemText`.
   No Base UI, o `Select` precisa receber `items` (mapa valor → rótulo); sem isso,
   o gatilho exibe `"b"` em vez de `"Opcao B"`. Documentado em `select.tsx`.

3. **`@custom-variant dark` era obrigatório e não existia.** Os tokens seguiam a
   classe `.dark`, mas os utilitários `dark:` do Tailwind v4 seguem o
   `prefers-color-scheme` do sistema. Com o SO em modo escuro, o
   `dark:data-unchecked:bg-foreground` do switch pintava o thumb de preto num
   tema claro. Corrigido em `src/styles/index.css` com
   `@custom-variant dark (&:where(.dark, .dark *))`.

## Verificação Feita

Rota temporária com select, tabs, switch, checkbox e popover, mais o fluxo
real de login → `AppShell` → dropdown do usuário → sheet mobile → logout.
Conferido: abertura e fechamento, `aria-checked` / `data-active` / `role="menu"`,
troca de painel das tabs, rótulo do select, backdrop do sheet e a troca de
tokens no modo escuro.

## Pendente

`calendar`, `chart` e `command` não foram portados; entram quando uma tela
precisar deles. O registry do shadcn gera a versão Radix, que deve ser portada
seguindo a tabela acima.
