package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

/** One line of the calculation memory as it was shown when the calculation ran. */
@Embeddable
public class CalculationStep {

  private static final String LINE_BREAK = "\n";

  @Column(nullable = false)
  private String code;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private Boolean applies;

  @Column(nullable = false, columnDefinition = "text")
  private String formula;

  @Column(columnDefinition = "text")
  private String details;

  @Column(nullable = false)
  private BigDecimal valueKva;

  private String referenceLabel;

  private String referenceIdentification;

  private String referenceStandard;

  private String referenceRevision;

  private String referenceItem;

  private String referencePage;

  protected CalculationStep() {}

  CalculationStep(DemandStep step) {
    this.code = step.code();
    this.title = step.title();
    this.applies = step.applies();
    this.formula = step.formula();
    this.details = String.join(LINE_BREAK, step.details());
    this.valueKva = step.valueKva();
    NormativeReference reference = step.reference();
    if (reference != null) {
      this.referenceLabel = reference.label();
      this.referenceIdentification = reference.identification();
      this.referenceStandard = reference.standard().code();
      this.referenceRevision = reference.revision();
      this.referenceItem = reference.item();
      this.referencePage = reference.page();
    }
  }

  public String getCode() {
    return code;
  }

  public String getTitle() {
    return title;
  }

  public boolean applies() {
    return Boolean.TRUE.equals(applies);
  }

  public String getFormula() {
    return formula;
  }

  public List<String> getDetails() {
    return details == null || details.isEmpty()
        ? List.of()
        : Arrays.asList(details.split(LINE_BREAK));
  }

  public BigDecimal getValueKva() {
    return valueKva;
  }

  public boolean hasReference() {
    return referenceLabel != null;
  }

  public String getReferenceLabel() {
    return referenceLabel;
  }

  public String getReferenceIdentification() {
    return referenceIdentification;
  }

  public String getReferenceStandard() {
    return referenceStandard;
  }

  public String getReferenceRevision() {
    return referenceRevision;
  }

  public String getReferenceItem() {
    return referenceItem;
  }

  public String getReferencePage() {
    return referencePage;
  }
}
