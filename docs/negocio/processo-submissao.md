# Processo de Submissão de Projeto

Como um projeto elétrico chega hoje à Neoenergia Pernambuco, é analisado e volta ao projetista.

Fase: Imersão ([`../processo.md`](../processo.md)) · A metodologia normativa do cálculo está em [`../tecnico/fontes-normativas.md`](../tecnico/fontes-normativas.md)

## O fluxo atual

| Aspecto | O que foi encontrado |
| :---------------------- | :------------------------------------------------------------------------------------------ |
| Canal para MT, grandes clientes e geração distribuída | Portal Clientes Corporativos e [portal de geração distribuída](https://gdneoenergiapernambuco.neoenergia.com/) |
| Canal para baixa tensão acima de 50 kW | E-mail `projetos.pe@neoenergia.com` |
| Formulários simplificados | Obrigatórios desde 01/02/2024 |
| Documentos exigidos | Carta de solicitação, **ART** do engenheiro, desenhos assinados e **memorial descritivo contendo o cálculo de demanda**, cálculo de proteção e queda de tensão |
| Prazo de análise | **30 dias**, suspensos se faltar informação solicitada |
| Resposta | Enviada ao e-mail cadastrado, **com os motivos da reprovação e as providências corretivas necessárias** |
| Re-submissão | Mesmo processo, após correção. Alguns projetos passam por **3 a 4 análises** até a aprovação final |
| Validade da aprovação | **36 meses** a partir da aprovação |

Fonte: [Projeto Particular](https://www.neoenergia.com/web/pernambuco/seu-negocio/projeto-particular) e [Projetistas e Prestadores de Serviço](https://www.neoenergia.com/web/pernambuco/seu-negocio/projetistas-prestadores-de-servico).

## O que a norma exige, e não só o site

Parte do que está acima também está na DIS-NOR-053 REV 06, item 6.27. Isso importa: página de site muda sem aviso e sem histórico, norma é documento versionado e citável. Onde as duas dizem a mesma coisa, a citação normativa é a que vale.

| Exigência | Item da 053 |
| :--- | :--- |
| Validade da aprovação de **36 meses** | 6.27.6 |
| Projeto **simplificado** para demanda total até 50 kVA, com ramal aéreo e centro de medição único — não isenta o documento de responsabilidade técnica, que deve trazer a demanda total | 6.27.1 e 6.27.2 |
| Acima de 50 kVA, ligação precedida de análise e liberação de projeto elétrico completo | 6.27.3 |
| Apresentação em meio eletrônico (CAD), escalas mínimas 1:50 para plantas e cortes, 1:2000 para planta de situação | 6.27.7 |
| Conteúdo obrigatório do projeto: memorial descritivo, **demanda prevista**, potência total instalada, planta de situação, planta da entrada de serviço, documento de responsabilidade técnica, projeto da proteção geral e diagramas unifilares | 6.27.7.1 |
| Termo de responsabilidade pelo sistema de aterramento, quando a demanda superar 1 MVA | 6.27.7.1 d |

O corte de 50 kVA da norma é o mesmo que o desafio do cliente descreve como simplificação já implantada, com redução de reprovações abaixo dessa faixa. É o recorte de escopo tratado na questão 3.

## O que isso define para o produto

O ciclo tem sete etapas, da contratação do projeto ao retrabalho. Cinco estão confirmadas por documento público e duas seguem como hipótese: quem contrata o projeto e como a equipe interna confere o cálculo.

O erro nasce no cálculo manual e só é descoberto na análise, até 30 dias depois. Nada entre as duas etapas verifica o cálculo. É essa a lacuna que o MVP pretende ocupar.

O ciclo completo, etapa a etapa, está no documento de apoio à reunião: [`../ciclo-projeto-eletrico.html`](../ciclo-projeto-eletrico.html).

## Em aberto

As questões 9, 13, 14, 15 e 16 de [`questões em aberto`](../produto/questoes-em-aberto.md) tratam deste processo: se existe sistema por trás dos canais, como o projetista é credenciado, em que formato os arquivos chegam, como funciona a fila de reenvio e o que acontece ao fim dos 36 meses.
