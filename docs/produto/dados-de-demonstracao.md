# Dados de Demonstração

> Usuários e projetos que o seed cria para demonstrar o sistema inteiro, sem cadastro à mão.

O seed roda a cada inicialização fora do profile `prod` e `test`, ou com o profile `demo`. Cria só o que falta: o usuário por e-mail, o projeto por protocolo. Código em [`app/back/src/main/java/br/com/ampere/config`](../../app/back/src/main/java/br/com/ampere/config).

---

## Logins

Todos com a senha `senha@123`.

| E-mail | Perfil | Nome | Observação |
| :--- | :--- | :--- | :--- |
| `user@ampere.com` | Projetista | Usuário Teste | CREA 123456/PE. Dono da maioria dos projetos |
| `projetista@ampere.com` | Projetista | Carla Projetista | CREA 654321/PE. Projetos em Pernambuco e um em Pedras de Fogo |
| `joao@ampere.com` | Projetista | João Batista | CREA 223344/PB. Projetos em Pedras de Fogo, único município da Paraíba na área de concessão |
| `novo@ampere.com` | Projetista | Diego Novato | Senha temporária: o primeiro login leva à troca de senha. Sem projetos |
| `inativo@ampere.com` | Projetista | Bruno Inativo | Conta desativada: o login é recusado. Tem um projeto aprovado antigo |
| `admin@ampere.com` | Administrador | Admin Teste | Cadastra tabelas normativas, gere usuários, tem projetos próprios e também analisa |
| `conferente@ampere.com` | Administrador | Conferente Teste | Segunda leitura das tabelas normativas: publica o que o admin cadastra |
| `revisor@ampere.com` | Analista | Revisor Teste | Analista principal da fila |
| `analista@ampere.com` | Analista | Ana Analista | Segunda analista, com projetos em análise, uma reprovação e duas aprovações |

---

## Projetos

