package app;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataStore {

    private List<Question> questions = new ArrayList<>();
    private List<PracticeRequest> requests = new ArrayList<>();
    private List<Pairing> pairings = new ArrayList<>();

    private int nextRequestId = 1;
    private int nextPairingId = 1;


    public DataStore() {
        questions.add(new Question(
                1, "Tell me about yourself.", "BEHAVIORAL"
        ));
        questions.add(new Question(
                2,"What is the difference between a stack and a queue?","TECHNICAL"
        ));
        questions.add(new Question(
                3,"Estimate how many cups of coffee are sold on campus each day.","CASE"
        ));
        questions.add(new Question(
                4,"Why are you interested in this industry?","INDUSTRY"
        ));
    }


    public List<Question> getQuestions(String category) {
        if (category == null || category.isBlank()) {
            return questions;
        }
        List<Question> matchingQuestions = new ArrayList<>();
        for (Question question : questions) {
            if (question.getCategory().equalsIgnoreCase(category)) {
                matchingQuestions.add(question);
            }
        }
        return matchingQuestions;
    }


    public PracticeRequest createRequest(int userId) {
        PracticeRequest request =
                new PracticeRequest(nextRequestId, userId);
        nextRequestId++;
        requests.add(request);
        return request;
    }


    public List<PracticeRequest> getOpenRequests() {
        List<PracticeRequest> openRequests = new ArrayList<>();
        for (PracticeRequest request : requests) {
            if (request.getStatus().equals("OPEN")) {
                openRequests.add(request);
            }
        }
        return openRequests;
    }


    public Pairing acceptRequest(int requestId, int userId) {
        PracticeRequest requestToAccept = null;
        for (PracticeRequest request : requests) {
            if (request.getId() == requestId) {
                requestToAccept = request;
                break;
            }
        }
        if (requestToAccept == null) {
            throw new IllegalArgumentException(
                    "Practice request not found."
            );
        }
        requestToAccept.accept();
        Pairing pairing = new Pairing(
                nextPairingId,
                requestToAccept.getId(),
                requestToAccept.getRequesterUserId(),
                userId
        );
        nextPairingId++;
        pairings.add(pairing);
        return pairing;
    }
}