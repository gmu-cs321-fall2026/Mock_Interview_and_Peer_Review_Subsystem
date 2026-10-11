package app;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Component;

@Component
public class DataStore {
  private List<Question> questions = new ArrayList<>(); // List of all the question
  private List<PracticeRequest> requests = new ArrayList<>(); // List of requests sent by users
  private List<Pairing> pairings = new ArrayList<>(); // Stores accpected user interview requests
  private List<User> users = new ArrayList<>(); // List of all users, be it student or admin
  private List<requestQuestion> requestQuestions = new ArrayList<>(); // List of all requested questions

  // ---- Permanent storage (JSON files, created in a "data" folder next to where the server is run) ----
  private static final Path DATA_DIR = Paths.get("data");
  private static final Path QUESTIONS_FILE = DATA_DIR.resolve("questions.json");
  private static final Path QUESTION_REQUESTS_FILE = DATA_DIR.resolve("question_requests.json");
  private static final Set<String> VALID_CATEGORIES = Set.of("BEHAVIORAL", "TECHNICAL", "CASE", "INDUSTRY");
  private final ObjectMapper mapper = new ObjectMapper();

  private int nextQuestionId = 1; // ID for the next question
  private int nextRequestQuesID = 1; // ID of requested question
  private int nextRequestId = 1; // Id to assign practice request
  private int nextPairingId = 1; // Used to track id for next request pair

  public DataStore() {
    // Sample data of users and admin for testing purpose
    users.add(new User(101, "Student 1", "STUDENT"));
    users.add(new User(102, "Student 2", "STUDENT"));
    users.add(new User(103, "Student 3", "STUDENT"));
    users.add(new User(104, "Admin", "ADMIN"));
    loadData();
  }

  private void seedQuestions() {
    // 25 diffrent questions that are divided into diffrent catogories like behavioral, technical, case and industry
    questions.add(new Question(1, "Tell me about yourself.", "BEHAVIORAL"));
    questions.add(new Question(2, "Tell me about a time you faced a difficult challenge.", "BEHAVIORAL"));
    questions.add(new Question(3, "Describe a time when you worked successfully as part of a team.", "BEHAVIORAL"));
    questions.add(new Question(4, "Tell me about a time you made a mistake and what you learned from it.", "BEHAVIORAL"));
    questions.add(new Question(5, "Describe a situation where you had to meet a tight deadline.", "BEHAVIORAL"));
    questions.add(new Question(6, "Tell me about a time you disagreed with a teammate.", "BEHAVIORAL"));
    questions.add(new Question(7, "Describe a project you are particularly proud of.", "BEHAVIORAL"));
    questions.add(new Question(8, "How do you prioritize tasks when you have multiple deadlines?", "BEHAVIORAL"));
    questions.add(new Question(9, "What is the difference between a stack and a queue?", "TECHNICAL"));
    questions.add(new Question(10, "What is the difference between an array and a linked list?", "TECHNICAL"));
    questions.add(new Question(11, "What is the purpose of an API?", "TECHNICAL"));
    questions.add(new Question(12, "What is the difference between authentication and authorization?", "TECHNICAL"));
    questions.add(new Question(13, "What is a database primary key?", "TECHNICAL"));
    questions.add(new Question(14, "What is the purpose of version control systems such as Git?", "TECHNICAL"));
    questions.add(new Question(15, "What is the difference between HTTP GET and POST requests?", "TECHNICAL"));
    questions.add(new Question(16, "Estimate how many cups of coffee are sold on campus each day.", "CASE"));
    questions.add(new Question(17, "How would you estimate the number of students who attend a career fair?", "CASE"));
    questions.add(new Question(18, "A company has seen a 20% decrease in job applications. How would you investigate why?", "CASE"));
    questions.add(new Question(19, "How would you design a system to help students find available mock interview partners?", "CASE"));
    questions.add(new Question(20, "A website becomes significantly slower after a new feature is released. How would you troubleshoot the problem?", "CASE"));
    questions.add(new Question(21, "How would you improve the process for matching students with mentors?", "CASE"));
    questions.add(new Question(22, "Why are you interested in the technology industry?", "INDUSTRY"));
    questions.add(new Question(23, "What technology trend do you think will have the biggest impact on software development?", "INDUSTRY"));
    questions.add(new Question(24, "What skills do you think are most important for a successful software engineer?", "INDUSTRY"));
    questions.add(new Question(25, "How do you stay informed about changes and developments in the technology industry?", "INDUSTRY"));
  }

  // Getter method used to get specific catogory, or return all questions if not specified
  public List<Question> getQuestions(String category) {
    if (category == null || category.isBlank()) { // Checks if requestinf catogory is empty, which case it returns all questions
      return questions;
    }
    List<Question> matchingQuestions = new ArrayList<>(); // Creates indivdual array list for all questions in category
    for (Question question : questions) { // goes through array list of all questions and checks if it is the correct category
      if (question.getCategory().equalsIgnoreCase(category)) {
        matchingQuestions.add(question);
      }
    } // returns list of all the matching questions
    return matchingQuestions;
  }

  public PracticeRequest createRequest(int userId) {
    PracticeRequest request = new PracticeRequest(nextRequestId, userId);
    nextRequestId++;
    requests.add(request);
    return request;
  }

  public List<PracticeRequest> getOpenRequests() {
    List<PracticeRequest> openRequests = new ArrayList<>();
    for (PracticeRequest request : requests) {
      // if the req is open will get added to the list once the status becomes accepted won't be added
      if (request.getStatus().equals("OPEN")) {
        openRequests.add(request);
      }
    }
    return openRequests;
  }