Os prazos e as datas são relativos ao momento do seed: um projeto enviado há 30 dias vence hoje, e assim por diante. O histórico segue a ordem real: criação, documentos e cálculo, envio, apontamentos, resposta, reenvio. Com o tempo os prazos envelhecem; para renová-los, veja [Como Reiniciar](#como-reiniciar).

Projetistas: **U** = Usuário Teste, **C** = Carla, **J** = João, **A** = Admin, **B** = Bruno.

### Rascunhos

| Protocolo | Projeto | Proj. | Situação | O que demonstra |
| :--- | :--- | :--- | :--- | :--- |
| 2026-2001 | Residencial Mar Azul | U | Rascunho | Projeto vazio, sem grupos |
| 2026-1001 | Residencial Monte Verde | U | Rascunho | Grupos nos três estados: Validado, Revisar (motor acima de 5 CV sem a partida) e Falta Dado (recarga sem gerenciamento). Não calcula |
| 2026-2002 | Edifício Capibaribe | U | Rascunho | Grupo com Falta Dado: cobertura sem área útil |
| 2026-2025 | Galpão Industrial Caruaru | C | Rascunho | Grupo em Revisar, não residencial |
| 2026-2016 | Residencial Petrolina Sol | U | Rascunho | Calculado, sem nenhum documento |
| 2026-2031 | Residencial Mata Norte | C | Rascunho | Calculado, só com a ART anexada |
| 2026-2003 | Condomínio Parque das Águas | U | Rascunho | Calculado e completo, pronto para enviar |
| 2026-2026 | Residencial Bosque de Camaragibe | U | Rascunho | Cálculo desatualizado: um grupo mudou depois do cálculo. O memorial responde 409 |
| 2026-2027 | Edifício Mirante de Ipojuca | C | Rascunho | Cálculo desatualizado: a tensão do projeto mudou depois do cálculo |
| 2026-2028 | Mercado Pedras de Fogo | J | Rascunho | Não residencial, calculado, na Paraíba |
| 2026-2029 | Edifício Misto Conde da Boa Vista | A | Rascunho | Misto em 220/127 V, com recarga, projeto de um administrador |
| 2026-2030 | Complexo Multiuso Marco Zero | U | Rascunho | Vitrine das entradas raras: recarga individualizada e incorporada ao veículo, com gerenciamento; unidade compacta; as seis categorias de carga (ar-condicionado, aquecimento instantâneo e de acumulação, cocção, aparelhos, equipamento especial); potência em HP; lâmpada fluorescente/néon/sódio |
| 2026-2032 | Complexo Reserva do Capibaribe | C | Rascunho | Mais de 300 kVA: alerta de entrada de serviço fora das faixas |
| 2026-2033 | Residencial Bela Vista | J | Rascunho | Quatro apartamentos: vale a demanda mínima da primeira faixa |
| 2026-2034 | Residencial Janga | C | Rascunho | Ligação bifásica e entrada individual |
| 2026-2035 | Padaria Central | J | Rascunho | Ligação monofásica e entrada individual, não residencial |

### Legado

| Protocolo | Projeto | Proj. | Situação | O que demonstra |
| :--- | :--- | :--- | :--- | :--- |
| 2026-1002 | Edifício Torre Norte | U | Aguardando envio | Projeto anterior ao fluxo de envio, completo e pronto para ser enviado |

### Em Análise

| Protocolo | Projeto | Proj. | Analista | Situação | O que demonstra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-1003 | Edifício Residencial Aurora | U | Sem analista | Atrasado (40 dias) | Fila sem dono e vencida; demanda acima de 50 kVA; recarga de mais de 20 kW pede estudo de rede |
| 2026-2006 | Mix Casa Forte | U | Revisor | Atrasado (36 dias) | Misto atrasado, com analista |
| 2026-1007 | Edifício Comercial Boa Vista | U | Sem analista | Vence hoje | Prazo no último dia, sem dono |
| 2026-2005 | Empresarial Pina Office | U | Revisor | Vence hoje | Apontamentos em rascunho, ainda invisíveis ao projetista: um de cálculo ligado à etapa Dc |
| 2026-2038 | Residencial Paraíso | J | Admin | Falta 1 dia | Administrador analisando projeto que não é dele; Paraíba na fila |
| 2026-2036 | Condomínio Jardim Atlântico | C | Sem analista | Faltam 2 dias | Quase vencendo, sem dono |
| 2026-2037 | Edifício Comercial Santo Amaro | U | Ana | Faltam 3 dias | Com a segunda analista |
| 2026-2013 | Residencial Olinda Alta | C | Sem analista | No prazo | Fila sem dono, no prazo |
| 2026-2004 | Residencial Boa Viagem Prime | U | Sem analista | No prazo | Demanda acima de 50 kVA, no prazo |
| 2026-2015 | Sede Regional Administrativa | A | Revisor | No prazo | Projeto do administrador analisado por outro |
| 2026-2040 | Condomínio Pedras Norte | J | Sem analista | No prazo | Paraíba na fila |
| 2026-2043 | Edifício Comercial Centro de Pedras | J | Ana | No prazo | Paraíba com a segunda analista |
| 2026-1008 | Condomínio Jardim Recife | U | Revisor | Reanálise 2 | Reenviado com resumo das alterações; apontamentos respondidos |
| 2026-2009 | Condomínio Graças Garden | U | Revisor | Reanálise 2 | Resposta longa, um apontamento corrigido e outro contestado; grupo corrigido e novo cálculo |
| 2026-2010 | Residencial Espinheiro | U | Revisor | Reanálise 2 | Analista já aceitou uma resposta e reabriu a outra |
| 2026-2039 | Centro Médico Boa Viagem | C | Sem analista | Reanálise 2 | Reanálise sem analista. Estado só alcançável pelo seed |
| 2026-2017 | Edifício Recife Antigo | U | Revisor | Reanálise 3 | Duas reprovações anteriores; o resumo cita o ar-condicionado que o grupo das lojas agora tem |

### Reprovados

| Protocolo | Projeto | Proj. | Situação | O que demonstra |
| :--- | :--- | :--- | :--- | :--- |
| 2026-1004 | Condomínio Vila Nova | U | Reprovado hoje | Apontamentos abertos sem resposta; ligação bifásica, entrada individual; apontamento de unidades ligado ao grupo |
| 2026-1005 | Centro Empresarial Recife | U | Reprovado há 35 dias | Apontamento aberto antigo; entrada individual |
| 2026-2007 | Residencial Torre das Graças | U | Reprovado | Dois apontamentos abertos, um ligado ao grupo |
| 2026-2008 | Edifício Madalena | U | Reprovado | Respondido pela metade: o bloqueante segue aberto e impede o reenvio |
| 2026-2014 | Condomínio Pedras de Fogo | C | Reprovado | Reprovado na Paraíba |
| 2026-2020 | Residencial Parque Boa Vista | U | Reprovado | Corrigido e contestado, tudo respondido: pronto para reenviar |
| 2026-2021 | Residencial Serra Verde | C | Reprovado | Tudo contestado, aguardando o reenvio |
| 2026-2022 | Condomínio Mata Sul | J | Reprovado | Só ajustes: nada bloqueia o reenvio |
| 2026-2023 | Edifício Empresarial Paulista Center | C | Reprovado | Um apontamento em cada etapa: dados do projeto, unidades (ligado ao grupo), cálculo (ligado ao passo Dc) e documentos (ligado à ART) |
| 2026-2019 | Edifício Parnamirim | U | Reprovado duas vezes | Apontamento reaberto com a resposta anterior e um novo; resumo das alterações do segundo ciclo |
| 2026-2024 | Condomínio Solar da Torre | U | Reprovado | O projetista corrigiu a área e não recalculou: cálculo desatualizado |

### Aprovados

| Protocolo | Projeto | Proj. | Analista | O que demonstra |
| :--- | :--- | :--- | :--- | :--- |
| 2026-1006 | Comercial Praça Sul | U | Revisor | Aprovado hoje de primeira, ligação monofásica, entrada individual |
| 2026-2011 | Edifício Derby Center | U | Revisor | Aprovado de primeira, com parecer |
| 2026-2012 | Residencial Jaqueira | U | Revisor | Aprovado após correção, residencial, com recarga e gerenciamento comprovado |
| 2026-2018 | Residencial Casa Amarela | U | Ana | Aprovado após contestação aceita, residencial |
| 2026-2041 | Centro Comercial Caruaru Plaza | C | Ana | Aprovado após correção, não residencial |
| 2026-2042 | Edifício Parque das Flores | B | Revisor | Projeto antigo do projetista inativo |

---

## Tabelas Normativas

As 18 tabelas entram publicadas, digitadas pelo admin e conferidas pelo conferente. O seed acrescenta revisões, só a partir das tabelas que ele mesmo publicou, cada uma com linhas que de fato diferem:

| Tabela | Situação | Diferença |
| :--- | :--- | :--- |
| Quadro 35 | Substituída, mais antiga que a vigente | Fatores menores nas três primeiras faixas acima de 40 m² |
| Tabela 22 | Substituída, mais antiga que a vigente | Fator de lojas de 0,90 em vez de 1,00 |
| Quadro 37 | Aguardando revisão, cadastrada pelo admin | Fatores de segurança de 1,4 e 1,25 nas duas primeiras faixas |
| Tabela 2 | Aguardando revisão, cadastrada pelo conferente | Faixa 53 a 66 kVA com condutor de 50 mm² e disjuntor de 125 A. O admin pode publicá-la |

---

## Como Reiniciar

- **Banco local do zero:** `docker compose down -v` apaga o volume, e o seed repovoa tudo na próxima subida. O volume também guarda o banco de testes; recrie `ampere_test` antes do `verify`.
- **Renovar só os projetos do seed:** suba a API com `ampere.seed.reset-scenarios=true`, ou com a variável `SEED_RESET_SCENARIOS=true`. O seed apaga apenas os projetos que ele mesmo criou (protocolo, nome e dono conferem) com grupos, cálculos, documentos e apontamentos, e os recria com datas novas. Usuários, tabelas e qualquer outro projeto ficam como estão. O padrão é `false`.
- **Banco que já tinha o seed antigo:** os protocolos existentes não são refeitos. Para ter as correções e as datas novas dos projetos antigos, use a propriedade acima.
- **Produção com o profile `demo`:** o seed só cria o que falta e nunca altera um projeto que não criou.

Um projeto cujo protocolo (2026-2020, por exemplo) já pertença a outra pessoa não é recriado nem apagado: o seed o pula.
