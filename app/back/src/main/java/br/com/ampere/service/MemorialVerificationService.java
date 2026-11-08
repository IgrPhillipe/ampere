package br.com.ampere.service;

import br.com.ampere.domain.ApprovalMemorial;
import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.domain.ProjectVersion;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.ApprovalMemorialRepository;
import br.com.ampere.repository.ProjectVersionRepository;
import br.com.ampere.utils.MemorialFingerprint;
import java.time.OffsetDateTime;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Answers which submission a memorial belongs to, never the project data. */
@Service
public class MemorialVerificationService {

  private final ProjectVersionRepository versionRepository;
  private final ApprovalMemorialRepository approvalMemorialRepository;

  public MemorialVerificationService(
      ProjectVersionRepository versionRepository,
      ApprovalMemorialRepository approvalMemorialRepository) {
    this.versionRepository = versionRepository;
    this.approvalMemorialRepository = approvalMemorialRepository;
  }

  /** The version a memorial belongs to; approvedAt only for the memorial of an approval. */
  public record Verified(ProjectVersion version, OffsetDateTime approvedAt) {}

  /** The submitted memorial or the one approved with reservations: both belong to the version. */
  @Transactional(readOnly = true)
  public Optional<Verified> byCode(String code) {
    return MemorialFingerprint.normalize(code)
        .flatMap(
            normalized ->
                versionRepository
                    .findByVerificationCode(normalized)
                    .map(MemorialVerificationService::submitted)
                    .or(
                        () ->
                            approvalMemorialRepository
                                .findByVerificationCode(normalized)
                                .map(MemorialVerificationService::approved)));
  }

  @Transactional(readOnly = true)
  public Optional<Verified> byFile(byte[] content) {
    if (!ProjectDocument.isPdf(content)) {
      throw new BusinessException("Envie o memorial em PDF.");
    }

    String sha256 = MemorialFingerprint.sha256(content);
    return versionRepository
        .findByMemorialSha256(sha256)
        .map(MemorialVerificationService::submitted)
        .or(
            () ->
                approvalMemorialRepository
                    .findByMemorialSha256(sha256)
                    .map(MemorialVerificationService::approved));
  }

  private static Verified submitted(ProjectVersion version) {
    return new Verified(version, null);
  }

  private static Verified approved(ApprovalMemorial approval) {
    return new Verified(approval.getVersion(), approval.getIssuedAt());
  }
}
