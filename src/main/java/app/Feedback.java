package app;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Feedback {
    private int id;
    private int pairingId;
    private int authorUserId;
    private int partnerUserId;
    private boolean interviewCompleted; 
    private String text;
    private long timestamp;

    @JsonCreator
    public Feedback(@JsonProperty("id") int id,
                    @JsonProperty("pairingId") int pairingId,
                    @JsonProperty("authorUserId") int authorUserId,
                    @JsonProperty("partnerUserId") int partnerUserId,
                    @JsonProperty("interviewCompleted") boolean interviewCompleted,
                    @JsonProperty("text") String text,
                    @JsonProperty("timestamp") long timestamp) {
        this.id = id;
        this.pairingId = pairingId;
        this.authorUserId = authorUserId;
        this.partnerUserId = partnerUserId;
        this.interviewCompleted = interviewCompleted;
        this.text = text;
        this.timestamp = timestamp;
    }
    public int getId() {
        return id;
    }

    public int getPairingId() {
        return pairingId;
    }

    public int getAuthorUserId() {
        return authorUserId;
    }

    public int getPartnerUserId() {
        return partnerUserId;
    }

    public boolean isInterviewCompleted() {
        return interviewCompleted;
    }

    public String getText() {
        return text;
    }

    public long getTimestamp() {
        return timestamp;
    }
}
