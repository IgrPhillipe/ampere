package br.com.ampere.config;

import br.com.ampere.domain.Example;
import br.com.ampere.repository.ExampleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Popula a tabela de exemplo no primeiro boot.
 *
 * <p>Existe porque, sem Flyway, nao ha migration para carregar dado inicial — e uma API que sobe
 * com o banco vazio nao mostra nada. So roda quando a tabela esta vazia, entao reiniciar nao
 * duplica registro.
 */
@Component
@Profile("!prod")
public class DataSeeder implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

  private final ExampleRepository repository;

  public DataSeeder(ExampleRepository repository) {
    this.repository = repository;
  }

  @Override
  public void run(String... args) {
    if (repository.count() > 0) {
      return;
    }

    repository.save(new Example("Example One"));
    repository.save(new Example("Example Two"));

    log.info("DataSeeder: dois registros de exemplo inseridos.");
  }
}
