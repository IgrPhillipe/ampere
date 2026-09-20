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
| 7 | Tabela de convenções define `snake_case` para funções e arquivos de back-end; a stack é Java com Spring Boot, que usa camelCase e PascalCase | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) | Igor Aragão | Resolvida |
| 8 | `.gitignore` cobre Node e Python, herdado de outro projeto; falta `target/`, `*.class` e `.gradle/` | [`../.gitignore`](../.gitignore) | Igor Aragão | Resolvida |
| 9 | Verificar com a biblioteca da CESAR se há assinatura institucional da coleção ABNT | — | Igor Aragão | Aberta |
| 10 | Avaliar verificador automático de revisão nova da DIS-NOR-053: o PDF tem URL estável e revisão no cabeçalho | [`tecnico/fontes-normativas.md`](tecnico/fontes-normativas.md) | A definir | Ideia |
| 11 | `app/front/README.md` declarava a variável de ambiente como `API_URL`; o Vite só expõe ao navegador variáveis com prefixo `VITE_`. Passou a ser `VITE_API_URL` no scaffold do front | [`../app/front/README.md`](../app/front/README.md) | Igor Aragão | Resolvida |
| 12 | Aliases de caminho vivem duplicados em `tsconfig.app.json` e `tsconfig.json`; a repetição existe porque o CLI do shadcn não lê project references, e precisa ser mantida em sincronia à mão | [`../app/front/tsconfig.json`](../app/front/tsconfig.json) | Igor Aragão | Aberta |
| 13 | Papéis de usuário do front são placeholder (`"user" \| "admin"`); os papéis reais dependem da Q1c em [`produto/questoes-em-aberto.md`](produto/questoes-em-aberto.md) | [`../app/front/src/features/auth/types/index.ts`](../app/front/src/features/auth/types/index.ts) | Igor Aragão | Aberta |
| 14 | Front-end sem testes automatizados por decisão de escopo do scaffold; o portão de qualidade é `pnpm validate` mais verificação manual no navegador | [`../app/front/package.json`](../app/front/package.json) | A definir | Aberta |
| 15 | Back-end sem autenticação: os endpoints estão abertos e o `POST /api/auth/login` que o front espera não existe. Depende da Q1c em [`produto/questoes-em-aberto.md`](produto/questoes-em-aberto.md), que define quem acessa o sistema | [`../app/back/`](../app/back/) | A definir | Aberta |
| 16 | Schema do banco criado por `ddl-auto=update` do Hibernate, sem migration versionada. Colide com o requisito de parâmetros normativos como dados versionados em [`tecnico/README.md`](tecnico/README.md); o caminho é Flyway. **O custo apareceu na criação de projeto:** coluna `NOT NULL` nova não entra em tabela populada, o Hibernate loga a falha e sobe contra schema incompleto, e a saída é apagar o banco de desenvolvimento (`docker compose down -v`) | [`../app/back/src/main/resources/application.properties`](../app/back/src/main/resources/application.properties) | A definir | Aberta |
| 17 | `app/back/README.md` declarava `DATABASE_URL` como única variável; o Spring precisa de URL JDBC mais usuário e senha separados. Tabela corrigida no scaffold | [`../app/back/README.md`](../app/back/README.md) | Igor Aragão | Resolvida |
| 18 | Back-end sem testes além do `contextLoads` gerado, que ainda exige o PostgreSQL no ar para passar | [`../app/back/src/test/`](../app/back/src/test/) | Igor Aragão | Resolvida |
| 19 | `entranceStandard` é persistido mas não influencia o método de cálculo: a tabela de regras por tipo em [`tecnico/fontes-normativas.md`](tecnico/fontes-normativas.md) chaveia pelo tipo de uso, e nenhum documento diz o que muda quando a medição é individual | [`../app/back/src/main/java/br/com/ampere/domain/`](../app/back/src/main/java/br/com/ampere/domain/) | A definir | Aberta |
| 20 | `Mixed` não declara parcela de serviços de condomínio: o item 6.24.1 não estende o 6.22.4 e a ligação não foi inventada | [`../app/back/src/main/java/br/com/ampere/domain/Mixed.java`](../app/back/src/main/java/br/com/ampere/domain/Mixed.java) | A definir | Aberta |
| 21 | Protocolo gerado por `MAX` da sequência do ano, não por sequence de banco. Só é seguro porque a coluna é única e a criação tem retry; concorrência real pede `SEQUENCE` ou advisory lock, e isso chega junto com o Flyway da pendência 16 | [`../app/back/src/main/java/br/com/ampere/utils/Protocols.java`](../app/back/src/main/java/br/com/ampere/utils/Protocols.java) | A definir | Aberta |
| 22 | Tipos de edificação 6.25.1 (Smart/Studio acima de 15 unidades) e 6.22.2 (unidade com carregador veicular) ainda não têm subclasse de `BuildingType` | [`../app/back/src/main/java/br/com/ampere/domain/`](../app/back/src/main/java/br/com/ampere/domain/) | A definir | Aberta |
