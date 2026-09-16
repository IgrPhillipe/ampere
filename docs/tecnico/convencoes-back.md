# Convenções do back-end

Padrões de código do `app/back`. A tabela de nomenclatura vale para o repositório inteiro e está no [`CONTRIBUTING.md`](../../CONTRIBUTING.md); aqui está o que é específico de Java e Spring Boot.

**Stack:** Java 21 · Spring Boot 4.1 · Spring Data JPA · PostgreSQL 16 · Maven · springdoc · Spotless

---

## Nomenclatura

| O quê | Convenção | Exemplo |
| :--- | :--- | :--- |
| Classes, interfaces e enums | PascalCase | `ExampleService` |
| Métodos e variáveis | camelCase | `findById`, `pageSize` |
| Constantes | UPPER_SNAKE_CASE | `NOT_FOUND_MESSAGE` |
| Pacotes | minúsculo, sem separador | `br.com.ampere.controller` |
| Arquivos | nome da classe pública | `ExampleService.java` |
| Tabelas e colunas | snake_case | `example`, `page_size` |

`snake_case` **não é convenção de Java** em nenhuma parte do código. A regra antiga vinha do projeto do semestre passado, que era Python.

A exceção é o banco, e ela sai de graça: o Hibernate converte `pageSize` em `page_size` pela estratégia de nomenclatura padrão. **Não anote `@Column(name = "...")` só para repetir o que ele já faz.**

Identificadores e comentários em **inglês**; mensagem que chega na tela do usuário em **português**.

---

## Estrutura de pacotes

```
br.com.ampere/
├── controller/   HTTP: recebe, valida a entrada, chama o service, embrulha a saída
├── service/      regra de negócio e orquestração
├── domain/       entidades persistidas
├── repository/   acesso ao banco
├── dto/          entrada e saída da API
├── error/        exceções de domínio e o tradutor para HTTP
└── config/       configuração e bootstrap
```

As quatro primeiras são as que o [`app/back/README.md`](../../app/back/README.md) prescreve. `dto/`, `error/` e `config/` existem porque são inevitáveis, não porque alguém quis mais uma camada.

## O que cada camada pode importar

| Camada | Pode | Não pode |
| :--- | :--- | :--- |
| `controller` | `service`, `dto` | `repository`, SQL, regra de negócio |
| `service` | `repository`, `domain`, `error` | qualquer coisa de HTTP |
| `repository` | `domain` | `service`, `controller` |
| `domain` | nada do projeto | todas as outras |

A regra prática: **se o service importa alguma coisa de `org.springframework.web`, algo está no lugar errado.** Ele lança exceção de domínio; quem decide status HTTP é o `GlobalExceptionHandler`.

E o contrário também vale: se o controller está decidindo qualquer coisa além de forma de entrada e saída, a decisão pertence ao service. É o que o [`docs/tecnico/README.md`](README.md) chama de rota fina.

---

## Lombok é proibido

O [`app/back/README.md`](../../app/back/README.md) veda geração automática de boilerplate. Sem `@Data`, `@Getter`, `@Builder`.

O que usar no lugar:

- **DTOs são `record`.** Não é geração automática no sentido do Lombok — é sintaxe da linguagem, e o construtor, os getters e o `equals` vêm do próprio Java.

  ```java
  public record ExampleResponse(String id, String name) { }
  ```

- **Entidades são classes normais**, com construtor e getter escritos à mão. O construtor sem argumentos é `protected`: o JPA exige um, e ninguém mais deveria usá-lo.

  ```java
  protected Example() {}

  public Example(String name) {
    this.name = name;
  }
  ```

- **Injeção por construtor**, nunca `@Autowired` em campo. Deixa a dependência explícita e o campo `final`.

---

## Contrato da API

### Envelope

Toda resposta de **sucesso** é embrulhada em `ApiResponse<T>`; **erro nunca é**.

```java
return ApiResponse.of(items, new Pagination(items.size(), 1, items.size()));
```

O `pagination` é omitido quando nulo. Os nomes dos campos espelham o tipo do front e precisam bater exatamente.

### `id` sai como String

O schema do front declara `id: z.string()` e rejeita número. A entidade usa `Long`; **o DTO de resposta converte**.

### Erro em `ProblemDetail`

O `GlobalExceptionHandler` traduz exceção em resposta RFC 7807. Duas exceções de domínio cobrem quase tudo:

```java
throw new NotFoundException("Projeto não encontrado.");          // 404
throw new BusinessException("Já existe um projeto com esse nome.", HttpStatus.CONFLICT);
```

A mensagem é **texto de tela em português**. O front descarta qualquer mensagem com nome de pacote Java ou stack trace e cai num texto genérico — então detalhe técnico não chega ao usuário, e também não ajuda ninguém.

### Validação

Anote o `record` de entrada e use `@Valid` no controller. As mensagens viram `errors: [{ field, defaultMessage }]` na resposta, e o front monta `"campo: mensagem"` a partir delas.

```java
public record ExampleRequest(
    @NotBlank(message = "O nome é obrigatório.") String name) {}
```

---

## Formatação

**Spotless** com `google-java-format` é o formatador único — o equivalente do Biome no front, e existe pela mesma razão: o projeto do semestre passado não tinha formatador e o estilo divergiu dentro do próprio repositório.

```bash
./mvnw spotless:apply    # formata
./mvnw spotless:check    # falha se algo estiver fora do padrão
```

Rode `spotless:apply` antes de abrir PR. Indentação de 2 espaços e 100 colunas são decisão do google-java-format, não preferência — não discuta com a ferramenta.
