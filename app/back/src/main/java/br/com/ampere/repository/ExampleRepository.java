package br.com.ampere.repository;

import br.com.ampere.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acesso ao banco. O Spring Data implementa a interface em tempo de execucao, entao aqui so se
 * declara o que se precisa alem do CRUD que o {@link JpaRepository} ja da.
 */
public interface ExampleRepository extends JpaRepository<Example, Long> {}
