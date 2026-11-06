package br.com.ampere.utils;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

/** CSV for Excel in pt-BR: UTF-8 with BOM, semicolon between fields and CRLF between rows. */
public final class CsvFile {

  private static final byte[] UTF8_BOM = {(byte) 0xef, (byte) 0xbb, (byte) 0xbf};
  private static final String SEPARATOR = ";";
  private static final String LINE_END = "\r\n";
  private static final String FORMULA_PREFIXES = "=+-@";

  private CsvFile() {}

  public static byte[] encode(List<List<String>> rows) {
    String content =
        rows.stream()
            .map(row -> row.stream().map(CsvFile::quote).collect(Collectors.joining(SEPARATOR)))
            .collect(Collectors.joining(LINE_END, "", LINE_END));
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    output.writeBytes(UTF8_BOM);
    output.writeBytes(content.getBytes(StandardCharsets.UTF_8));

    return output.toByteArray();
  }

  /** Spreadsheets run a leading =, +, - or @ as a formula, even after blanks. */
  public static String text(String value) {
    int first = 0;
    while (first < value.length()
        && (Character.isWhitespace(value.charAt(first))
            || Character.isISOControl(value.charAt(first)))) {
      first++;
    }
    boolean formula = first < value.length() && FORMULA_PREFIXES.indexOf(value.charAt(first)) >= 0;

    return formula ? "'" + value : value;
  }

  private static String quote(String value) {
    boolean quoted = value.contains(SEPARATOR) || value.contains("\"") || value.contains("\r");

    return quoted || value.contains("\n") ? "\"" + value.replace("\"", "\"\"") + "\"" : value;
  }
}
