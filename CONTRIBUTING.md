# Guia de contribuição

## Estrutura do repositório

```
projetos3/
├── app/
│   ├── front/          # interface web (React + Vite)
│   └── back/           # API + motor de cálculo (Java, Spring Boot, PostgreSQL)
├── docs/               # documentação de negócio, produto e técnica
└── CONTRIBUTING.md     # este arquivo
```

---

## Fluxo de trabalho (Git)

1. Crie ou escolha uma issue antes de implementar mudanças significativas.
2. Crie uma branch a partir de `main`:
   ```bash
   git checkout -b feat/nome-curto-da-feature
   # ou: fix/descricao-do-bug
   ```
3. Implemente seguindo as convenções abaixo.
4. Valide localmente.
5. Abra um Pull Request com descrição clara: o quê, por quê e como testar.

### Mensagens de commit

Use [Conventional Commits](https://www.conventionalcommits.org/) em inglês:

```
feat: add demand calculation for residential buildings
fix: correct power factor rounding in multi-unit calc
docs: add normative rules reference to premissas-desafio
refactor: extract ConsumerUnit into its own class
```

---

## Convenções

| Tópico                      | Padrão                                                        |
| :-------------------------- | :------------------------------------------------------------ |
| Classes, interfaces e enums | PascalCase — `ExampleService`                                  |
| Métodos e funções           | camelCase (front e back) — `findById`                          |
| Variáveis                   | camelCase — `pageSize`                                         |
| Constantes                  | UPPER_SNAKE_CASE — `MAX_PAGE_SIZE`                             |
| Pacotes Java                | minúsculo, sem separador — `br.com.ampere.controller`          |
| Arquivos front              | kebab-case                                                     |
| Arquivos back               | nome da classe pública — `ExampleService.java`                 |
| Tabelas e colunas do banco  | snake_case — o Hibernate já converte, não sobrescreva          |
| Idioma do código            | inglês (identificadores, commits)                              |
| Texto de UI                 | português                                                      |
| Mensagens de erro (API)     | português quando expostas ao usuário                           |

> `snake_case` não é convenção de Java em nenhuma parte do código — a regra
> anterior veio herdada do projeto passado, que era Python. A única exceção é o
> schema do banco, e ela sai de graça: o Hibernate converte `pageSize` em
> `page_size` pela estratégia de nomenclatura padrão.

---

## Requisito POO

A disciplina de **Programação Orientada a Objetos** exige que o motor de cálculo evidencie design OOP (herança, polimorfismo, encapsulamento). Classes de domínio como `BuildingType` (tipo de edificação), `ConsumerUnit` (unidade consumidora) e `DemandCalculator` (calculadora de demanda) devem ser modeladas explicitamente — sem lógica de negócio dispersa em funções soltas. Os nomes seguem a tabela acima; o termo normativo em português fica entre parênteses na primeira menção, para a rastreabilidade com a norma não se perder.

---

## Checklist antes do PR

### Front-end

```bash
cd app/front && pnpm validate && pnpm build
```

- [ ] `pnpm validate` passa (formatação, lint e tipos)
- [ ] `pnpm build` passa
- [ ] `src/routeTree.gen.ts` regenerado e commitado, se alguma rota mudou
- [ ] Nenhuma lógica de negócio nas camadas de rota/view
- [ ] Componente novo do shadcn portado para Base UI e **verificado no navegador**
- [ ] Texto de interface em português

### Back-end

```bash
cd app/back && ./mvnw spotless:apply && ./mvnw clean verify
```

- [ ] `./mvnw spotless:check` e `./mvnw clean verify` passam
- [ ] Novos endpoints documentados na interface OpenAPI
- [ ] Design OOP mantido (sem lógica de cálculo fora das classes de domínio)

---

## Reportar bugs

Abra uma issue com:

- Comportamento observado vs. esperado
- Passos para reproduzir
- Ambiente (local, deploy, branch)
- Screenshots ou logs quando relevante

---

Este projeto faz parte das disciplinas **Projetos 3 — SI** e **Programação Orientada a Objetos** (CESAR School, 2026.2).
