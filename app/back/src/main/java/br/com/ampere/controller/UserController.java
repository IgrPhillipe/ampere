package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.ChangePasswordRequest;
import br.com.ampere.dto.ProfileRequest;
import br.com.ampere.dto.ProfileResponse;
import br.com.ampere.service.AuthenticatedUser;
import br.com.ampere.service.ProfileParameters;
import br.com.ampere.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Users", description = "Perfil do usuário autenticado")
@RestController
@RequestMapping("/users/me")
public class UserController {

  private final UserService service;

  public UserController(UserService service) {
    this.service = service;
  }

  @GetMapping
  @Operation(operationId = "getProfile", summary = "Perfil do usuário da sessão")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Perfil com os dados profissionais"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "Sessão ausente ou inválida")
  })
  public ApiResponse<ProfileResponse> profile(@AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(ProfileResponse.from(service.profile(userOf(jwt))));
  }

  @PutMapping
  @Operation(operationId = "updateProfile", summary = "Atualiza o nome e os dados profissionais")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Perfil atualizado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Dados inválidos, ou projetista sem CREA"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "Sessão ausente ou inválida")
  })
  public ApiResponse<ProfileResponse> update(
      @Valid @RequestBody ProfileRequest request, @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        ProfileResponse.from(service.updateProfile(parametersOf(request), userOf(jwt))));
  }

  @PutMapping("/password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(operationId = "changePassword", summary = "Troca a senha informando a atual")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "204",
        description = "Senha trocada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Nova senha fora da política"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "Sessão ausente ou inválida"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "422",
        description = "Senha atual incorreta")
  })
  public void changePassword(
      @Valid @RequestBody ChangePasswordRequest request, @AuthenticationPrincipal Jwt jwt) {
    service.changePassword(request.currentPassword(), request.newPassword(), userOf(jwt));
  }

  private static ProfileParameters parametersOf(ProfileRequest request) {
    return new ProfileParameters(
        request.name(), request.crea(), request.creaState(), request.company(), request.phone());
  }

  private static AuthenticatedUser userOf(Jwt jwt) {
    return AuthenticatedUser.of(jwt.getSubject(), jwt.getClaimAsString("role"));
  }
}
