package br.com.ampere.controller;

import br.com.ampere.domain.UserRole;
import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.CreateUserRequest;
import br.com.ampere.dto.ManagedUserResponse;
import br.com.ampere.dto.PageQuery;
import br.com.ampere.dto.Pagination;
import br.com.ampere.dto.TemporaryAccessResponse;
import br.com.ampere.dto.UpdateUserRequest;
import br.com.ampere.service.AuthenticatedUser;
import br.com.ampere.service.UserAdministrationService;
import br.com.ampere.service.UserListing;
import br.com.ampere.service.UserParameters;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "User administration", description = "Gestão de usuários pelo administrador")
@RestController
@RequestMapping("/users")
public class UserAdministrationController {

  private final UserAdministrationService service;

  public UserAdministrationController(UserAdministrationService service) {
    this.service = service;
  }

  @GetMapping
  @Operation(operationId = "listUsers", summary = "Lista os usuários em ordem de nome")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Página de usuários"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Paginação ou papel inválido"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas o papel ADMIN gerencia usuários")
  })
  public ApiResponse<List<ManagedUserResponse>> list(
      @Valid @ParameterObject PageQuery pagination,
      @Parameter(description = "Termo buscado no nome ou no e-mail") @RequestParam(required = false)
          String search,
      @Parameter(description = "Papel dos usuários listados; ausente lista todos")
          @RequestParam(required = false)
          UserRole role) {
    UserListing listing = service.list(pagination.page(), pagination.pageSize(), search, role);
    List<ManagedUserResponse> items =
        listing.users().stream().map(ManagedUserResponse::from).toList();

    return ApiResponse.of(
        items, new Pagination(listing.totalElements(), pagination.page(), pagination.pageSize()));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(operationId = "createUser", summary = "Cria um usuário com senha temporária")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "201",
        description = "Usuário criado, com a senha temporária exibida uma única vez"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Dados inválidos"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas o papel ADMIN gerencia usuários"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "Já existe uma conta com este e-mail")
  })
  public ApiResponse<TemporaryAccessResponse> create(
      @Valid @RequestBody CreateUserRequest request) {
    return ApiResponse.of(
        TemporaryAccessResponse.from(service.create(request.email(), parametersOf(request))));
  }

  @PutMapping("/{id}")
  @Operation(
      operationId = "updateUser",
      summary = "Altera nome, papel e situação; desativa e reativa a conta")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Usuário atualizado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description =
            "Dados inválidos, ou o administrador desativando a própria conta ou tirando o próprio papel"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas o papel ADMIN gerencia usuários"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Usuário não encontrado")
  })
  public ApiResponse<ManagedUserResponse> update(
      @PathVariable Long id,
      @Valid @RequestBody UpdateUserRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        ManagedUserResponse.from(
            service.update(id, parametersOf(request), request.active(), userOf(jwt))));
  }

  @PostMapping("/{id}/password-reset")
  @Operation(
      operationId = "resetUserPassword",
      summary = "Gera uma senha temporária com troca obrigatória no próximo login")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Senha temporária, exibida uma única vez"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas o papel ADMIN gerencia usuários"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Usuário não encontrado")
  })
  public ApiResponse<TemporaryAccessResponse> resetPassword(@PathVariable Long id) {
    return ApiResponse.of(TemporaryAccessResponse.from(service.resetPassword(id)));
  }

  private static AuthenticatedUser userOf(Jwt jwt) {
    return AuthenticatedUser.of(jwt.getSubject(), jwt.getClaimAsString("role"));
  }

  private static UserParameters parametersOf(CreateUserRequest request) {
    return new UserParameters(request.name(), request.role());
  }

  private static UserParameters parametersOf(UpdateUserRequest request) {
    return new UserParameters(request.name(), request.role());
  }
}
