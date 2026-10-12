package app;

//Represents a user request to find a practice partner.
public class PracticeRequest {
    private int id;
    private int requesterUserId;
    private String status;
    private long timestamp;

    public PracticeRequest(int id, int requesterUserId) {
        this.id = id;
        this.requesterUserId = requesterUserId;
        this.status = "OPEN";
        this.timestamp=System.currentTimeMillis();

    }
    public int getId() {
        return id;
    }
    public int getRequesterUserId() {
        return requesterUserId;
    }
    public String getStatus() {
        return status;
    
    }
     public long getTimeCreated() {
        return timestamp;
    }
    //Marks the request as no longer available
    public void accept() {
        status = "ACCEPTED";
    }
}