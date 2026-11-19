package app;

public class Pairing {

    private int id;
    private int requestId;
    private int requesterUserId;
    private int partnerUserId;
    private long timestampCreated;
    private long timestampAccepted;
    private long scheduledFor;
    private boolean canceled = false;
    private Long proposedScheduledFor = null;
    private Integer proposedByUserId = null;
    private boolean interviewResult = false;
    private boolean completed = false;
    private Boolean requesterConfirmation = null;
    private Boolean partnerConfirmation = null;

    public Pairing(int id, int requestId, int requesterUserId, int partnerUserId,long timestampCreated,long timestampAccepted,long scheduledFor) {
        this.id = id;
        this.requestId = requestId;
        this.requesterUserId = requesterUserId;
        this.partnerUserId = partnerUserId;
        this.timestampCreated=timestampCreated;
        this.timestampAccepted=timestampAccepted;
        this.scheduledFor=scheduledFor;
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
    public long getScheduledFor() {
    return scheduledFor;
}
    public void proposeNewTime(long newTime, int userId) {
        proposedScheduledFor = newTime;
        proposedByUserId = userId;
    }
    public Long getProposedScheduledFor() {
        return proposedScheduledFor;
    }
    public Integer getProposedByUserId() {
        return proposedByUserId;
    }
    public void acceptProposedTime() {
        scheduledFor = proposedScheduledFor;
        proposedScheduledFor = null;
        proposedByUserId = null;
    }
    public void rejectProposedTime() {
        cancel();
        proposedScheduledFor = null;
        proposedByUserId = null;
    }
    public void cancel() {
        canceled = true;
    }
    public boolean isCanceled() {
        return canceled;
    }

    public boolean isInterviewResult() {
        return interviewResult;
    }
    public boolean isCompleted(){ 
        return completed; 
    }

    public Boolean getRequesterConfirmation() {
        return requesterConfirmation;
    }
    public Boolean getPartnerConfirmation() {
        return partnerConfirmation;
    }

    public void setConfirmation(int userId, boolean result) {
        if (userId == requesterUserId) {
            requesterConfirmation = result;
        } else if (userId == partnerUserId) {
            partnerConfirmation = result;
        } else {
            throw new IllegalArgumentException("You are not part of this pairing.");
        }
        if (Boolean.FALSE.equals(requesterConfirmation) || Boolean.FALSE.equals(partnerConfirmation)) {
            interviewResult = true;
            completed = false;
        } else if (requesterConfirmation != null && partnerConfirmation != null) {
            interviewResult = true;
            completed = true;
        }
    }
    public boolean hasConfirmed(int userId) {
        if (userId == requesterUserId) return requesterConfirmation != null;
        if (userId == partnerUserId) return partnerConfirmation != null;
        return false;
    }

}