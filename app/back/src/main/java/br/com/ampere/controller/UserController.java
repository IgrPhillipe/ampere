package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.ChangePasswordRequest;
import br.com.ampere.dto.ProfileRequest;
import br.com.ampere.dto.ProfileResponse;
import br.com.ampere.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
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
  public ApiResponse<ProfileResponse> profile(@AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(service.profile(jwt.getSubject()));
  }

  @PutMapping
  @Operation(operationId = "updateProfile", summary = "Atualiza os dados profissionais")
  public ApiResponse<ProfileResponse> update(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ProfileRequest request) {
    return ApiResponse.of(service.updateProfile(jwt.getSubject(), request));
  }

  @PutMapping("/password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(operationId = "changePassword", summary = "Troca a senha informando a atual")
  public void changePassword(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ChangePasswordRequest request) {
    service.changePassword(jwt.getSubject(), request);
  }
}
