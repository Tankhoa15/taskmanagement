FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace
COPY pom.xml .
COPY src ./src

RUN mvn -B package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app
COPY --from=build /workspace/target/quarkus-app/ ./
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

ENV QUARKUS_HTTP_HOST=0.0.0.0
ENV QUARKUS_PROFILE=prod
EXPOSE 10000

CMD ["./docker-entrypoint.sh"]
