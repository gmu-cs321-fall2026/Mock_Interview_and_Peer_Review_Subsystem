package app;

public class Question {
    private int id;
    private String text;
    private String category;

    public Question(int id, String text, String category) {
        this.id = id;
        this.text = text;
        this.category = category;
    }
    public int getId() {
        return id;
    }
    public String getText() {
        return text;
    }
    public String getCategory() {
        return category;
    }
}