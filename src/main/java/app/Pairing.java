package app;

public class Pairing {

    private int id;
    private int requestId;
    private int requesterUserId;
    private int partnerUserId;

    public Pairing(int id, int requestId, int requesterUserId, int partnerUserId) {
        this.id = id;
        this.requestId = requestId;
        this.requesterUserId = requesterUserId;
        this.partnerUserId = partnerUserId;
    }
    public int getId() {
        return id;
    }
    public int getRequestId() {
        return requestId;
    }
    public int getRequesterUserId() {
        return requesterUserId;
    }
    public int getPartnerUserId() {
        return partnerUserId;
    }
}