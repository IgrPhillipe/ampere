package br.com.ampere.error;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import tools.jackson.databind.exc.InvalidFormatException;

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

  private final MessageSource messageSource;

  public GlobalExceptionHandler(MessageSource messageSource) {
    this.messageSource = messageSource;
  }

  private static final String INTERNAL_MESSAGE = "Erro interno. Tente novamente.";
  private static final String VALIDATION_MESSAGE = "Verifique os dados enviados.";
  private static final String NOT_FOUND_MESSAGE = "Recurso não encontrado.";
  private static final String MALFORMED_BODY_MESSAGE =
      "Corpo da requisição inválido. Verifique o JSON enviado.";
  private static final String CONFLICT_MESSAGE = "Conflito ao gravar os dados. Tente novamente.";

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
                        messageSource.getMessage(error, LocaleContextHolder.getLocale())))
            .toList();

    ProblemDetail problem =
        ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, VALIDATION_MESSAGE);
    problem.setProperty("errors", errors);

    return problem;
  }

  /**
   * Rota inexistente. Sem isto cai na rede de seguranca e vira 500, que diz ao cliente que o
   * servidor falhou quando o problema e o caminho pedido.
   */
  @ExceptionHandler(NoResourceFoundException.class)
  public ProblemDetail handleNoResource(NoResourceFoundException exception) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, NOT_FOUND_MESSAGE);
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ProblemDetail handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
    String detail =
        exception.getRootCause() instanceof BusinessException businessException
            ? businessException.getMessage()
            : "O parâmetro '" + exception.getName() + "' tem um valor inválido.";

    return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
  }

  /**
   * Corpo ilegivel: JSON malformado, corpo ausente, ou valor que nao existe no enum do campo. Sem
   * este handler a rede de seguranca transforma erro do cliente em 500.
   */
  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ProblemDetail handleUnreadableBody(HttpMessageNotReadableException exception) {
    String detail =
        exception.getCause() instanceof InvalidFormatException invalidFormat
                && invalidFormat.getTargetType() != null
                && invalidFormat.getTargetType().isEnum()
            ? invalidEnumMessage(invalidFormat)
            : MALFORMED_BODY_MESSAGE;

    return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ProblemDetail handleDataIntegrity(DataIntegrityViolationException exception) {
    log.warn("Violacao de integridade", exception);

    return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, CONFLICT_MESSAGE);
  }

  private static String invalidEnumMessage(InvalidFormatException exception) {
    String field =
        exception.getPath().isEmpty()
            ? ""
            : exception.getPath().get(exception.getPath().size() - 1).getPropertyName();
    String accepted =
        Arrays.stream(exception.getTargetType().getEnumConstants())
            .map(value -> ((Enum<?>) value).name())
            .collect(Collectors.joining(", "));

    return "O campo '" + field + "' tem um valor inválido. Valores aceitos: " + accepted + ".";
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
