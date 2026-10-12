package app;

//Represents two users paired through an accepted pratice request
public class Pairing {

    private int id;
    private int requestId;
    private int requesterUserId;
    private int partnerUserId;
    private long timestampCreated;
    private long timestampAccepted;

    public Pairing(int id, int requestId, int requesterUserId, int partnerUserId,long timestampCreated,long timestampAccepted) {
        this.id = id;
        this.requestId = requestId;
        this.requesterUserId = requesterUserId;
        this.partnerUserId = partnerUserId;
        this.timestampCreated=timestampCreated;
        this.timestampAccepted=timestampAccepted;
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
    public long getTimeCreated(){
        return timestampCreated;
    }
    public long getTimeAccepted(){
        return timestampAccepted;
    }
}