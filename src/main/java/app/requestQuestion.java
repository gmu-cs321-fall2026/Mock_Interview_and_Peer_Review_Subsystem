package app;
 
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
 
public class requestQuestion {
    private int id; //Requested question ID
    private int UserId; //User ID of person who requested the question
    private String question; //Question itself
    private String category; //One of the 4 categories
    private String status; //See if it has been accepted or rejected
 
    @JsonCreator
    public requestQuestion(@JsonProperty("id") int id, @JsonProperty("userId") int UserId, @JsonProperty("question") String question, @JsonProperty("category") String category, @JsonProperty("status") String status) {
        this.id = id;
        this.UserId = UserId;
        this.question = question;
        this.category = category;
        this.status = status;
    }

    //Getter methods for question id, user id, question, category and status
    public int getId() {
        return id;
    }

    public int getUserId() {
        return UserId;
    }

    public String getQuestion() {
        return question;
    }

    public String getCategory() {
        return category;
    }

    public String getStatus() {
        return status;
    }
    
    // Sets status as ACCEPT IF ACCPETED, REJECT IF REJECTED OR PRENDING IF PENDING
    public void accept() {
        this.status = "ACCEPT";
    }
        public void reject() {
        this.status = "REJECT";
    }
        public void pending() {
        this.status = "PENDING";
    }
}