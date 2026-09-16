# Documentação Técnica

Ponto de entrada da documentação técnica. Back-end em Java com Spring Boot sobre PostgreSQL; front-end em React com Vite, consumindo a API REST.

## Motor de Cálculo

O núcleo da solução é um **motor de cálculo de demanda elétrica** que aplica as regras normativas da Neoenergia Pernambuco de forma automatizada e rastreável.

Responsabilidades previstas:

- Receber os parâmetros do projeto elétrico (tipo de edificação, unidades consumidoras, cargas)
- Selecionar e aplicar a tabela normativa correspondente
- Executar as fórmulas de demanda (individual e coletiva)
- Retornar o resultado com indicação das regras aplicadas em cada etapa

O levantamento normativo está feito e verificado contra os PDFs: as fórmulas, os métodos por tipo de edificação, as treze tabelas paramétricas e os cinco exemplos resolvidos que servem de suíte de regressão estão em [`fontes-normativas.md`](fontes-normativas.md). O método é repartido entre duas normas — **DIS-NOR-053 REV 06** para a estrutura do cálculo e o método da área útil, **DIS-NOR-030 REV 07** para o método da carga instalada — e as duas revisam de forma independente, então cada cálculo registra as duas revisões aplicadas. Entradas, saídas, validações normativas e o registro de rastreabilidade por cálculo estão em [`engine-calculo.md`](engine-calculo.md).

A norma foi revisada sete vezes em menos de quatro anos. Os parâmetros normativos são tratados como dados versionados e persistidos, não constantes no código, e cada cálculo registra qual revisão aplicou.

---

## Design OOP (requisito POO)

A disciplina de **Programação Orientada a Objetos** exige que o motor seja modelado explicitamente com classes de domínio. O diagrama de classes e a justificativa de design serão documentados aqui.

Ver premissas iniciais em [`docs/negocio/premissas-desafio.md`](../negocio/premissas-desafio.md#requisito-poo).

---

## Front-end

O scaffold do `app/front` está no repositório. React 19 com Vite 8, TanStack
Router e Query, Tailwind 4 e shadcn/ui sobre Base UI, com MSW interceptando
as chamadas em desenvolvimento.

| Documento | Conteúdo |
| :--- | :--- |
| [`convencoes-front.md`](convencoes-front.md) | **documento único da stack** — estrutura, nomes e aliases; camadas, roteamento, auth, erros e tema; e as receitas passo a passo para criar feature, service, rota e componente |

Como executar: [`app/front/README.md`](../../app/front/README.md).

Estado atual: o login ainda responde contra o MSW, porque a autenticação depende da Q1c. Ver [`pendencias.md`](../pendencias.md).

---

## Back-end

O scaffold do `app/back` está no repositório: Java 21 com Spring Boot 4.1, Spring Data JPA sobre PostgreSQL, tudo containerizado.

| Documento | Conteúdo |
| :--- | :--- |
| [`convencoes-back.md`](convencoes-back.md) | **documento único da stack** — nomenclatura e pacotes; camadas, contrato com o front, banco e Docker; e a receita passo a passo para criar uma entidade ponta a ponta |

Como executar: [`app/back/README.md`](../../app/back/README.md).

Estado atual: sem autenticação (depende da Q1c) e sem migrations versionadas. Ver [`pendencias.md`](../pendencias.md).

---

## Convenções gerais

- Idioma do código: inglês
- Texto de UI: português
- Rotas finas, lógica centralizada em services/classes de domínio
- Sem SQL/lógica de negócio nas camadas de entrada HTTP

A tabela completa de nomenclatura está no [`CONTRIBUTING.md`](../../CONTRIBUTING.md).
