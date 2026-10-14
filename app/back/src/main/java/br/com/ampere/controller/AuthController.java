package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.AuthUserResponse;
import br.com.ampere.dto.LoginRequest;
import br.com.ampere.dto.LoginResponse;
import br.com.ampere.dto.RegisterRequest;
import br.com.ampere.service.AuthService;
import br.com.ampere.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Auth", description = "Entrada no sistema")
@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AuthService service;
  private final UserService userService;

  public AuthController(AuthService service, UserService userService) {
    this.service = service;
    this.userService = userService;
  }

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(operationId = "register", summary = "Cria a conta de um projetista e já entra")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "201",
        description = "Conta criada, com token e usuário"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "Já existe uma conta com este e-mail")
  })
  public ApiResponse<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
    return ApiResponse.of(userService.register(request));
  }

  @PostMapping("/login")
  @Operation(operationId = "login", summary = "Troca e-mail e senha por um token")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Token e usuário"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "E-mail ou senha inválidos")
  })
  public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    return ApiResponse.of(service.login(request));
  }

  @GetMapping("/me")
  @Operation(operationId = "me", summary = "Usuário da sessão atual")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Usuário autenticado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "Token ausente, expirado ou inválido")
  })
  public ApiResponse<AuthUserResponse> me(@AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(service.currentUser(jwt.getSubject()));
  }
}
