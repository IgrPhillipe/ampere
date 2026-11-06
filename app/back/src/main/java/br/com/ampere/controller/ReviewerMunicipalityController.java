package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.MunicipalityRequest;
import br.com.ampere.dto.MunicipalityResponse;
import br.com.ampere.dto.ReviewerMunicipalitiesResponse;
import br.com.ampere.dto.UpdateReviewerMunicipalitiesRequest;
import br.com.ampere.service.AuthenticatedUser;
import br.com.ampere.service.MunicipalityPlace;
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

@Tag(
    name = "Reviewer municipalities",
    description = "Gestão de municípios atribuídos aos analistas")
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
  public ApiResponse<List<ReviewerMunicipalitiesResponse>> list(@AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        service.list(userOf(jwt)).stream().map(ReviewerMunicipalitiesResponse::from).toList());
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
        description = "Município já pertence a outro analista ativo"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "422",
        description = "Analista inativo")
  })
  public ApiResponse<List<MunicipalityResponse>> update(
      @PathVariable Long id,
      @Valid @RequestBody UpdateReviewerMunicipalitiesRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    List<MunicipalityPlace> places =
        service.replace(
            id,
            request.municipalities().stream().map(ReviewerMunicipalityController::placeOf).toList(),
            userOf(jwt));

    return ApiResponse.of(places.stream().map(MunicipalityResponse::from).toList());
  }

  private static MunicipalityPlace placeOf(MunicipalityRequest request) {
    return new MunicipalityPlace(request.state(), request.municipality());
  }

  private static AuthenticatedUser userOf(Jwt jwt) {
    return AuthenticatedUser.of(jwt.getSubject(), jwt.getClaimAsString("role"));
  }
}
