package app;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/practice")
public class ApiController {
    private DataStore store;
    public ApiController(DataStore store) {
        this.store = store;
    }
    @GetMapping("/questions")
    public List<Question> getQuestions(
            @RequestParam(required = false) String category
    ) {
        List<Question> questions = store.getQuestions(category);
        return questions;
    }

    @GetMapping("/requests")
    public List<PracticeRequest> getOpenRequests() {
        List<PracticeRequest> requests = store.getOpenRequests();
        return requests;
    }
    @PostMapping("/requests")
    @ResponseStatus(HttpStatus.CREATED)
    public PracticeRequest createRequest(
            @RequestHeader("X-User-Id") int userId
    ) {
        PracticeRequest request = store.createRequest(userId);
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
    @GetMapping("/pairings")
    public List<Pairing> getMyPairings( 
            @RequestHeader("X-User-Id") int userId){

                return store.getPairingsForUser(userId);
            }
}