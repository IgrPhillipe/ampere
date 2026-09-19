# Estagio de build: compila com a JDK completa e o wrapper do proprio projeto,
# entao a versao do Maven aqui e a mesma que roda na maquina de quem desenvolve.
FROM eclipse-temurin:21-jdk AS build

WORKDIR /build

# As dependencias entram numa camada propria: enquanto o pom.xml nao mudar,
# rebuild de codigo nao baixa nada de novo.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw -B -q dependency:go-offline

COPY src/ src/
RUN ./mvnw -B -q clean package -DskipTests

# Estagio final: so o JRE e o jar. Sem Maven, sem codigo-fonte, sem as
# dependencias de build.
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
COPY --from=build /build/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
