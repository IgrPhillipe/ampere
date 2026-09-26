package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/** A table a calculation read, with the revision it was read under. */
@Embeddable
public class AppliedTable {

  @Column(nullable = false)
  private String identification;

  @Column(nullable = false)
  private String standard;

  @Column(nullable = false)
  private String revision;

  @Column(nullable = false)
  private String item;

  @Column(nullable = false)
  private String page;

  protected AppliedTable() {}

  AppliedTable(NormativeReference reference) {
    this.identification = reference.identification();
    this.standard = reference.standard().code();
    this.revision = reference.revision();
    this.item = reference.item();
    this.page = reference.page();
  }

  public String getIdentification() {
    return identification;
  }

  public String getStandard() {
    return standard;
  }

  public String getRevision() {
    return revision;
  }

  public String getItem() {
    return item;
  }

  public String getPage() {
    return page;
  }
}
