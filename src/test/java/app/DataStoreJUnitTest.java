package app;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.time.Duration;

public class DataStoreJUnitTest {
    private static final int REQUESTER_ID = 101;
    private static final int PARTNER_ID = 102;

    @Test
    void testCreateRequest() {
        DataStore store = new DataStore();

        long futureTime = System.currentTimeMillis() + Duration.ofDays(1).toMillis();
        PracticeRequest request = store.createRequest(REQUESTER_ID, futureTime);

        assertEquals(101, request.getRequesterUserId());
        assertEquals("OPEN", request.getStatus());
    }
    @Test
    public void testPairingCreation() {
        // Create a new Pairing object
        Pairing pairing = new Pairing(1, 1, 101, 102, 1620000000L, 1620003600L, 1620086400L);

        // Verify that the fields are set correctly
        assertEquals(1, pairing.getId());
        assertEquals(101, pairing.getRequesterUserId());
        assertEquals(102, pairing.getPartnerUserId());
        assertEquals(1620000000L, pairing.getTimeCreated());
        assertEquals(1620003600L, pairing.getTimeAccepted());
        assertEquals(1620086400L, pairing.getScheduledFor());
    }

    @Test
    void testCreateRequestPastDate() {
        DataStore store = new DataStore();

        long pastTime = System.currentTimeMillis()
                - Duration.ofDays(1).toMillis();

        try {
            store.createRequest(REQUESTER_ID, pastTime);
            fail("Expected an IllegalArgumentException");
        } catch (IllegalArgumentException e) {
            // Expected exception, so the test passes
        }
    }

    @Test
    void testAcceptRequest() {
        DataStore store = new DataStore();
        long futureTime = System.currentTimeMillis() + Duration.ofDays(1).toMillis();
        PracticeRequest request = store.createRequest(REQUESTER_ID, futureTime);

        Pairing pairing = store.acceptRequest(request.getId(), PARTNER_ID);

        assertEquals("ACCEPTED", request.getStatus());
        assertEquals(REQUESTER_ID, pairing.getRequesterUserId());
        assertEquals(PARTNER_ID, pairing.getPartnerUserId());
        assertEquals(futureTime, pairing.getScheduledFor());
    }

    @Test
    void testAcceptOwnRequest() {
        DataStore store = new DataStore();
        long futureTime = System.currentTimeMillis() + Duration.ofDays(1).toMillis();
        PracticeRequest request = store.createRequest(REQUESTER_ID, futureTime);

        assertThrows(IllegalArgumentException.class, () -> {
            store.acceptRequest(request.getId(), REQUESTER_ID);
        });

        assertEquals("OPEN", request.getStatus());
        assertTrue(store.getAllPairings().isEmpty());
    }

    @Test
    void testCancelRequest() {
        DataStore store = new DataStore();
        long futureTime = System.currentTimeMillis() + Duration.ofDays(1).toMillis();
        PracticeRequest request = store.createRequest(REQUESTER_ID, futureTime);

        store.cancelRequest(request.getId(), REQUESTER_ID);

        assertEquals("CANCELED", request.getStatus());
        assertTrue(store.getOpenRequests().isEmpty());
    }

    @Test
    void testCannotAcceptTwice() {
        DataStore store = new DataStore();
        long futureTime = System.currentTimeMillis() + Duration.ofDays(1).toMillis();

        PracticeRequest request = store.createRequest(REQUESTER_ID, futureTime);

        // First acceptance works
        store.acceptRequest(request.getId(), PARTNER_ID);

        // Second acceptance should fail
        try {
            store.acceptRequest(request.getId(), 103);
            fail("Request should not be accepted twice");
        } catch (IllegalStateException e) {
            // Expected exception
        }

        // Make sure only one pairing was created
        assertEquals(1, store.getAllPairings().size());
    }

    @Test
    void testCannotCancelOtherUsersRequest() {
        DataStore store = new DataStore();
        long futureTime = System.currentTimeMillis() + Duration.ofDays(1).toMillis();

        PracticeRequest request = store.createRequest(REQUESTER_ID, futureTime);

        try {
            store.cancelRequest(request.getId(), PARTNER_ID);
            fail("Other users should not be able to cancel a request");
        } catch (IllegalArgumentException e) {
            // Expected exception
        }

        assertEquals("OPEN", request.getStatus());
    }

    @Test
    void testRejectedPartnerCannotAccept() {
        DataStore store = new DataStore();

        long futureTime = System.currentTimeMillis()
                + Duration.ofDays(1).toMillis();

        PracticeRequest request = store.createRequest(REQUESTER_ID, futureTime);

        store.rejectPartner(request.getId(), PARTNER_ID);

        try {
            store.acceptRequest(request.getId(), PARTNER_ID);
            fail("Rejected partner should not be able to accept");
        } catch (IllegalArgumentException e) {
            // Expected exception
        }

        assertEquals("OPEN", request.getStatus());
        assertEquals(0, store.getAllPairings().size());
    }
}
