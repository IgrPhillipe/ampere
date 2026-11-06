package br.com.ampere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AmpereApiApplication {

  public static void main(String[] args) {
    SpringApplication.run(AmpereApiApplication.class, args);
  }
}
