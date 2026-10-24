package br.com.ampere.config;

import jakarta.persistence.EntityManager;
import java.time.OffsetDateTime;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Backdates what the domain stamps with "now" when it persists. The seed tells a story that already
 * happened, and the entities rightly expose no setter for these dates, so the seed rewrites them
 * with bulk updates after the rows exist. Bulk updates skip the lifecycle callbacks, which would
 * stamp "now" again. Only the seeds use this; production code never does.
 */
@Component
@Profile("(!prod & !test) | demo")
public class SeedTimestamps {

  private final EntityManager entityManager;

  public SeedTimestamps(EntityManager entityManager) {
    this.entityManager = entityManager;
  }

  void user(Long id, OffsetDateTime createdAt) {
    update(
        "UPDATE User u SET u.createdAt = :createdAt WHERE u.id = :id", id, "createdAt", createdAt);
  }

  void project(Long id, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
    entityManager.flush();
    entityManager
        .createQuery(
            "UPDATE Project p SET p.createdAt = :createdAt, p.updatedAt = :updatedAt"
                + " WHERE p.id = :id")
        .setParameter("createdAt", createdAt)
        .setParameter("updatedAt", updatedAt)
        .setParameter("id", id)
        .executeUpdate();
  }

  void finding(Long id, OffsetDateTime createdAt) {
    update(
        "UPDATE Finding f SET f.createdAt = :createdAt WHERE f.id = :id",
        id,
        "createdAt",
        createdAt);
  }

  void document(Long id, OffsetDateTime uploadedAt) {
    update(
        "UPDATE ProjectDocument d SET d.uploadedAt = :uploadedAt WHERE d.id = :id",
        id,
        "uploadedAt",
        uploadedAt);
  }

  void calculation(Long id, OffsetDateTime calculatedAt) {
    update(
        "UPDATE Calculation c SET c.calculatedAt = :calculatedAt WHERE c.id = :id",
        id,
        "calculatedAt",
        calculatedAt);
  }

  void table(Long id, OffsetDateTime registeredAt, OffsetDateTime verifiedAt) {
    entityManager.flush();
    entityManager
        .createQuery(
            "UPDATE NormativeTable t SET t.registeredAt = :registeredAt, t.verifiedAt = :verifiedAt"
                + " WHERE t.id = :id")
        .setParameter("registeredAt", registeredAt)
        .setParameter("verifiedAt", verifiedAt)
        .setParameter("id", id)
        .executeUpdate();
  }

  private void update(String query, Long id, String name, OffsetDateTime value) {
    entityManager.flush();
    entityManager
        .createQuery(query)
        .setParameter(name, value)
        .setParameter("id", id)
        .executeUpdate();
  }
}
