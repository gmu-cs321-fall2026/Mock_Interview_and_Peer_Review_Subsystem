package app;

public class Question {
    private int id; //Question ID
    private String text; //Actual question
    private String category;//Which type of question it is
    //Constructor for Question class
    public Question(int id, String text, String category) {
        this.id = id;
        this.text = text;
        this.category = category;
    }
    //Getter methods for ID
    public int getId() {
        return id;
    }
    //Getter methods for text
    public String getText() {
        return text;
    }
    //Getter methods for category
    public String getCategory() {
        return category;
    }
}