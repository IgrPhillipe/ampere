package br.com.ampere.error;

import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Traduz excecao em resposta HTTP, no formato {@code ProblemDetail} da RFC 7807.
 *
 * <p>O front-end ja espera exatamente isto: {@code app/front/src/lib/api-error.ts} le {@code
 * detail} e, na falha de validacao, a propriedade {@code errors} com {@code field} e {@code
 * defaultMessage}.
 *
 * <p>Duas regras valem para toda mensagem que sai daqui:
 *
 * <ul>
 *   <li>Texto para humano, em portugues. O front descarta qualquer mensagem com nome de pacote Java
 *       ou stack trace e cai num texto generico, entao detalhe tecnico nao chega na tela — e tambem
 *       nao ajuda ninguem.
 *   <li>Erro nunca vai embrulhado em {@code ApiResponse}. O envelope e so para sucesso.
 * </ul>
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  private static final String INTERNAL_MESSAGE = "Erro interno. Tente novamente.";
  private static final String VALIDATION_MESSAGE = "Verifique os dados enviados.";

  @ExceptionHandler(NotFoundException.class)
  public ProblemDetail handleNotFound(NotFoundException exception) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
  }

  @ExceptionHandler(BusinessException.class)
  public ProblemDetail handleBusiness(BusinessException exception) {
    return ProblemDetail.forStatusAndDetail(exception.getStatus(), exception.getMessage());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ProblemDetail handleValidation(MethodArgumentNotValidException exception) {
    List<Map<String, String>> errors =
        exception.getBindingResult().getFieldErrors().stream()
            .map(
                error ->
                    Map.of(
                        "field",
                        error.getField(),
                        "defaultMessage",
                        String.valueOf(error.getDefaultMessage())))
            .toList();

    ProblemDetail problem =
        ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, VALIDATION_MESSAGE);
    problem.setProperty("errors", errors);

    return problem;
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ProblemDetail handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
    return ProblemDetail.forStatusAndDetail(
        HttpStatus.BAD_REQUEST, "Parâmetro inválido: " + exception.getName() + ".");
  }

  /**
   * Rede de seguranca. Registra o erro real no log do servidor e devolve texto generico, para nao
   * vazar detalhe interno na resposta.
   */
  @ExceptionHandler(Exception.class)
  public ProblemDetail handleUnexpected(Exception exception) {
    log.error("Erro nao tratado", exception);

    return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_MESSAGE);
  }
}
