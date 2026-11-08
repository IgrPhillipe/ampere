package br.com.ampere.domain;

import java.util.Optional;

/** Each constant builds its own subclass. */
public enum GroupKind {
  RESIDENTIAL("Apartamento") {
    @Override
    public ConsumerUnitGroup create(Project project, GroupSpec spec) {
      return new ResidentialGroup(project, spec);
    }

    @Override
    public Optional<String> rejection(GroupSpec spec) {
      return ResidentialGroup.rejection(spec);
    }
  },
  LOAD("Carga instalada") {
    @Override
    public ConsumerUnitGroup create(Project project, GroupSpec spec) {
      return new LoadGroup(project, spec);
    }
  },
  EV_CHARGING("Recarga de veículo elétrico") {
    @Override
    public ConsumerUnitGroup create(Project project, GroupSpec spec) {
      return new EvChargingGroup(project, spec);
    }
  };

  private final String label;

  GroupKind(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }

  public abstract ConsumerUnitGroup create(Project project, GroupSpec spec);

  /** Why the spec is refused outright; missing data is reported by the group instead. */
  public Optional<String> rejection(GroupSpec spec) {
    return Optional.empty();
  }
}
