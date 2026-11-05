package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.MunicipalityAssignmentDto;
import br.com.ampere.dto.ReviewerMunicipalityItemResponse;
import br.com.ampere.dto.UpdateReviewerMunicipalitiesRequest;
import br.com.ampere.service.AuthenticatedUser;
import br.com.ampere.service.ReviewerMunicipalityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Reviewer municipalities", description = "Gestão de municípios atribuídos aos analistas")
@RestController
@RequestMapping("/reviewers")
public class ReviewerMunicipalityController {

  private final ReviewerMunicipalityService service;

  public ReviewerMunicipalityController(ReviewerMunicipalityService service) {
    this.service = service;
  }

  @GetMapping("/municipalities")
  @Operation(
      operationId = "listReviewerMunicipalities",
      summary = "Lista todos os analistas ativos e seus municípios")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Lista de analistas com municípios"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas administradores acessam este recurso")
  })
  public ApiResponse<List<ReviewerMunicipalityItemResponse>> list(
      @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(service.listReviewersWithMunicipalities(userOf(jwt)));
  }

  @PutMapping("/{id}/municipalities")
  @Operation(
      operationId = "updateReviewerMunicipalities",
      summary = "Substitui a lista de municípios do analista")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Municípios atualizados"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Município fora da área de concessão"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas administradores acessam este recurso"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Analista inexistente ou com papel user"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "Município já pertence a outro analista"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "422",
        description = "Analista inativo")
  })
  public ApiResponse<List<MunicipalityAssignmentDto>> update(
      @PathVariable Long id,
      @Valid @RequestBody UpdateReviewerMunicipalitiesRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(service.updateMunicipalities(id, request.municipalities(), userOf(jwt)));
  }

  private static AuthenticatedUser userOf(Jwt jwt) {
    return AuthenticatedUser.of(jwt.getSubject(), jwt.getClaimAsString("role"));
  }
}
