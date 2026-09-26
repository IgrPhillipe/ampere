package br.com.ampere.domain;

/** Each constant builds its own subclass. */
public enum GroupKind {
  RESIDENTIAL {
    @Override
    public ConsumerUnitGroup create(Project project, GroupSpec spec) {
      return new ResidentialGroup(project, spec);
    }
  },
  LOAD {
    @Override
    public ConsumerUnitGroup create(Project project, GroupSpec spec) {
      return new LoadGroup(project, spec);
    }
  },
  EV_CHARGING {
    @Override
    public ConsumerUnitGroup create(Project project, GroupSpec spec) {
      return new EvChargingGroup(project, spec);
    }
  };

  public abstract ConsumerUnitGroup create(Project project, GroupSpec spec);
}
