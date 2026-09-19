package br.com.ampere.service;

import br.com.ampere.domain.Example;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.ExampleRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Regra de negocio e orquestracao.
 *
 * <p>Esta camada nao conhece HTTP: sem {@code HttpServletRequest}, sem status, sem anotacao de
 * rota. Ela lanca excecao de dominio e quem traduz para resposta e o {@code
 * GlobalExceptionHandler}.
 */
@Service
public class ExampleService {

  private static final String NOT_FOUND_MESSAGE = "Registro não encontrado.";

  private final ExampleRepository repository;

  public ExampleService(ExampleRepository repository) {
    this.repository = repository;
  }

  @Transactional(readOnly = true)
  public List<Example> findAll() {
    return repository.findAll();
  }

  @Transactional(readOnly = true)
  public Example findById(Long id) {
    return repository.findById(id).orElseThrow(() -> new NotFoundException(NOT_FOUND_MESSAGE));
  }

  @Transactional
  public Example create(String name) {
    return repository.save(new Example(name));
  }

  @Transactional
  public void delete(Long id) {
    if (!repository.existsById(id)) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }

    repository.deleteById(id);
  }
}
