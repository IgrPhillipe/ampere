package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.util.Objects;

/** A normative verification run with every calculation. Only WARNING asks the designer to act. */
@Embeddable
public class CalculationCheck {

  @Column(nullable = false)
  private String code;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private CheckStatus status;

  @Column(nullable = false, length = 500)
  private String message;

  protected CalculationCheck() {}

  public CalculationCheck(String code, CheckStatus status, String message) {
    this.code = Objects.requireNonNull(code, "code");
    this.status = Objects.requireNonNull(status, "status");
    this.message = Objects.requireNonNull(message, "message");
  }

  public String getCode() {
    return code;
  }

  public CheckStatus getStatus() {
    return status;
  }

  public String getMessage() {
    return message;
  }
}
