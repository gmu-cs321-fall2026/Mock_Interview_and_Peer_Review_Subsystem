package app;

import java.util.List;

public class DataStoreTest {

    public static void main(String[] args) {
        DataStore store = new DataStore();

        System.out.println("=== Practice Request / Pairing Test ===");

        // User 101 creates a request
        PracticeRequest request1 = store.createRequest(101);
        assertEquals(101, request1.getRequesterUserId(),
                "Request 1 should belong to user 101");
        assertEquals("OPEN", request1.getStatus(),
                "New request should start as OPEN");

        // User 103 creates another request
        PracticeRequest request2 = store.createRequest(103);
        assertEquals(103, request2.getRequesterUserId(),
                "Request 2 should belong to user 103");

        System.out.println("PASS: Requests created successfully.");

        // User 102 accepts user 101's request
        Pairing pairing1 = store.acceptRequest(request1.getId(), 102);

        assertEquals(101, pairing1.getRequesterUserId(),
                "Pairing 1 requester should be 101");
        assertEquals(102, pairing1.getPartnerUserId(),
                "Pairing 1 partner should be 102");
        assertEquals("ACCEPTED", request1.getStatus(),
                "Request 1 should now be ACCEPTED");

        // User 104 accepts user 103's request
        Pairing pairing2 = store.acceptRequest(request2.getId(), 104);

        assertEquals(103, pairing2.getRequesterUserId(),
                "Pairing 2 requester should be 103");
        assertEquals(104, pairing2.getPartnerUserId(),
                "Pairing 2 partner should be 104");

        System.out.println("PASS: Requests accepted and pairings created.");

        // Verify user 101 sees only pairing 1
        List<Pairing> user101Pairings = store.getPairingsForUser(101);
        assertEquals(1, user101Pairings.size(),
                "User 101 should have exactly one pairing");
        assertEquals(pairing1.getId(), user101Pairings.get(0).getId(),
                "User 101 should see pairing 1");

        // Verify user 102 sees only pairing 1
        List<Pairing> user102Pairings = store.getPairingsForUser(102);
        assertEquals(1, user102Pairings.size(),
                "User 102 should have exactly one pairing");
        assertEquals(pairing1.getId(), user102Pairings.get(0).getId(),
                "User 102 should see pairing 1");

        // Verify user 103 sees only pairing 2
        List<Pairing> user103Pairings = store.getPairingsForUser(103);
        assertEquals(1, user103Pairings.size(),
                "User 103 should have exactly one pairing");
        assertEquals(pairing2.getId(), user103Pairings.get(0).getId(),
                "User 103 should see pairing 2");

        // Verify user 104 sees only pairing 2
        List<Pairing> user104Pairings = store.getPairingsForUser(104);
        assertEquals(1, user104Pairings.size(),
                "User 104 should have exactly one pairing");
        assertEquals(pairing2.getId(), user104Pairings.get(0).getId(),
                "User 104 should see pairing 2");

        // Verify unrelated user sees nothing
        List<Pairing> user999Pairings = store.getPairingsForUser(999);
        assertEquals(0, user999Pairings.size(),
                "Unrelated user 999 should not see any pairings");

        System.out.println("PASS: Pairing visibility is correct.");

        // Optional safety tests.
        // Change this to true after adding the duplicate/self-accept checks.
        boolean runSafetyTests = false;

        if (runSafetyTests) {
            testCannotAcceptAlreadyAcceptedRequest(store, request1);
            testCannotAcceptOwnRequest(store);
        }

        System.out.println();
        System.out.println("========================================");
        System.out.println("ALL TESTS PASSED");
        System.out.println("========================================");
    }
    
    private static void testCannotAcceptAlreadyAcceptedRequest(
            DataStore store,
            PracticeRequest request
    ) {
        try {
            store.acceptRequest(request.getId(), 500);
            throw new AssertionError(
                    "FAIL: An already accepted request was accepted again."
            );
        } catch (IllegalStateException exception) {
            System.out.println(
                    "PASS: Already accepted requests cannot be accepted again."
            );
        }
    }

    private static void testCannotAcceptOwnRequest(DataStore store) {
        PracticeRequest ownRequest = store.createRequest(200);

        try {
            store.acceptRequest(ownRequest.getId(), 200);
            throw new AssertionError(
                    "FAIL: A user was allowed to accept their own request."
            );
        } catch (IllegalArgumentException exception) {
            System.out.println(
                    "PASS: Users cannot accept their own practice requests."
            );
        }
    }

    private static void assertEquals(
            Object expected,
            Object actual,
            String message
    ) {
        if (!expected.equals(actual)) {
            throw new AssertionError(
                    "FAIL: " + message
                            + "\nExpected: " + expected
                            + "\nActual:   " + actual
            );
        }
    }
}