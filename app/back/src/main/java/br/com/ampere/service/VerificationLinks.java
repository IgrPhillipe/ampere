package br.com.ampere.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** The public page that checks a document, printed in its QR code and verification sheet. */
@Component
public class VerificationLinks {

  static final String PATH = "/verificar-autenticidade";

  private final String frontUrl;

  public VerificationLinks(@Value("${ampere.front-url}") String frontUrl) {
    this.frontUrl = frontUrl.replaceAll("/+$", "");
  }

  public String page() {
    return frontUrl + PATH;
  }

  public String forCode(String code) {
    return page() + "?codigo=" + URLEncoder.encode(code, StandardCharsets.UTF_8);
  }
}
