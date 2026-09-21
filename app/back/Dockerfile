# Estagio de build: compila com a JDK completa e o wrapper do projeto.
FROM eclipse-temurin:21-jdk AS build

WORKDIR /build

# Dependencias em camada propria: rebuild de codigo nao baixa nada de novo.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw -B -q dependency:go-offline

COPY src/ src/
RUN ./mvnw -B -q clean package -DskipTests

# Estagio final: so o JRE e o jar.
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
COPY --from=build /build/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
