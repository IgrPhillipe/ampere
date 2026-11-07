package br.com.ampere.controller;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

final class InlinePdf {

  private InlinePdf() {}

  static ResponseEntity<byte[]> of(String filename, byte[] content) {
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.inline().filename(filename).build().toString())
        .body(content);
  }
}
