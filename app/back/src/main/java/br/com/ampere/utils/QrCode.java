package br.com.ampere.utils;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import java.util.Map;

public final class QrCode {

  private QrCode() {}

  /** One cell per module, without the quiet zone: the caller leaves the margin around it. */
  public static BitMatrix modules(String text) {
    try {
      return new QRCodeWriter()
          .encode(
              text,
              BarcodeFormat.QR_CODE,
              0,
              0,
              Map.of(
                  EncodeHintType.MARGIN,
                  0,
                  EncodeHintType.ERROR_CORRECTION,
                  ErrorCorrectionLevel.M,
                  EncodeHintType.CHARACTER_SET,
                  "UTF-8"));
    } catch (WriterException exception) {
      throw new IllegalArgumentException("Texto grande demais para o QR code.", exception);
    }
  }
}
