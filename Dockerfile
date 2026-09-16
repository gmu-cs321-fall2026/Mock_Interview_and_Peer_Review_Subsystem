FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY src/main/java/Main.java .
RUN javac Main.java
CMD ["java", "Main"]