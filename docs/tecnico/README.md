# Documentação Técnica

Ponto de entrada da documentação técnica. Back-end em Java com Spring Boot sobre PostgreSQL; front-end em React com Vite, consumindo a API REST.

## Motor de Cálculo

O núcleo da solução é um **motor de cálculo de demanda elétrica** que aplica as regras normativas da Neoenergia Pernambuco de forma automatizada e rastreável.

Responsabilidades previstas:

- Receber os parâmetros do projeto elétrico (tipo de edificação, unidades consumidoras, cargas)
- Selecionar e aplicar a tabela normativa correspondente
- Executar as fórmulas de demanda (individual e coletiva)
- Retornar o resultado com indicação das regras aplicadas em cada etapa

O levantamento normativo está concluído e verificado contra os PDFs. As fórmulas, os métodos por tipo de edificação, as treze tabelas paramétricas e os cinco exemplos resolvidos que servem de suíte de regressão estão em [`fontes-normativas.md`](fontes-normativas.md).

O método é repartido entre duas normas: **DIS-NOR-053 REV 06** para a estrutura do cálculo e o método da área útil; **DIS-NOR-030 REV 07** para o método da carga instalada. As duas são revisadas de forma independente, por isso cada cálculo registra as duas revisões aplicadas. Entradas, saídas, validações normativas e o registro de rastreabilidade por cálculo estão em [`engine-calculo.md`](engine-calculo.md).

A norma foi revisada sete vezes em menos de quatro anos. Os parâmetros normativos são dados versionados e persistidos, não constantes no código, e cada cálculo registra a revisão aplicada.

---

## Design OOP (Requisito POO)

A disciplina de **Programação Orientada a Objetos** exige que o motor seja modelado explicitamente com classes de domínio. O diagrama de classes e a justificativa de design ficam nesta seção.

Premissas iniciais em [`docs/negocio/premissas-desafio.md`](../negocio/premissas-desafio.md#requisito-poo).

---

## Front-end

Scaffold em `app/front`: React 19 com Vite 8, TanStack Router e Query,
Tailwind 4 e shadcn/ui sobre Base UI. O front consome a API real; o MSW é
opcional em desenvolvimento, ativado por `VITE_ENABLE_MSW`.

| Documento                                          | Conteúdo                                                                                                                                                                       |
| :------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`convencoes-front.md`](convencoes-front.md)       | **Documento único da stack.** Estrutura, nomes e aliases; camadas, roteamento, auth, erros e tema; receitas passo a passo para criar feature, service, rota e componente |
| [`design-system-front.md`](design-system-front.md) | Identidade visual Neoenergia, tokens, componentes compartilhados, navegação e regras de uso da logo                                                                            |

Como executar: [`app/front/README.md`](../../app/front/README.md).

Estado atual: login pela API, com o token JWT guardado no cliente. Pendências em [`pendencias.md`](../pendencias.md).

---

## Back-end

Scaffold em `app/back`: Java 21 com Spring Boot 4.1 e Spring Data JPA sobre PostgreSQL, tudo containerizado.

| Documento                                  | Conteúdo                                                                                                                                                              |
| :----------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`convencoes-back.md`](convencoes-back.md) | **Documento único da stack.** Nomenclatura e pacotes; camadas, contrato com o front, banco e Docker; receita passo a passo para criar uma entidade ponta a ponta |

Como executar: [`app/back/README.md`](../../app/back/README.md).

Estado atual: autenticação por JWT, com a rota `/admin/**` restrita ao papel `ADMIN`. O schema é gerado pelo Hibernate (`ddl-auto=update`), sem migrations versionadas. Pendências em [`pendencias.md`](../pendencias.md).

---

## Convenções Gerais

- Idioma do código: inglês
- Texto de UI: português
- Rotas finas, lógica centralizada em services/classes de domínio
- Sem SQL/lógica de negócio nas camadas de entrada HTTP

A tabela completa de nomenclatura está no [`CONTRIBUTING.md`](../../CONTRIBUTING.md).
