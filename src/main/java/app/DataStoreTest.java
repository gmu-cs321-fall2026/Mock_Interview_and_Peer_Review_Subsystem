package app;

import java.util.List;

public class DataStoreTest {

    public static void main(String[] args) {
        DataStore store = new DataStore();
        long scheduledFor = System.currentTimeMillis() + 86_400_000L;

        System.out.println("=== Practice Request / Pairing Test ===");

        // User 101 creates a request
        PracticeRequest request1 = store.createRequest(101, scheduledFor);
        assertEquals(101, request1.getRequesterUserId(),
                "Request 1 should belong to user 101");
        assertEquals("OPEN", request1.getStatus(),
                "New request should start as OPEN");

        // User 103 creates another request
        PracticeRequest request2 = store.createRequest(103, scheduledFor);
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
        // cancel test
        PracticeRequest cancelTest = store.createRequest(101, scheduledFor);
        store.cancelRequest(cancelTest.getId(), 101);
        assertEquals("CANCELED", cancelTest.getStatus(),
                "Request should be CANCELED");

        System.out.println("PASS: Student can cancel their own open request.");
        // Verify canceled requests disappear from available requests
        assertEquals(false, store.getOpenRequests().contains(cancelTest),
                "Canceled request should not appear in available requests");

        System.out.println("PASS: Canceled request is no longer available.");
        // Sprint 3 - Prevent cancellation by another student
        PracticeRequest anotherRequest = store.createRequest(101, scheduledFor);

        try {
            store.cancelRequest(anotherRequest.getId(), 102);

            throw new AssertionError(
                    "FAIL: Student 102 canceled Student 101's request."
            );

        } catch (IllegalArgumentException exception) {
            System.out.println(
                    "PASS: Student cannot cancel another student's request."
            );
        }
        // Verify canceling one request does not affect another
        PracticeRequest student1Request = store.createRequest(101, scheduledFor);
        PracticeRequest student2Request = store.createRequest(102, scheduledFor);

        store.cancelRequest(student1Request.getId(), 101);

        assertEquals("CANCELED", student1Request.getStatus(),
                "Student 1's request should be canceled");

        assertEquals("OPEN", student2Request.getStatus(),
                "Student 2's request should remain OPEN");

        System.out.println("PASS: Canceling one request does not affect another.");

// Verify the request is still OPEN
        assertEquals("OPEN", anotherRequest.getStatus(),
                "Unauthorized cancellation must not change the request status");
        // Test partner rejection
        PracticeRequest rejectionTest = store.createRequest(101, scheduledFor);

        store.rejectPartner(rejectionTest.getId(), 102);

        assertEquals("OPEN", rejectionTest.getStatus(),
                "Request should remain OPEN after partner rejection");

        assertEquals(true, store.getOpenRequests().contains(rejectionTest),
                "Request should remain available after partner rejection");

        System.out.println("PASS: Original request remains available after rejection.");
        // Verify rejected partner cannot accept the request
        try {
            store.acceptRequest(rejectionTest.getId(), 102);
            throw new AssertionError("FAIL: Rejected partner accepted the request.");
        } catch (IllegalArgumentException exception) {
            System.out.println("PASS: Rejected partner cannot accept the request.");
        }

        assertEquals("OPEN", rejectionTest.getStatus(),
                "Request should remain OPEN after rejected partner tries to accept");

        System.out.println("PASS: Request remains OPEN after rejected partner attempts acceptance.");
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
        PracticeRequest ownRequest = store.createRequest(200, System.currentTimeMillis() + 86_400_000L);

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
