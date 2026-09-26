package br.com.ampere.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

/**
 * A parametric table of a standard revision, typed in by hand from the printed page. A revision
 * only leaves draft when someone other than who typed it verifies it, and is never edited after.
 */
@Entity
@Table(name = "normative_table")
public class NormativeTable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(nullable = false)
  private Standard standard;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private NormativeTableCode code;

  @Column(nullable = false)
  private String identification;

  @Column(nullable = false)
  private String item;

  @Column(nullable = false)
  private String page;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private NormativeTableStatus status;

  @Column(nullable = false)
  private String registeredBy;

  @Column(nullable = false)
  private OffsetDateTime registeredAt;

  private String verifiedBy;

  private OffsetDateTime verifiedAt;

  // Eager: the admin screen maps the rows after the transaction, with open-in-view off.
  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "normative_table_row", joinColumns = @JoinColumn(name = "table_id"))
  @OrderColumn(name = "position")
  private List<NormativeTableRow> rows = new ArrayList<>();

  protected NormativeTable() {}

  public NormativeTable(
      Standard standard,
      NormativeTableCode code,
      String identification,
      String item,
      String page,
      List<NormativeTableRow> rows,
      String registeredBy) {
    this.standard = Objects.requireNonNull(standard, "standard");
    this.code = Objects.requireNonNull(code, "code");
    this.status = NormativeTableStatus.DRAFT;
    this.registeredBy = Objects.requireNonNull(registeredBy, "registeredBy");
    this.registeredAt = OffsetDateTime.now(ZoneOffset.UTC);
    describe(identification, item, page, rows);
  }

  public Long getId() {
    return id;
  }

  public Standard getStandard() {
    return standard;
  }

  public NormativeTableCode getCode() {
    return code;
  }

  public String getIdentification() {
    return identification;
  }

  public String getItem() {
    return item;
  }

  public String getPage() {
    return page;
  }

  public NormativeTableStatus getStatus() {
    return status;
  }

  public String getRegisteredBy() {
    return registeredBy;
  }

  public OffsetDateTime getRegisteredAt() {
    return registeredAt;
  }

  public String getVerifiedBy() {
    return verifiedBy;
  }

  public OffsetDateTime getVerifiedAt() {
    return verifiedAt;
  }

  public List<NormativeTableRow> getRows() {
    return List.copyOf(rows);
  }

  public boolean isDraft() {
    return status == NormativeTableStatus.DRAFT;
  }

  public boolean isPublished() {
    return status == NormativeTableStatus.PUBLISHED;
  }

  /** Replaces what was typed. Only a draft changes; the service refuses the others before. */
  public void revise(
      String identification, String item, String page, List<NormativeTableRow> rows) {
    if (!isDraft()) {
      throw new IllegalStateException("Only a draft table is revised.");
    }
    describe(identification, item, page, rows);
  }

  public void publish(String verifiedBy) {
    if (!isDraft()) {
      throw new IllegalStateException("Only a draft table is published.");
    }
    this.verifiedBy = Objects.requireNonNull(verifiedBy, "verifiedBy");
    this.verifiedAt = OffsetDateTime.now(ZoneOffset.UTC);
    this.status = NormativeTableStatus.PUBLISHED;
  }

  public void supersede() {
    this.status = NormativeTableStatus.SUPERSEDED;
  }

  public boolean isVerifiableBy(String person) {
    return !registeredBy.equalsIgnoreCase(person);
  }

  public NormativeReference reference() {
    return new NormativeReference(
        code, identification, code.standard(), standard.getRevision(), item, page);
  }

  /** The first row of the key whose band reaches the argument; a null argument skips the band. */
  public Optional<NormativeTableRow> find(String key, BigDecimal argument) {
    return rows.stream()
        .filter(row -> Objects.equals(row.getRowKey(), key))
        .filter(row -> row.covers(argument))
        .findFirst();
  }

  /** What prevents the rows from being read without ambiguity, in screen text. */
  public List<String> problems() {
    List<String> problems = new ArrayList<>();
    if (rows.isEmpty()) {
      problems.add("Cadastre ao menos uma linha da tabela.");
      return problems;
    }

    Map<String, BigDecimal> lastUpperByKey = new HashMap<>();
    Set<String> openKeys = new HashSet<>();
    Set<String> seenKeys = new HashSet<>();
    for (int index = 0; index < rows.size(); index++) {
      NormativeTableRow row = rows.get(index);
      String line = "Linha " + (index + 1) + ": ";
      String key = row.getRowKey();

      if (code.keyed() && (key == null || !code.acceptsKey(key))) {
        problems.add(line + "escolha uma das chaves de " + code.identification() + ".");
      }
      if (!code.keyed() && key != null) {
        problems.add(line + code.identification() + " não usa chave.");
      }
      for (int value = 1; value < code.valueLabels().size(); value++) {
        BigDecimal informed = value == 1 ? row.getSecondaryValue() : row.getTertiaryValue();
        if (informed == null) {
          problems.add(line + "informe " + code.valueLabels().get(value).toLowerCase() + ".");
        }
      }

      String group = Objects.toString(key, "");
      if (!code.ranged()) {
        if (!seenKeys.add(group)) {
          problems.add(line + "a chave aparece mais de uma vez.");
        }
        continue;
      }
      if (row.getLowerBound() != null
          && row.getUpperBound() != null
          && row.getLowerBound().compareTo(row.getUpperBound()) > 0) {
        problems.add(line + "o início da faixa passa do fim.");
      }
      BigDecimal lastUpper = lastUpperByKey.get(group);
      if (row.getLowerBound() != null
          && lastUpper != null
          && row.getLowerBound().compareTo(lastUpper) < 0) {
        problems.add(line + "a faixa começa antes do fim da anterior.");
      }
      if (openKeys.contains(group)) {
        problems.add(line + "só a última faixa pode ficar sem limite superior.");
      }
      if (row.getUpperBound() == null) {
        openKeys.add(group);
        continue;
      }
      BigDecimal previous = lastUpperByKey.put(group, row.getUpperBound());
      if (previous != null && previous.compareTo(row.getUpperBound()) >= 0) {
        problems.add(line + "as faixas precisam estar em ordem crescente.");
      }
    }
    return problems;
  }

  private void describe(
      String identification, String item, String page, List<NormativeTableRow> rows) {
    this.identification = Objects.requireNonNull(identification, "identification");
    this.item = Objects.requireNonNull(item, "item");
    this.page = Objects.requireNonNull(page, "page");
    this.rows.clear();
    this.rows.addAll(Objects.requireNonNull(rows, "rows"));
  }
}
