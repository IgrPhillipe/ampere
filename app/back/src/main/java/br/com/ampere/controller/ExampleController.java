package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.ExampleRequest;
import br.com.ampere.dto.ExampleResponse;
import br.com.ampere.dto.Pagination;
import br.com.ampere.service.ExampleService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Camada HTTP: recebe, valida a entrada, chama o service e embrulha a saida.
 *
 * <p><strong>Sem regra de negocio e sem SQL aqui.</strong> Se a rota esta decidindo alguma coisa
 * alem de forma de entrada e saida, a decisao pertence ao service.
 *
 * <p>O caminho nao repete {@code /api} porque isso ja vem do {@code server.servlet.context-path}.
 */
@RestController
@RequestMapping("/example")
public class ExampleController {

  private final ExampleService service;

  public ExampleController(ExampleService service) {
    this.service = service;
  }

  @GetMapping("/list")
  public ApiResponse<List<ExampleResponse>> list() {
    List<ExampleResponse> items = service.findAll().stream().map(ExampleResponse::from).toList();

    return ApiResponse.of(items, new Pagination(items.size(), 1, items.size()));
  }

  @GetMapping("/{id}")
  public ApiResponse<ExampleResponse> detail(@PathVariable Long id) {
    return ApiResponse.of(ExampleResponse.from(service.findById(id)));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<ExampleResponse> create(@Valid @RequestBody ExampleRequest request) {
    return ApiResponse.of(ExampleResponse.from(service.create(request.name())));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    service.delete(id);
  }
}
