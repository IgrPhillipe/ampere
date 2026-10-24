package br.com.ampere.config;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.User;
import java.util.function.Consumer;

/**
 * One project of the demonstration. The protocol, the name and the owner identify it as the seed's
 * own, so a reset never touches a project somebody else filed under the same protocol.
 */
record Scenario(
    String protocol,
    String name,
    String address,
    String municipality,
    String postalCode,
    BuildingType building,
    User owner,
    int createdDaysAgo,
    ProjectStatus initialStatus,
    Consumer<ScenarioCase> story) {

  static Scenario of(
      String protocol,
      String name,
      String address,
      String municipality,
      String postalCode,
      BuildingType building,
      User owner,
      int createdDaysAgo,
      Consumer<ScenarioCase> story) {
    return new Scenario(
        protocol,
        name,
        address,
        municipality,
        postalCode,
        building,
        owner,
        createdDaysAgo,
        ProjectStatus.DRAFT,
        story);
  }

  /** A project that predates the submission flow and is still waiting to be sent. */
  Scenario awaitingSubmission() {
    return new Scenario(
        protocol,
        name,
        address,
        municipality,
        postalCode,
        building,
        owner,
        createdDaysAgo,
        ProjectStatus.AWAITING_SUBMISSION,
        story);
  }

  BrazilianState state() {
    return municipality.equals("Pedras de Fogo") ? BrazilianState.PB : BrazilianState.PE;
  }
}
