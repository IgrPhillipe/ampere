package br.com.ampere.service;

import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.domain.ProjectVersion;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.ProjectVersionRepository;
import java.util.Locale;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Public check of a memorial: by the code in its footer or by the file itself. It answers only
 * which submission the memorial belongs to, never the project data.
 */
@Service
public class MemorialVerificationService {

  private static final int CODE_LENGTH = 16;

  private final ProjectVersionRepository versionRepository;

  public MemorialVerificationService(ProjectVersionRepository versionRepository) {
    this.versionRepository = versionRepository;
  }

  @Transactional(readOnly = true)
  public Optional<ProjectVersion> byCode(String code) {
    String normalized =
        code == null ? "" : code.replaceAll("[^0-9A-Za-z]", "").toUpperCase(Locale.ROOT);
    if (normalized.length() != CODE_LENGTH) {
      return Optional.empty();
    }

    return versionRepository.findByVerificationCode(
        String.join(
            "-",
            normalized.substring(0, 4),
            normalized.substring(4, 8),
            normalized.substring(8, 12),
            normalized.substring(12, 16)));
  }

  /** Confirms only a file identical, byte for byte, to the one issued with a version. */
  @Transactional(readOnly = true)
  public Optional<ProjectVersion> byFile(byte[] content) {
    if (!ProjectDocument.isPdf(content)) {
      throw new BusinessException("Envie o memorial em PDF.");
    }

    return versionRepository.findByMemorialSha256(MemorialPdfService.sha256(content));
  }
}
