# Build stage: compiles with the full JDK and the project's own wrapper.
FROM eclipse-temurin:21-jdk AS build

WORKDIR /build

# Dependencies in their own layer: a code rebuild downloads nothing again.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw -B -q dependency:go-offline

COPY src/ src/
RUN ./mvnw -B -q clean package -DskipTests

# Final stage: the JRE and the jar, nothing else.
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
COPY --from=build /build/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
