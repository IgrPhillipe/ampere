# Mapa de Stakeholders

> Atores envolvidos no processo de submissão e análise de projetos elétricos, classificados por **grau de proximidade com o problema** (primário, secundário, terciário) e por **posição em relação à Neoenergia** (dentro ou fora da empresa).

Fase: **Imersão** ([`../processo.md`](../processo.md)) · Responsável: Afonso Araújo · Fonte: [Figma — Mapa de Stakeholders](https://www.figma.com/board/9MbYu3RwGB9twN6NJmUWso/Mapa-de-Stakeholders)

---

## Critério de classificação

| Anel           | Significado                                                                        |
| :------------- | :--------------------------------------------------------------------------------- |
| **Primário**   | Atua diretamente na operação de energia — mais próximo do núcleo do negócio        |
| **Secundário** | Participa diretamente do ciclo de projeto elétrico (elabora, analisa ou constrói)  |
| **Terciário**  | Influencia ou é afetado, sem participar da execução técnica do projeto             |

O segundo eixo separa quem é **interno à Neoenergia** de quem é **externo**.

---

## Mapa

| Anel           | Fora da empresa                                                                                                                   | Dentro da empresa                                                                                                       |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **Primário**   | Fornecedores de matérias-primas<br>Geradoras de energia elétrica                                                                    | Operação da rede elétrica<br>Gestão de ativos                                                                            |
| **Secundário** | Projetistas e Engenheiros Eletricistas<br>Empresas de engenharia<br>Construtoras e Incorporadoras<br>Fabricantes de equipamentos elétricos | Área de normas técnicas<br>Área de análise de projetos<br>Planejamento e projetos<br>Engenharia                          |
| **Terciário**  | Clientes / proprietários das edificações<br>Incorporadoras e empresas imobiliárias<br>ANEEL / órgãos reguladores                    | Jurídico / Compliance<br>Gestão de processos<br>Atendimento ao cliente<br>Gestão / Diretoria<br>TI / Desenvolvimento     |

> **Pendência no board:** o card *Clientes / proprietários das edificações* aparece duplicado (dois post-its, mesmo anel e mesma posição). Aqui está registrado uma única vez.

---

## Quem o produto atinge diretamente

Duas caixas do anel **secundário** concentram o problema, uma de cada lado da submissão:

| Stakeholder                                | Posição       | Relação com o problema                                                              |
| :----------------------------------------- | :------------ | :---------------------------------------------------------------------------------- |
| **Projetistas e Engenheiros Eletricistas** | Fora          | Elaboram o cálculo de demanda manualmente e têm o projeto reprovado                 |
| **Área de análise de projetos**            | Dentro        | Recebe o projeto, identifica a inconsistência e devolve para correção               |

São os dois lados do mesmo ciclo de retrabalho descrito em [`../negocio/premissas-desafio.md`](../negocio/premissas-desafio.md#impacto) — e os mesmos dois lados que o [`../negocio/benchmarking.md`](../negocio/benchmarking.md) mostrou desassistidos: nenhuma ferramenta do mercado valida o cálculo antes do envio nem aponta onde está o erro.

Stakeholders de apoio relevantes para a construção da solução:

- **Área de normas técnicas** (secundário/dentro) — fonte das regras que o motor de cálculo precisa aplicar
- **TI / Desenvolvimento** (terciário/dentro) — eventual integração com o sistema oficial de submissão
- **ANEEL / órgãos reguladores** (terciário/fora) — define o marco regulatório acima das normas da distribuidora

---

## Em aberto

Qual dos dois usuários do anel secundário é o **usuário do MVP** ainda não foi decidido — ver [`questoes-em-aberto.md`](questoes-em-aberto.md).
