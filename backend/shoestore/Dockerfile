# Bước 1: Build project bằng Maven
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Bước 2: Chạy file .jar đã build
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Tạo thư mục uploads
RUN mkdir -p uploads/products

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
