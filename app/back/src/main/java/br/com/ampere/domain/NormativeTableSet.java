package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** The published tables, or those a submitted protocol fixed, looked up by code. */
public final class NormativeTableSet implements NormativeTables {

  private final Map<NormativeTableCode, NormativeTable> tables =
      new EnumMap<>(NormativeTableCode.class);

  public NormativeTableSet(List<NormativeTable> published) {
    this(published, null);
  }

  /** {@code fixed} null takes the published tables. */
  public NormativeTableSet(List<NormativeTable> candidates, FixedRevisions fixed) {
    candidates.stream()
        .filter(table -> fixed == null ? table.isPublished() : fixed.selects(table))
        .forEach(table -> tables.putIfAbsent(table.getCode(), table));
  }

  public Optional<Long> idOf(NormativeTableCode code) {
    return Optional.ofNullable(tables.get(code)).map(NormativeTable::getId);
  }

  @Override
  public boolean contains(NormativeTableCode code) {
    return tables.containsKey(code);
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

  @Override
  public Optional<String> revisionOf(StandardName standard) {
    return tables.values().stream()
        .filter(table -> table.getCode().standard() == standard)
        .map(table -> table.reference().revision())
        .findFirst();
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
              + ". Cadastre e publique a tabela em Tabelas Normativas.");
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
            + ". Confira os dados do projeto ou a tabela em Tabelas Normativas.");
  }

  private static String article(NormativeTableCode code) {
    return isFeminine(code) ? "A" : "O";
  }

  private static boolean isFeminine(NormativeTableCode code) {
    return code.identification().startsWith("Tabela");
  }
}
