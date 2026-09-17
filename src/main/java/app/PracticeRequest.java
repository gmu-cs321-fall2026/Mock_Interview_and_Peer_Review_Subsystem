package app;

public class PracticeRequest {
    private int id;
    private int requesterUserId;
    private String status;

    public PracticeRequest(int id, int requesterUserId) {
        this.id = id;
        this.requesterUserId = requesterUserId;
        this.status = "OPEN";
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
    public void accept() {
        status = "ACCEPTED";
    }
}