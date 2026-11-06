package app;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.time.Duration;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import static org.mockito.Mockito.*;
import java.util.List;

public class ApiControllerJUnitTest {

    private static final int REQUESTER_ID = 101;
    private static final int PARTNER_ID = 102;
    @Test
    void testControllerCreatesRequest() {
        DataStore store = new DataStore();
        ApiController controller = new ApiController(store);

        long futureTime = System.currentTimeMillis() + Duration.ofDays(1).toMillis();

        PracticeRequest request = controller.createRequest(REQUESTER_ID, Map.of("scheduledFor", futureTime));

        assertEquals(REQUESTER_ID, request.getRequesterUserId());
        assertEquals("OPEN", request.getStatus());
        assertEquals(1, controller.getOpenRequests().size());
    }

    @Test
    void testControllerRejectsMissingDate() {
        DataStore store = new DataStore();
        ApiController controller = new ApiController(store);

        try {
            controller.createRequest(REQUESTER_ID, Map.of());
            fail("Expected an error for missing scheduled date");
        } catch (IllegalArgumentException e) {
            // Expected exception
        }
    }

    @Test
    void testControllerAcceptsRequest() {
        DataStore store = new DataStore();
        ApiController controller = new ApiController(store);

        long futureTime = System.currentTimeMillis() + Duration.ofDays(1).toMillis();

        PracticeRequest request = store.createRequest(REQUESTER_ID, futureTime);

        Pairing pairing = controller.acceptRequest(request.getId(), PARTNER_ID);

        assertEquals("ACCEPTED", request.getStatus());
        assertEquals(PARTNER_ID, pairing.getPartnerUserId());
    }

    @Test
    void testControllerCancelsRequest() {
        DataStore store = new DataStore();
        ApiController controller = new ApiController(store);

        long futureTime = System.currentTimeMillis() + Duration.ofDays(1).toMillis();

        PracticeRequest request = store.createRequest(REQUESTER_ID, futureTime);

        controller.cancelRequest(request.getId(), REQUESTER_ID);

        assertEquals("CANCELED", request.getStatus());
        assertTrue(controller.getOpenRequests().isEmpty());
    }

    @Test
    void testNonAdminCannotViewAllPairings() {
        DataStore store = new DataStore();
        ApiController controller = new ApiController(store);

        try {
            controller.getAllPairings(REQUESTER_ID);
            fail("Non-admin users should not see all pairings");
        } catch (ResponseStatusException e) {
            assertEquals(HttpStatus.FORBIDDEN, e.getStatusCode());
        }
    }

    @Test
    void testGetTechnicalQuestions() {
        DataStore store = mock(DataStore.class);
        ApiController controller = new ApiController(store);

        Question question = new Question(1, "What is Java?", "TECHNICAL");

        when(store.getQuestions("TECHNICAL")).thenReturn(List.of(question));

        List<Question> result = controller.getQuestions("TECHNICAL");


        assertEquals(1, result.size());
        assertEquals("TECHNICAL", result.get(0).getCategory());
        assertEquals("What is Java?", result.get(0).getText());
    }


    @Test
    void testSubmitQuestion() {
        DataStore store = mock(DataStore.class);
        ApiController controller = new ApiController(store);

        String questionText = "What is polymorphism?";

        requestQuestion submitted = new requestQuestion(
            1, REQUESTER_ID, questionText, "TECHNICAL", "PENDING"
        );

        when(store.submitQuestion(REQUESTER_ID, questionText, "TECHNICAL"))
            .thenReturn(submitted);

        requestQuestion result = controller.submitQuestion(
            REQUESTER_ID,
            Map.of("text", questionText, "category", "TECHNICAL")
        );

        assertEquals("PENDING", result.getStatus());
        assertEquals(REQUESTER_ID, result.getUserId());

        verify(store).submitQuestion(REQUESTER_ID, questionText, "TECHNICAL");
    }

    @Test
    void testStudentCannotApproveQuestion() {
        DataStore store = mock(DataStore.class);
        ApiController controller = new ApiController(store);

        User student = new User(REQUESTER_ID, "Student 1", "STUDENT");

        when(store.getUser(REQUESTER_ID)).thenReturn(student);

        try {
            controller.acceptQuestionRequest(1, REQUESTER_ID);
            fail("Student should not be allowed to approve questions");
        } catch (ResponseStatusException e) {
            assertEquals(HttpStatus.FORBIDDEN, e.getStatusCode());
        }

        verify(store, never()).acceptRequestedQuestion(1);
    }

}