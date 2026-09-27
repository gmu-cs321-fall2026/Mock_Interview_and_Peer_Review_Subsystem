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
                    2, "Tell me about a time you faced a difficult challenge.", "BEHAVIORAL"
            ));
            questions.add(new Question(
                    3, "Describe a time when you worked successfully as part of a team.", "BEHAVIORAL"
            ));
            questions.add(new Question(
                    4, "Tell me about a time you made a mistake and what you learned from it.", "BEHAVIORAL"
            ));
            questions.add(new Question(
                    5, "Describe a situation where you had to meet a tight deadline.", "BEHAVIORAL"
            ));
            questions.add(new Question(
                    6, "Tell me about a time you disagreed with a teammate.", "BEHAVIORAL"
            ));
            questions.add(new Question(
                    7, "Describe a project you are particularly proud of.", "BEHAVIORAL"
            ));
            questions.add(new Question(
                    8, "How do you prioritize tasks when you have multiple deadlines?", "BEHAVIORAL"
            ));
            questions.add(new Question(
                    9, "What is the difference between a stack and a queue?", "TECHNICAL"
            ));
            questions.add(new Question(
                    10, "What is the difference between an array and a linked list?", "TECHNICAL"
            ));
            questions.add(new Question(
                    11, "What is the purpose of an API?", "TECHNICAL"
            ));
            questions.add(new Question(
                    12, "What is the difference between authentication and authorization?", "TECHNICAL"
            ));
            questions.add(new Question(
                    13, "What is a database primary key?", "TECHNICAL"
            ));
            questions.add(new Question(
                    14, "What is the purpose of version control systems such as Git?", "TECHNICAL"
            ));
            questions.add(new Question(
                    15, "What is the difference between HTTP GET and POST requests?", "TECHNICAL"
            ));
            questions.add(new Question(
                    16, "Estimate how many cups of coffee are sold on campus each day.", "CASE"
            ));
            questions.add(new Question(
                    17, "How would you estimate the number of students who attend a career fair?", "CASE"
            ));
            questions.add(new Question(
                    18, "A company has seen a 20% decrease in job applications. How would you investigate why?", "CASE"
            ));
            questions.add(new Question(
                    19, "How would you design a system to help students find available mock interview partners?", "CASE"
            ));
            questions.add(new Question(
                    20, "A website becomes significantly slower after a new feature is released. How would you troubleshoot the problem?", "CASE"
            ));
            questions.add(new Question(
                    21, "How would you improve the process for matching students with mentors?", "CASE"
            ));
            questions.add(new Question(
                    22, "Why are you interested in the technology industry?", "INDUSTRY"
            ));
            questions.add(new Question(
                    23, "What technology trend do you think will have the biggest impact on software development?", "INDUSTRY"
            ));
            questions.add(new Question(
                    24, "What skills do you think are most important for a successful software engineer?", "INDUSTRY"
            ));
            questions.add(new Question(
                    25, "How do you stay informed about changes and developments in the technology industry?", "INDUSTRY"
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
            if (request.getId() == requestId) {// found it
                requestToAccept = request;// accepted it
                break;
            }
        }// if you did not find the request
        if (requestToAccept == null) {
            throw new IllegalArgumentException(
                    "Practice request not found."
            );
        }
        if (requestToAccept.getRequesterUserId() == userId) {
            throw new IllegalArgumentException("You cannot accept your own practice request.");
        }// if the request was not open
        if (!requestToAccept.getStatus().equals("OPEN")) {
            throw new IllegalStateException(
                    "Practice request is no longer available."
            );
        }
        // otherwise accept it
        requestToAccept.accept();
        // pairing happens here
        Pairing pairing = new Pairing(
                nextPairingId,
                requestToAccept.getId(),
                requestToAccept.getRequesterUserId(),
                userId
        );
        






        nextPairingId++;
        pairings.add(pairing);// add pairing to the list at the top
        return pairing;
    }
    public List<Pairing> getPairingsForUser(int userId) {

            List<Pairing> userPairings = new ArrayList<>();

            for (Pairing pairing : pairings) {
                if (pairing.getRequesterUserId() == userId ||pairing.getPartnerUserId() == userId) {
                    userPairings.add(pairing);
                }
            }

        return userPairings;
        }
}