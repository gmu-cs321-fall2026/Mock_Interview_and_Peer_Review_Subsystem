package app;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

//REST Endpoints for the website
@RestController
@RequestMapping("/api/practice")
public class ApiController {
    private DataStore store;
    public ApiController(DataStore store) {
        this.store = store;
    }
    //Returns all questions or a specific category
    @GetMapping("/questions")
    public List<Question> getQuestions(
            @RequestParam(required = false) String category
    ) {
        List<Question> questions = store.getQuestions(category);
        return questions;
    }
    //Returns the list of pratice requests
    @GetMapping("/requests")
    public List<PracticeRequest> getOpenRequests() {
        List<PracticeRequest> requests = store.getOpenRequests();
        return requests;
    }
    @PostMapping("/requests")
    @ResponseStatus(HttpStatus.CREATED)
    public PracticeRequest createRequest(
            @RequestHeader("X-User-Id") int userId,
            @RequestBody Map<String, Long> body
    ) {
        Long scheduledFor=body.get("scheduledFor");
        if(scheduledFor==null){
            throw new IllegalArgumentException("a practice date and time is required.");
        }
        PracticeRequest request = store.createRequest(userId,scheduledFor);
        return request;
    }

    @PostMapping("/requests/{id}/accept")
    public Pairing acceptRequest(
            @PathVariable int id,
            @RequestHeader("X-User-Id") int userId
    ) {
        Pairing pairing = store.acceptRequest(id, userId);
        return pairing;
    }
    @ExceptionHandler({
            IllegalArgumentException.class,
            IllegalStateException.class
    })
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleError(RuntimeException exception) {
        Map<String, String> errorMessage = Map.of("error", exception.getMessage());
        return errorMessage;
    }
    //Returns pairings that involve given user
    @GetMapping("/pairings")
    public List<Pairing> getMyPairings( 
            @RequestHeader("X-User-Id") int userId){

                User user = store.getUser(userId);
                if(!user.isAdmin()){
                    
                }
                return store.getPairingsForUser(userId);
            }
    //Admin-only endpoint for viewing all pairings
    @GetMapping("/admin/pairings")
    public List<Pairing> getAllPairings(
            @RequestHeader("X-User-Id") int userId
    ) {
        User user = store.getUser(userId);
        if (!user.isAdmin()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Admin access required."
            );
        }
        return store.getAllPairings();
    }
    //Provides demo users for the frontend
    @GetMapping("/users")
    public List<User> getUsers() {
        return store.getUsers();
    }
    //--- JASON PERM EDITED BY AI --
    //Admin only: see every requested question
    @GetMapping("/admin/question-requests")
    public List<requestQuestion> getQuestionRequests(
            @RequestHeader("X-User-Id") int userId
    ) {
        requireAdmin(userId);
        return store.getRequestedQuestions();
    }
 
    @PostMapping("/admin/question-requests/{id}/accept")
    public requestQuestion acceptQuestionRequest(
            @PathVariable int id,
            @RequestHeader("X-User-Id") int userId
    ) {
        requireAdmin(userId);
        return store.acceptRequestedQuestion(id);
    }
 
    @PostMapping("/admin/question-requests/{id}/reject")
    public requestQuestion rejectQuestionRequest(
            @PathVariable int id,
            @RequestHeader("X-User-Id") int userId
    ) {
        requireAdmin(userId);
        return store.rejectRequestedQuestion(id);
    }
    private void requireAdmin(int userId) {
        User user = store.getUser(userId);
        if (!user.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required.");
        }
    }

    //Accepts a new question submission from the current user
    @PostMapping("/question-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public requestQuestion submitQuestion(@RequestHeader("X-User-Id") int userId, @RequestBody Map<String, String> body) {
        return store.submitQuestion(userId, body.get("text"), body.get("category"));
    }

    // Get the current user's question statuses.
    @GetMapping("/questions/statuses")
    public Map<Integer, String> getQuestionStatuses(
            @RequestHeader("X-User-Id") int userId
    ) {
        return store.getQuestionStatuses(userId);
    }

    // Update one question's status for the current user.
    @PutMapping("/questions/{id}/status")
    public Map<String, String> setQuestionStatus(
            @PathVariable int id,
            @RequestHeader("X-User-Id") int userId,
            @RequestBody Map<String, String> body
    ) {
        String status = store.setQuestionStatus(
            userId, id, body.get("status")
        );

        return Map.of("status", status);
    }
}
