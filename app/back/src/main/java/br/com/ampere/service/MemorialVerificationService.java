package br.com.ampere.service;

import br.com.ampere.domain.ApprovalMemorial;
import br.com.ampere.domain.IssuedDocument;
import br.com.ampere.domain.IssuedDocumentType;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.domain.ProjectVersion;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.ApprovalMemorialRepository;
import br.com.ampere.repository.IssuedDocumentRepository;
import br.com.ampere.repository.ProjectVersionRepository;
import br.com.ampere.security.PdfSignatureVerifier;
import br.com.ampere.security.PdfSignatureVerifier.Inspection;
import br.com.ampere.security.PdfSigner;
import br.com.ampere.utils.MemorialFingerprint;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Answers which issued document a file or code is, never the project data. */
@Service
public class MemorialVerificationService {

  private static final byte[] ZIP_SIGNATURE = {'P', 'K', 3, 4};

  private final IssuedDocumentRepository issuedDocumentRepository;
  private final ProjectVersionRepository versionRepository;
  private final ApprovalMemorialRepository approvalMemorialRepository;
  private final PdfSignatureVerifier signatureVerifier;
  private final PdfSigner signer;

  public MemorialVerificationService(
      IssuedDocumentRepository issuedDocumentRepository,
      ProjectVersionRepository versionRepository,
      ApprovalMemorialRepository approvalMemorialRepository,
      PdfSignatureVerifier signatureVerifier,
      PdfSigner signer) {
    this.issuedDocumentRepository = issuedDocumentRepository;
    this.versionRepository = versionRepository;
    this.approvalMemorialRepository = approvalMemorialRepository;
    this.signatureVerifier = signatureVerifier;
    this.signer = signer;
  }

  /** The signature of an uploaded PDF; null when checking a code or a spreadsheet. */
  public enum SignatureStatus {
    /** Intact and made with the AMPERE certificate. */
    VALID,
    /** Changed after the signature, or not covering the whole file. */
    INVALID,
    /** Intact, but made with a certificate that is not the AMPERE one. */
    UNTRUSTED,
    /** No signature, as in the memorials issued before it. */
    ABSENT
  }

  /** version is null for an unsubmitted calculation; approvedAt only for an approval memorial. */
  public record Verified(
      IssuedDocumentType type,
      Project project,
      ProjectVersion version,
      OffsetDateTime issuedAt,
      OffsetDateTime approvedAt) {}

  /** verified is null when nothing matches; signature is null except for an uploaded PDF. */
  public record Result(Verified verified, SignatureStatus signature) {}

  /** A registered file, and whether it was signed when issued. */
  private record Match(Verified verified, boolean signed) {}

  @Transactional(readOnly = true)
  public Result byCode(String code) {
    Verified verified =
        MemorialFingerprint.normalize(code)
            .flatMap(
                normalized ->
                    issuedDocumentRepository
                        .findByVerificationCode(normalized)
                        .map(MemorialVerificationService::registered)
                        .or(
                            () ->
                                versionRepository
                                    .findByVerificationCode(normalized)
                                    .map(MemorialVerificationService::submitted))
                        .or(
                            () ->
                                approvalMemorialRepository
                                    .findByVerificationCode(normalized)
                                    .map(MemorialVerificationService::approved)))
            .orElse(null);

    return new Result(verified, null);
  }

  @Transactional(readOnly = true)
  public Result byFile(byte[] content) {
    boolean pdf = ProjectDocument.isPdf(content);
    if (!pdf && !startsWith(content, ZIP_SIGNATURE)) {
      throw new BusinessException("Envie o memorial em PDF ou a planilha em XLSX.");
    }
    Optional<Match> match = registeredFile(MemorialFingerprint.sha256(content));
    if (!pdf) {
      return new Result(match.map(Match::verified).orElse(null), null);
    }

    SignatureStatus signature = signature(signatureVerifier.inspect(content));
    // A signed memorial needs its signature intact; one issued before the signature has none.
    Verified verified =
        match
            .filter(
                found ->
                    found.signed()
                        ? signature == SignatureStatus.VALID
                        : signature == SignatureStatus.ABSENT)
            .map(Match::verified)
            .orElse(null);

    return new Result(verified, signature);
  }

  private Optional<Match> registeredFile(String sha256) {
    return issuedDocumentRepository
        .findBySha256(sha256)
        .map(document -> new Match(registered(document), document.isSigned()))
        .or(
            () ->
                versionRepository
                    .findByMemorialSha256(sha256)
                    .map(version -> new Match(submitted(version), false)))
        .or(
            () ->
                approvalMemorialRepository
                    .findByMemorialSha256(sha256)
                    .map(approval -> new Match(approved(approval), false)));
  }

  private SignatureStatus signature(Inspection inspection) {
    return switch (inspection.outcome()) {
      case ABSENT -> SignatureStatus.ABSENT;
      case INVALID -> SignatureStatus.INVALID;
      case INTACT ->
          trusted(inspection.signerSha256()) ? SignatureStatus.VALID : SignatureStatus.UNTRUSTED;
    };
  }

  /** The current certificate, or one that signed a registered document before a key rotation. */
  private boolean trusted(String certificateSha256) {
    return certificateSha256.equals(signer.certificateSha256())
        || issuedDocumentRepository.existsBySignerCertificateSha256(certificateSha256);
  }

  private static Verified registered(IssuedDocument document) {
    boolean approval = document.getType() == IssuedDocumentType.APPROVAL_MEMORIAL;

    return new Verified(
        document.getType(),
        document.getProject(),
        document.getVersion(),
        document.getIssuedAt(),
        approval ? document.getIssuedAt() : null);
  }

  private static Verified submitted(ProjectVersion version) {
    return new Verified(
        IssuedDocumentType.SUBMISSION_MEMORIAL,
        version.getProject(),
        version,
        version.getSubmittedAt(),
        null);
  }

  private static Verified approved(ApprovalMemorial approval) {
    ProjectVersion version = approval.getVersion();

    return new Verified(
        IssuedDocumentType.APPROVAL_MEMORIAL,
        version.getProject(),
        version,
        approval.getIssuedAt(),
        approval.getIssuedAt());
  }

  private static boolean startsWith(byte[] content, byte[] prefix) {
    return content != null
        && content.length >= prefix.length
        && Arrays.equals(content, 0, prefix.length, prefix, 0, prefix.length);
  }
}
