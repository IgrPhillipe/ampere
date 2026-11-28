# Assinatura e Verificação dos Documentos Oficiais

O AMPERE emite dois documentos oficiais: o memorial de cálculo em PDF (no envio e na aprovação com ressalvas) e a planilha de cálculo em XLSX. Cada arquivo emitido entra no registro `issued_document`, e a página pública `/verificar-autenticidade` confere o arquivo ou o código impresso nele.

Os PDFs enviados pelo projetista (ART, diagrama, planta) e os CSVs de lista e fila não são documentos oficiais e ficam fora.

## Registro

`IssuedDocument` guarda, para cada arquivo entregue:

| Campo | Conteúdo |
| :--- | :--- |
| `type` | `SUBMISSION_MEMORIAL`, `APPROVAL_MEMORIAL` ou `CALCULATION_SPREADSHEET` |
| `project`, `version` | Projeto e versão. A planilha de um cálculo ainda não enviado fica sem versão |
| `sha256` | SHA-256 dos bytes exatos servidos; único |
| `verificationCode` | `XXXX-XXXX-XXXX-XXXX`, impresso no documento; único |
| `issuedAt`, `issuedBy` | Data da emissão e quem emitiu: o projetista no envio, o analista na aprovação, quem baixou a planilha |
| `signerCertificateSha256` | SHA-256 do certificado que assinou o PDF; nulo na planilha |

- O registro é imutável: o `ProjectVersionGuard` recusa `UPDATE` e `DELETE` na tabela, como nas de versão. As linhas saem com o projeto (`ON DELETE CASCADE`), o que só acontece com rascunho excluído ou no reset do seed.
- Os memoriais emitidos antes do registro continuam verificáveis: sem linha em `issued_document`, a verificação procura o hash e o código em `project_version` e `approval_memorial`. O schema segue com `ddl-auto=update`, sem migração.

## Memorial em PDF

1. Renderiza sem código e tira o código do SHA-256 dessa renderização.
2. Renderiza de novo com o código no rodapé e o QR code.
3. Assina o resultado e grava o SHA-256 do PDF assinado, em `ProjectVersion` (ou `ApprovalMemorial`) e no registro.

- **Assinatura.** PAdES baseline B (`/SubFilter /ETSI.CAdES.detached`), invisível, com o atributo `signing-certificate-v2` e a data em `/M`. O CMS é gerado pelo BouncyCastle sobre o `PdfStamper` do OpenPDF (`PdfSigner`).
- **Certificado.** O certificado do AMPERE é autoassinado, sem cadeia de uma AC da ICP-Brasil. O Adobe Reader mostra o documento como assinado por "AMPERE" e íntegro, mas com a identidade "desconhecida" até alguém confiar no certificado. A garantia de origem vem da verificação no portal, não do leitor de PDF.
- **Rodapé.** Protocolo, versão, data, código de verificação e um QR code com `<FRONT_URL>/verificar-autenticidade?codigo=<código>`. O QR também é um link clicável no PDF.

## Planilha XLSX

Cada download gera uma cópia nova, com código aleatório e linha própria no registro. A aba "Autenticidade" traz protocolo, versão, data e autor da emissão, código e link de verificação; o rodapé de impressão de todas as abas repete protocolo, versão e código.

A planilha não tem assinatura criptográfica: a garantia é o hash registrado. Salvar de novo no Excel muda os bytes, e a verificação pelo arquivo falha.

## Verificação

`GET /api/memorial-verifications/{code}` e `POST /api/memorial-verifications` (multipart, campo `file`) são públicos, com limite de 20 envios por minuto por endereço no `POST`.

| Entrada | Confere |
| :--- | :--- |
| Código | Existe no registro (ou numa versão antiga). Confirma o documento, não o arquivo em mãos |
| XLSX | O SHA-256 está no registro |
| PDF | O SHA-256 está no registro **e** a assinatura está íntegra, cobre o arquivo inteiro e foi feita com um certificado do AMPERE. Memorial antigo, sem assinatura, passa só pelo hash |

A assinatura é lida dos bytes crus: o `/ByteRange` precisa começar em 0, terminar no fim do arquivo e deixar de fora exatamente a string `/Contents`. Nenhum parser de PDF roda e nenhum stream é descomprimido, então um arquivo hostil (uma bomba de compressão, por exemplo) custa no máximo o próprio tamanho. Uma assinatura guardada dentro de um stream comprimido aparece como ausente.

O campo `signature` da resposta, só no PDF enviado:

| Valor | Quando |
| :--- | :--- |
| `VALID` | Íntegra e feita pelo AMPERE: o certificado atual ou um que já assinou um documento registrado, para valer depois de uma troca de chave |
| `INVALID` | Bytes alterados depois da assinatura, atualização incremental acrescentada ou assinatura ilegível |
| `UNTRUSTED` | Íntegra, mas feita com outro certificado |
| `ABSENT` | Sem assinatura |

A resposta traz também `documentType` e `issuedAt`. Sem correspondência, `verified` é falso e só `signature` vem preenchido.

## Chave e Configuração

| Variável | Conteúdo |
| :--- | :--- |
| `SIGNING_KEYSTORE` | PKCS12 com a chave e o certificado do AMPERE, em base64. Obrigatória no profile `prod` |
| `SIGNING_KEYSTORE_PASSWORD` | Senha do PKCS12 |
| `FRONT_URL` | Origem do front, base do link e do QR code. Obrigatória no profile `prod`, em `https` e fora de `localhost`: o link fica para sempre dentro do PDF assinado |

Fora de `prod`, sem `FRONT_URL`, os links apontam para `http://localhost:5173`; sem `SIGNING_KEYSTORE`, a API gera um certificado efêmero (`CN=AMPERE (desenvolvimento)`) a cada subida e registra um aviso no log. Os testes usam esse caminho. Nenhuma chave real fica no repositório.

Gerar o PKCS12 de produção (validade de 5 anos):

```bash
openssl req -x509 -newkey rsa:3072 -sha256 -days 1825 -nodes -keyout ampere.key -out ampere.crt -subj "/CN=AMPERE/O=AMPERE/C=BR" -addext "keyUsage=critical,digitalSignature,nonRepudiation"
```

```bash
openssl pkcs12 -export -inkey ampere.key -in ampere.crt -name ampere -out ampere.p12
```

```bash
base64 -i ampere.p12 | tr -d '\n'
```

O resultado do último comando vai em `SIGNING_KEYSTORE`. Guarde `ampere.p12` e a senha fora do repositório e apague `ampere.key`.

Trocar a chave não invalida o que já foi emitido: o certificado antigo continua aceito porque está gravado nos documentos que assinou.
