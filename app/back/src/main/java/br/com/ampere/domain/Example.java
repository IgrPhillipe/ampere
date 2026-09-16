package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entidade de exemplo. Existe para demonstrar a pilha completa — controller, service, repository,
 * domain — e deve ser apagada quando as classes de dominio do AMPERE entrarem.
 *
 * <p>Sem Lombok, que o projeto proibe: construtores e getters sao escritos a mao. O construtor sem
 * argumentos e {@code protected} porque o JPA exige um, mas ninguem mais deveria usa-lo.
 *
 * <p>O nome da tabela e das colunas sai em snake_case pela estrategia padrao do Hibernate. Nao
 * sobrescreva: e a convencao de banco, e ela ja vem de graca.
 */
@Entity
@Table(name = "example")
public class Example {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  protected Example() {}

  public Example(String name) {
    this.name = name;
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
