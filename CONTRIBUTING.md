# Guia de contribuição

## Estrutura do repositório

```
projetos3/
├── app/
│   ├── front/          # interface web (stack a definir)
│   └── back/           # API + motor de cálculo (stack a definir)
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
refactor: extract UnidadeConsumidora into its own class
```

---

## Convenções

| Tópico                  | Padrão                                             |
| :---------------------- | :------------------------------------------------- |
| Nomenclatura de classes | PascalCase                                         |
| Nomenclatura de funções | camelCase (front) / snake_case (back)              |
| Arquivos front          | kebab-case                                         |
| Arquivos back           | snake_case                                         |
| Idioma do código        | inglês (identificadores, commits)                  |
| Texto de UI             | português                                          |
| Mensagens de erro (API) | português quando expostas ao usuário               |

---

## Requisito POO

A disciplina de **Programação Orientada a Objetos** exige que o motor de cálculo evidencie design OOP (herança, polimorfismo, encapsulamento). Classes de domínio como `EdificacaoTipo`, `UnidadeConsumidora` e `CalculadoraDemanda` devem ser modeladas explicitamente — sem lógica de negócio dispersa em funções soltas.

---

## Checklist antes do PR

### Front-end
> Comandos de validação serão adicionados quando a stack for definida.

- [ ] Build passa sem erros de tipo
- [ ] Nenhuma lógica de negócio nas camadas de rota/view

### Back-end
> Comandos de validação serão adicionados quando a stack for definida.

- [ ] Lint e testes passam
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