  public Pairing acceptRequest(int requestId, int userId) {
    PracticeRequest requestToAccept = null;
    for (PracticeRequest request : requests) {
      if (request.getId() == requestId) { // found it
        requestToAccept = request; // accepted it
        break;
      }
    } // if you did not find the request
    if (requestToAccept == null) {
      throw new IllegalArgumentException("Practice request not found.");
    }
    if (requestToAccept.getRequesterUserId() == userId) {
      throw new IllegalArgumentException("You cannot accept your own practice request.");
    } // if the request was not open
    if (!requestToAccept.getStatus().equals("OPEN")) {
      throw new IllegalStateException("Practice request is no longer available.");
    }
    // otherwise accept it
    requestToAccept.accept();
    // pairing happens here
    Pairing pairing = new Pairing(nextPairingId, requestToAccept.getId(), requestToAccept.getRequesterUserId(), userId);
    nextPairingId++;
    pairings.add(pairing); // add pairing to the list at the top
    return pairing;
  }

  public List<Pairing> getPairingsForUser(int userId) {
    List<Pairing> userPairings = new ArrayList<>();

    for (Pairing pairing : pairings) {
      if (pairing.getRequesterUserId() == userId || pairing.getPartnerUserId() == userId) {
        userPairings.add(pairing);
      }
    }

    return userPairings;
  }
  // retrieving all pairings
  // give me everythig in pairing objects
  public List<Pairing> getAllPairings() {
    return pairings;
  }

  public List<User> getUsers() {
    return users;
  }

  public User getUser(int userId) {
    for (User user : users) {
      if (user.getID() == userId) {
        return user;
      }
    }
    throw new IllegalArgumentException("User not found.");
  }

  private requestQuestion findPendingRequestedQuestion(int requestId) {
    for (requestQuestion request : requestQuestions) {
      if (request.getId() == requestId) {
        if (!request.getStatus().equals("PENDING")) {
          throw new IllegalStateException("This question has already been reviewed.");
        }
        return request;
      }
    }
    throw new IllegalArgumentException("Requested question not found.");
  }

  // Adds the question to the main list and saves questions.json
  private void addApprovedQuestion(requestQuestion request) {
    questions.add(new Question(nextQuestionId, request.getQuestion(), request.getCategory()));
    nextQuestionId++;
    saveQuestions();
  }

  // Student submits -> PENDING. Admin submits -> auto ACCEPT and goes straight into the question list
  public synchronized requestQuestion submitQuestion(int userId, String text, String category) {
    User user = getUser(userId);

    if (text == null || text.isBlank()) {
      throw new IllegalArgumentException("Question text cannot be empty.");
    }
    String cleanCategory = category == null ? "" : category.trim().toUpperCase();
    if (!VALID_CATEGORIES.contains(cleanCategory)) {
      throw new IllegalArgumentException("Invalid category.");
    }

    requestQuestion request = new requestQuestion(nextRequestQuesID, userId, text.trim(), cleanCategory, "PENDING");
    nextRequestQuesID++;

    if (user.isAdmin()) {
      request.accept();
      addApprovedQuestion(request);
    }

    requestQuestions.add(request);
    saveQuestionRequests();
    return request;
  }

  public synchronized List<requestQuestion> getRequestedQuestions() {
    return new ArrayList<>(requestQuestions);
  }

  public synchronized requestQuestion acceptRequestedQuestion(int requestId) {
    requestQuestion request = findPendingRequestedQuestion(requestId);
    request.accept();
    addApprovedQuestion(request);
    saveQuestionRequests();
    return request;
  }

  public synchronized requestQuestion rejectRequestedQuestion(int requestId) {
    requestQuestion request = findPendingRequestedQuestion(requestId);
    request.reject();
    saveQuestionRequests();
    return request;
  }

  // ================= JSON file storage =================

  private void loadData() {
    try {
      Files.createDirectories(DATA_DIR);

      if (Files.exists(QUESTIONS_FILE)) {
        questions = mapper.readValue(QUESTIONS_FILE.toFile(), new TypeReference<List<Question>>() {});
      } else {
        seedQuestions();
        saveQuestions();
      }

      if (Files.exists(QUESTION_REQUESTS_FILE)) {
        requestQuestions = mapper.readValue(QUESTION_REQUESTS_FILE.toFile(), new TypeReference<List<requestQuestion>>() {});
      }
    } catch (IOException e) {
      throw new IllegalStateException("Could not load data files from the data folder.", e);
    }

    // Continue the ID counters after the highest saved ID
    for (Question q : questions) {
      nextQuestionId = Math.max(nextQuestionId, q.getId() + 1);
    }
    for (requestQuestion r : requestQuestions) {
      nextRequestQuesID = Math.max(nextRequestQuesID, r.getId() + 1);
    }
  }

  private void saveQuestions() {
    try {
      mapper.writerWithDefaultPrettyPrinter().writeValue(QUESTIONS_FILE.toFile(), questions);
    } catch (IOException e) {
      throw new IllegalStateException("Could not save questions.json", e);
    }
  }

  private void saveQuestionRequests() {
    try {
      mapper.writerWithDefaultPrettyPrinter().writeValue(QUESTION_REQUESTS_FILE.toFile(), requestQuestions);
    } catch (IOException e) {
      throw new IllegalStateException("Could not save question_requests.json", e);
    }
  }
}