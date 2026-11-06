package br.com.ampere.dto;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.service.MunicipalityPlace;

public record MunicipalityResponse(BrazilianState state, String municipality) {

  public static MunicipalityResponse from(MunicipalityPlace place) {
    return new MunicipalityResponse(place.state(), place.municipality());
  }
}
