package br.com.ampere.config;

import br.com.ampere.service.ProjectVersionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/** Gives a version to the projects submitted before the versions existed. */
@Component
@Profile("!test")
public class ProjectVersionBackfill {

  private static final Logger log = LoggerFactory.getLogger(ProjectVersionBackfill.class);

  private final ProjectVersionService versionService;

  public ProjectVersionBackfill(ProjectVersionService versionService) {
    this.versionService = versionService;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void onReady() {
    for (Long projectId : versionService.projectsMissingVersion()) {
      try {
        versionService.backfill(projectId);
      } catch (RuntimeException failure) {
        log.warn("ProjectVersionBackfill: project {} failed: {}", projectId, failure.getMessage());
      }
    }
  }
}
