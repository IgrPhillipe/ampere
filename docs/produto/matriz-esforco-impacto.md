# Matriz Esforço × Impacto

Priorização das sete histórias de usuário contra dois eixos: impacto no problema e dificuldade de implementação. Define a ordem de construção do MVP.

Fase: Ideação ([`../processo.md`](../processo.md)) · Board: [FigJam — Matriz Impacto x Esforço](https://www.figma.com/board/f0pJpuS2qghO8PZTmgbaKB/Matriz-Impacto-x-Esfor%C3%A7o)

## Quadrantes

| Quadrante | Eixos | Leitura |
| :--- | :--- | :--- |
| **Essencial** | Fácil · alto impacto | Bons frutos rapidamente |
| **Estratégico** | Difícil · alto impacto | O ganho potencial justifica o esforço |
| **Indiferente** | Fácil · baixo impacto | Há como aumentar o impacto? |
| **Luxo** | Difícil · baixo impacto | É realmente necessário? |

## Posicionamento

As sete histórias estão em [`user-stories.md`](user-stories.md).

| Quadrante | História | Perfil |
| :--- | :--- | :--- |
| **Essencial** | US01 — Acompanhamento de projetos e status | Projetista |
| **Essencial** | US02 — Configuração inicial dos parâmetros da edificação | Projetista |
| **Essencial** | US06 — Fila de análise técnica priorizada | Analista |
| **Estratégico** | US03 — Cadastro e validação em tempo real de UCs | Projetista |
| **Estratégico** | US04 — Conferência do cálculo passo a passo da demanda | Projetista |
| **Estratégico** | US05 — Geração de memorial e envio do projeto | Projetista |
| **Estratégico** | US07 — Auditoria de memória e registro de apontamentos | Analista |

**Indiferente e Luxo estão vazios.** As histórias são derivadas da solução escolhida em [`ideacao.md`](ideacao.md), e as ideias que não a serviam já saíram na etapa de descarte do brainstorming. A matriz aqui não separa o que entra do que sai — separa a ordem de construção do que já entrou.

## O que a matriz decide

O eixo de esforço concentra a dificuldade no motor de cálculo: US03, US04, US05 e US07 dependem das tabelas normativas, dos fatores por parcela e do registro de rastreabilidade ([`../tecnico/engine-calculo.md`](../tecnico/engine-calculo.md)). US01, US02 e US06 são cadastro, listagem e ordenação.

Ordem de construção decorrente:

| Sprint | Histórias | Razão |
| :--- | :--- | :--- |
| Primeiras | US01 e US02 | Abrem o fluxo do projetista e já leem e escrevem no banco, atendendo ao requisito de POO |
| Seguintes | US03 e US04 | Núcleo do motor de cálculo, onde está o valor do produto |
| Depois | US05, US06 e US07 | Fecham a saída documental e o lado da análise |
