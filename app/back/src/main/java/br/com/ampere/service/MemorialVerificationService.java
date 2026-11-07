package br.com.ampere.service;

import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.domain.ProjectVersion;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.ProjectVersionRepository;
import br.com.ampere.utils.MemorialFingerprint;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Public check of a memorial: by the code in its footer or by the file itself. It answers only
 * which submission the memorial belongs to, never the project data.
 */
@Service
public class MemorialVerificationService {

  private final ProjectVersionRepository versionRepository;

  public MemorialVerificationService(ProjectVersionRepository versionRepository) {
    this.versionRepository = versionRepository;
  }

  @Transactional(readOnly = true)
  public Optional<ProjectVersion> byCode(String code) {
    return MemorialFingerprint.normalize(code).flatMap(versionRepository::findByVerificationCode);
  }

  /** Confirms only a file identical, byte for byte, to the one issued with a version. */
  @Transactional(readOnly = true)
  public Optional<ProjectVersion> byFile(byte[] content) {
    if (!ProjectDocument.isPdf(content)) {
      throw new BusinessException("Envie o memorial em PDF.");
    }

    return versionRepository.findByMemorialSha256(MemorialFingerprint.sha256(content));
  }
}
