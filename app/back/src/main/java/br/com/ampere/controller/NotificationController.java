package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.NotificationListResponse;
import br.com.ampere.dto.NotificationResponse;
import br.com.ampere.service.AuthenticatedUser;
import br.com.ampere.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Notifications", description = "Notificações do sino do cabeçalho")
@RestController
@RequestMapping("/notifications")
public class NotificationController {

  private final NotificationService service;

  public NotificationController(NotificationService service) {
    this.service = service;
  }

  @GetMapping
  @Operation(
      operationId = "listNotifications",
      summary = "Lista as notificações mais recentes do usuário e a contagem de não lidas")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Notificações do usuário, da mais nova à mais antiga")
  })
  public ApiResponse<NotificationListResponse> list(@AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(NotificationListResponse.from(service.list(userOf(jwt))));
  }

  @PostMapping("/{id}/read")
  @Operation(operationId = "readNotification", summary = "Marca uma notificação como lida")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Notificação lida"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Notificação inexistente ou de outro usuário")
  })
  public ApiResponse<NotificationResponse> read(
      @PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(NotificationResponse.from(service.markRead(id, userOf(jwt))));
  }

  @PostMapping("/read-all")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(
      operationId = "readAllNotifications",
      summary = "Marca todas as notificações do usuário como lidas")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "204",
        description = "Notificações lidas")
  })
  public void readAll(@AuthenticationPrincipal Jwt jwt) {
    service.markAllRead(userOf(jwt));
  }

  private static AuthenticatedUser userOf(Jwt jwt) {
    return AuthenticatedUser.of(jwt.getSubject(), jwt.getClaimAsString("role"));
  }
}
