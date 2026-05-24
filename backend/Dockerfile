FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

ENV MAVEN_OPTS="-Xmx384m"

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -DskipTests dependency:go-offline

COPY src/ src/
RUN ./mvnw -B -DskipTests clean package

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Xms128m -Xmx384m -jar app.jar --server.port=${PORT:-8080} --server.address=0.0.0.0"]