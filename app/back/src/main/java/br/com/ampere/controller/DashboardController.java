package br.com.ampere.controller;

import br.com.ampere.domain.DashboardPeriod;
import br.com.ampere.dto.AdminDashboardResponse;
import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.DesignerDashboardResponse;
import br.com.ampere.service.AdminDashboardService;
import br.com.ampere.service.AuthenticatedUser;
import br.com.ampere.service.DesignerDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Dashboard", description = "Painéis iniciais de cada papel")
@RestController
@RequestMapping("/dashboard")
public class DashboardController {

  private final DesignerDashboardService designerService;
  private final AdminDashboardService adminService;

  public DashboardController(
      DesignerDashboardService designerService, AdminDashboardService adminService) {
    this.designerService = designerService;
    this.adminService = adminService;
  }

  @GetMapping("/admin")
  @Operation(
      operationId = "getAdminDashboard",
      summary = "Painel do administrador: estado dos usuários, dos projetos ativos e da fila")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Painel do administrador"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas o administrador acessa o painel")
  })
  public ApiResponse<AdminDashboardResponse> admin(@AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        adminService.dashboard(
            AuthenticatedUser.of(jwt.getSubject(), jwt.getClaimAsString("role"))));
  }

  @GetMapping("/designer")
  @Operation(
      operationId = "getDesignerDashboard",
      summary = "Painel do projetista: o que exige ação, projetos em análise e indicadores")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Painel do projetista"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Período inválido"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas o projetista acessa o painel")
  })
  public ApiResponse<DesignerDashboardResponse> designer(
      @Parameter(description = "Período dos indicadores e do ranking de apontamentos")
          @RequestParam(defaultValue = "LAST_30_DAYS")
          DashboardPeriod period,
      @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        DesignerDashboardResponse.from(
            designerService.dashboard(
                period, AuthenticatedUser.of(jwt.getSubject(), jwt.getClaimAsString("role")))));
  }
}
