package br.com.ampere.repository;

import br.com.ampere.domain.Project;
import org.springframework.data.jpa.repository.JpaRepository;

/** Database access for electrical projects. */
public interface ProjectRepository extends JpaRepository<Project, Long> {}
