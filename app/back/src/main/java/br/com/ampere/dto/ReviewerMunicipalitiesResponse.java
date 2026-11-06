package br.com.ampere.dto;

import br.com.ampere.service.ReviewerMunicipalities;
import java.util.List;

public record ReviewerMunicipalitiesResponse(
    UserOptionResponse reviewer, List<MunicipalityResponse> municipalities) {

  public static ReviewerMunicipalitiesResponse from(ReviewerMunicipalities item) {
    return new ReviewerMunicipalitiesResponse(
        UserOptionResponse.from(item.reviewer()),
        item.municipalities().stream().map(MunicipalityResponse::from).toList());
  }
}
