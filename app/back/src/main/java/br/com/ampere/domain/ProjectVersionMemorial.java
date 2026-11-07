package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.Objects;
import org.hibernate.annotations.Immutable;

/** The memorial PDF issued with a version, apart from it so listing versions loads no bytes. */
@Entity
@Immutable
@Table(name = "project_version_memorial")
public class ProjectVersionMemorial {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, updatable = false)
  private String filename;

  @Column(nullable = false, updatable = false, columnDefinition = "bytea")
  private byte[] data;

  protected ProjectVersionMemorial() {}

  public ProjectVersionMemorial(String filename, byte[] data) {
    this.filename = Objects.requireNonNull(filename, "filename");
    this.data = Objects.requireNonNull(data, "data").clone();
  }

  public Long getId() {
    return id;
  }

  public String getFilename() {
    return filename;
  }

  public byte[] getData() {
    return data.clone();
  }
}
