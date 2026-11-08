package br.com.ampere.domain;

/** Whom the loads of item 6.27 serve, as the tables of each parcel tell them apart. */
interface LoadOccupancy {

  /** Loads of one three-phase apartment, never a usage a load group can declare. */
  LoadOccupancy APARTMENT =
      new LoadOccupancy() {
        @Override
        public String lightingKey() {
          return null;
        }

        @Override
        public String outletsKey() {
          return null;
        }

        @Override
        public String airConditioningKey() {
          return "RESIDENTIAL";
        }

        @Override
        public boolean residential() {
          return true;
        }
      };

  /** Row of Tabela 22 for the lighting. */
  String lightingKey();

  /** Row of Tabela 22 for the general-use outlets. */
  String outletsKey();

  /** Column of Tabela 12. */
  String airConditioningKey();

  /** Parcel a of a residence reads Tabela 6, not Tabela 22 (item 6.27.1.1). */
  default boolean residential() {
    return false;
  }
}
