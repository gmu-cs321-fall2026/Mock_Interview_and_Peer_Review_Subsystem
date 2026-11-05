package app;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class DataStoreJUnitTest {

    @Test
    void testCreateRequest() {
        DataStore store = new DataStore();

        long futureTime = System.currentTimeMillis() + 86400000;
        PracticeRequest request = store.createRequest(101, futureTime);

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
}
