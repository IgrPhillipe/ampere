package br.com.ampere.dto;

/** The CREA number and its state, each typed in its own field. Empty passes: required is apart. */
final class Crea {

  static final String NUMBER = "([0-9]{4,12}[A-Za-z]?)?";
  static final String NUMBER_MESSAGE = "Informe só o número do CREA, sem a UF.";
  static final String STATE = "([A-Za-z]{2})?";
  static final String STATE_MESSAGE = "Informe a UF com duas letras.";

  private Crea() {}
}
