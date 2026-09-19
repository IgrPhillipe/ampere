# Caso 0010 — Citação de item normativo que não existe na norma citada

Data: 09/09/2026 · Fase: Ideação · Tipo: resposta incorreta

## Atividade

Redação da especificação de entradas e saídas do motor de cálculo, derivada da DIS-NOR-053 e da DIS-NOR-030.

## O que a IA fez

Atribuiu à **DIS-NOR-053** um bloco inteiro de itens que pertencem à **DIS-NOR-030**:

| Regra | Citada como | Onde está de fato |
| :--- | :--- | :--- |
| Potência de placa da estação de recarga e a nota dos 3,3 kW | 053 · 6.26.4.1 | **030** · 6.26.4.1 |
| Equipamentos especiais | 053 · 6.26.3.2 | **030** · 6.26.3.2 |
| REN nº 1.000/2021, arts. 554 e 555 | 053 · 6.26.4.3 e 6.26.4.4 | **030** · 6.26.4.3 e 6.26.4.4 |
| Fator de simultaneidade por quantidade de carregadores | 053 · 6.26.4.2 | 053 · 6.26.1, Quadro 33 |
| Fator de coincidência fixo de 90% para Smart/Studio | 053 · 6.22.1 | 053 · 6.25.1 |

Na DIS-NOR-053 REV 06 **não existe item 6.26.4.1**: a seção 6.26 termina em 6.26.4, que trata de QDM adicional na garagem. A busca por "3,3 kW" no PDF inteiro da 053 não retorna nada.

Numa segunda versão do mesmo documento, a regra dos 3,3 kW apareceu ainda mais errada: como valor padrão para qualquer estação sem potência declarada. A norma restringe a nota a estação **incorporada ao veículo** cuja potência não seja informada.

## Resultado

Limitação. As duas normas têm numeração de itens quase paralela — existe 6.26.3.2, 6.26.4.1 e 6.27 nas duas, tratando de assuntos diferentes. O erro é invisível para quem lê o documento: a citação tem a forma certa, o conteúdo da regra está certo, e só a norma está trocada. Sobreviveu a duas revisões humanas.

Dois fatores ajudaram o erro a passar. O primeiro é que a extração de texto do PDF perde os índices das fórmulas — `Ded = Drf + Ds + Dc + Dve` sai como `𝐷 =𝐷 +𝐷 +𝐷 + 𝐷` —, então parte do conteúdo foi reconstruída por inferência a partir do texto ao redor, e não lida diretamente. O segundo é que ninguém tinha aberto os PDFs para conferir: as citações eram repassadas de documento para documento.

O efeito prático seria concreto. Memorial descritivo com referência normativa errada é exatamente o tipo de inconsistência que gera reprovação — o problema que o produto existe para eliminar.

## Evidência

Verificação item a item feita em 09/09/2026 contra os PDFs da DIS-NOR-053 REV 06 e da DIS-NOR-030 REV 07, com hashes registrados em [`../tecnico/fontes-normativas.md`](../tecnico/fontes-normativas.md). A correspondência correta está na tabela de itens de recarga veicular do mesmo documento.

## Aprendizado

Citação normativa não se copia entre documentos, se confere na fonte. O documento de fontes normativas passou a exigir, para todo valor que entra no motor: item, tabela e página impressa no rodapé da norma; conferência de a qual das duas normas o item pertence; dupla leitura de todo número; e, como portão final, os cinco exemplos resolvidos do Anexo I precisam continuar fechando.

A regra geral: quando a IA produz algo que tem a forma exata de uma referência verificável, é porque é verificável. Conferir custa minutos e o erro é invisível de outra forma.
