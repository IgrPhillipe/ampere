# Pendências

Backlog operacional do projeto: correções e tarefas de manutenção em artefatos, boards e configuração. Questões de produto não entram aqui — vão para [`produto/questoes-em-aberto.md`](produto/questoes-em-aberto.md).

| # | Item | Onde | Responsável | Status |
| :-: | :--- | :--- | :---------- | :----- |
| 1 | Espinha *Machine* tem uma ramificação cujo texto repete o efeito, em vez de uma causa | Figma, board Diagrama Ishikawa | Lucas Gabriel | Aberta |
| 2 | Card "Clientes / proprietários das edificações" aparece duplicado | Figma, board Mapa de Stakeholders | Afonso Araújo | Aberta |
| 3 | Card "Riscos comuns" afirma descompasso entre os cronogramas, que não existe | Figma, board Ideação Parte 1 | Igor Aragão | Aberta |
| 4 | Dois arquivos "Benchmarking"; o de 10/08/2026 está superado e deve ser arquivado | Figma, projeto 636750169 | André Montenegro | Aberta |
| 5 | Subpágina *Ideação* não publicada | Google Sites | Jean Augusto e André Montenegro | Aberta |
| 6 | Subpáginas *Ideação* e *Desenvolvimento* são prometidas em `/processo` e não existem | Google Sites | Jean Augusto e André Montenegro | Aberta |
| 7 | Tabela de convenções define `snake_case` para funções e arquivos de back-end; a stack é Java com Spring Boot, que usa camelCase e PascalCase | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) | Igor Aragão | Aberta |
| 8 | `.gitignore` cobre Node e Python, herdado de outro projeto; falta `target/`, `*.class` e `.gradle/` | [`../.gitignore`](../.gitignore) | Igor Aragão | Aberta |
| 9 | Verificar com a biblioteca da CESAR se há assinatura institucional da coleção ABNT | — | Igor Aragão | Aberta |
| 10 | Avaliar verificador automático de revisão nova da DIS-NOR-053: o PDF tem URL estável e revisão no cabeçalho | [`tecnico/fontes-normativas.md`](tecnico/fontes-normativas.md) | A definir | Ideia |
| 11 | `app/front/README.md` declarava a variável de ambiente como `API_URL`; o Vite só expõe ao navegador variáveis com prefixo `VITE_`. Passou a ser `VITE_API_URL` no scaffold do front | [`../app/front/README.md`](../app/front/README.md) | Igor Aragão | Resolvida |
| 12 | Aliases de caminho vivem duplicados em `tsconfig.app.json` e `tsconfig.json`; a repetição existe porque o CLI do shadcn não lê project references, e precisa ser mantida em sincronia à mão | [`../app/front/tsconfig.json`](../app/front/tsconfig.json) | Igor Aragão | Aberta |
| 13 | Papéis de usuário do front são placeholder (`"user" \| "admin"`); os papéis reais dependem da Q1c em [`produto/questoes-em-aberto.md`](produto/questoes-em-aberto.md) | [`../app/front/src/features/auth/types/index.ts`](../app/front/src/features/auth/types/index.ts) | Igor Aragão | Aberta |
| 14 | Front-end sem testes automatizados por decisão de escopo do scaffold; o portão de qualidade é `pnpm validate` mais verificação manual no navegador | [`../app/front/package.json`](../app/front/package.json) | A definir | Aberta |
