package br.com.ampere.service;

import br.com.ampere.domain.ConcessionArea;
import br.com.ampere.error.BusinessException;

final class ProjectPlaces {

  private ProjectPlaces() {}

  /** The municipality to store, checked against the concession area and the CEP. */
  static String municipalityOf(ProjectParameters parameters) {
    String municipality =
        ConcessionArea.municipalityOf(parameters.state(), parameters.municipality())
            .orElseThrow(() -> new BusinessException(ConcessionArea.OUTSIDE_MESSAGE));
    if (!ConcessionArea.coversPostalCode(parameters.state(), parameters.postalCode())) {
      throw new BusinessException(ConcessionArea.POSTAL_CODE_MESSAGE);
    }
    return municipality;
  }
}
