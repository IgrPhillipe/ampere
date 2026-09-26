package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** The published tables, looked up by code. */
public final class NormativeTableSet implements NormativeTables {

  private final Map<NormativeTableCode, NormativeTable> tables =
      new EnumMap<>(NormativeTableCode.class);

  public NormativeTableSet(List<NormativeTable> published) {
    published.stream()
        .filter(NormativeTable::isPublished)
        .forEach(table -> tables.putIfAbsent(table.getCode(), table));
  }

  @Override
  public Optional<NormativeValue> lookup(NormativeTableCode code, String key, BigDecimal argument) {
    NormativeTable table = published(code);
    return table.find(key, argument).map(row -> new NormativeValue(row, table.reference()));
  }

  @Override
  public NormativeValue find(NormativeTableCode code, String key, BigDecimal argument) {
    return lookup(code, key, argument)
        .orElseThrow(() -> missingRow(published(code), key, argument));
  }

  private NormativeTable published(NormativeTableCode code) {
    NormativeTable table = tables.get(code);
    if (table == null) {
      throw new MissingNormativeValueException(
          article(code)
              + " "
              + code.identification()
              + " da "
              + code.standard().code()
              + " não está publicad"
              + (isFeminine(code) ? "a" : "o")
              + ". Cadastre e publique a tabela em Normas e Tabelas.");
    }
    return table;
  }

  private static MissingNormativeValueException missingRow(
      NormativeTable table, String key, BigDecimal argument) {
    NormativeTableCode code = table.getCode();
    String what =
        argument == null
            ? "a chave " + key
            : DeclaredValues.decimal(argument) + " (" + code.argumentLabel() + ")";
    return new MissingNormativeValueException(
        article(code)
            + " "
            + table.reference().citation()
            + " não tem linha para "
            + what
            + ". Confira os dados do projeto ou a tabela em Normas e Tabelas.");
  }

  private static String article(NormativeTableCode code) {
    return isFeminine(code) ? "A" : "O";
  }

  private static boolean isFeminine(NormativeTableCode code) {
    return code.identification().startsWith("Tabela");
  }
}
