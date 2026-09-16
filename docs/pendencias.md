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
| 15 | Back-end sem autenticação: os endpoints estão abertos e o `POST /api/auth/login` que o front espera não existe. Depende da Q1c em [`produto/questoes-em-aberto.md`](produto/questoes-em-aberto.md), que define quem acessa o sistema | [`../app/back/`](../app/back/) | A definir | Aberta |
| 16 | Schema do banco criado por `ddl-auto=update` do Hibernate, sem migration versionada. Colide com o requisito de parâmetros normativos como dados versionados em [`tecnico/README.md`](tecnico/README.md); o caminho é Flyway | [`../app/back/src/main/resources/application.properties`](../app/back/src/main/resources/application.properties) | A definir | Aberta |
| 17 | `app/back/README.md` declarava `DATABASE_URL` como única variável; o Spring precisa de URL JDBC mais usuário e senha separados. Tabela corrigida no scaffold | [`../app/back/README.md`](../app/back/README.md) | Igor Aragão | Resolvida |
| 18 | Back-end sem testes além do `contextLoads` gerado, que ainda exige o PostgreSQL no ar para passar | [`../app/back/src/test/`](../app/back/src/test/) | A definir | Aberta |
