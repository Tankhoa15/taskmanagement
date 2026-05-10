FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace
COPY pom.xml .
COPY src ./src

RUN mvn -B package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app
COPY --from=build /workspace/target/quarkus-app/ ./

ENV QUARKUS_HTTP_HOST=0.0.0.0
EXPOSE 10000

CMD ["sh", "-c", "java -Dquarkus.http.port=${PORT:-10000} -jar quarkus-run.jar"]
