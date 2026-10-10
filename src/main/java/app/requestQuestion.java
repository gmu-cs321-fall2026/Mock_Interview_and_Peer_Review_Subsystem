package app;

public class requestQuestion {
    private int id; //Requested question ID
    private int UserId; //User ID of person who requested the question
    private String question; //Question itself
    private String category; //One of the 4 categories
    private boolean status; //See if it has been accepted or rejected

    public requestQuestion(int id, int UserId, String question, String category, boolean status) {
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

    public boolean getStatus() {
        return status;
    }
    
    // Sets status to be true if accepted and false if rejected
    public void setStatus(boolean status) {
        this.status = status;
    }
}