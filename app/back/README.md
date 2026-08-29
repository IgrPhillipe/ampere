# Back-end

> API + motor de cálculo de demanda elétrica em Java com Spring Boot.

**Stack: Java, Spring Boot, PostgreSQL**

---

## Propósito

- Expor endpoints HTTP para receber parâmetros de projetos elétricos e retornar o cálculo de demanda
- Encapsular as regras normativas da Neoenergia Pernambuco em classes de domínio
- Garantir rastreabilidade: cada resultado deve indicar quais regras foram aplicadas

---

## Requisitos técnicos (disciplina POO)

- Mínimo **3 classes de domínio** (entidades persistidas no banco)
- Todas as histórias devem **LER e/ou ESCREVER** no banco de dados
- Princípios OOP aplicados: encapsulamento, herança, polimorfismo
- Geração automática de boilerplate (ex.: Lombok) **não é permitida**

---

## Como executar

Sem código no repositório até a **Entrega 02** (21/09/2026). Os comandos entram aqui junto com o primeiro commit da aplicação.

---

## Variáveis de ambiente

| Variável       | Obrigatória | Descrição           |
| :------------- | :---------- | :------------------ |
| `DATABASE_URL` | Sim         | Conexão com o PostgreSQL |

---

## Estrutura de camadas (referência)

```
src/
├── controller/   → HTTP: validação de entrada, chama services
├── service/      → regras de negócio e orquestração
├── domain/       → classes de domínio (entidades persistidas)
└── repository/   → acesso ao banco (Spring Data ou JDBC)
```

Documentação técnica: [`docs/tecnico/README.md`](../../docs/tecnico/README.md)  
README central do projeto: [`README.md`](../../README.md)
