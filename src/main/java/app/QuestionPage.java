package app;

import java.util.ArrayList;
import java.util.List;

/*
 * This class creates a panel for displaying a set number of 
 * questions from the filtered question bank at a time.
 * 
 * for testing purposes, the number of questions that  get 
 * displayed will be 5.
 * 
 * TODO:    - make it respond to page buttons being clicked
 *          - handle edge case behavior
 *              > shouldn't allow page decrement when at page 1
 *              > shouldn't allow page increment when at last page
 *              > should handle having not enogh questions for a full last page
 *              > should display a message when filtered question bank is empty
 *          - 
*/
public class QuestionPage {
    private int pageStart = 0;
    private int pageEnd = 0;
    private int pageNum = 0;
    private int numPages = 0;
    // TODO: need to figure out what value this error should have for it's ID. It shouldn't conflict with other question ID's.
    private Question errorEmpty = new Question(5, "No questions to display, filters too strict.", "ERROR");

    // TODO: Figure out how I access the question bank from the data store
    private List<Question> filteredQuestions = new ArrayList<>();
    private List<Question> currentPage = new ArrayList<>();

    // All of the code from here on will have to be speculative,
    // since I can't write the proper code until I can get a 
    // filtered question bank from the rest of the subsystem.

    // filteredQuestions = <something to access DataStore? I dunno>.questions;
    /*
    // Assuming that filteredQuestions got recieved
    if(filteredQuestions == null){
        throw new IllegalArgumentException("filteredQuestions is null.");
    }
    if(filteredQuestions.size() == 0){
        filteredQuestions.add(errorEmpty);
    }
    // Ensure that there are enough pages for all questions
    numPages = (floor(filteredQuestions.size(), 5)*5)+1;

    // initialize pageEnd with an appropriate value
    // If there aren't enough questions to fill 1 page, pageEnd should be the size of the question bank - 1
    // Otherwise, pageEnd should start at 4 (size of a page - 1);
    if(filteredQuestions.size() < 5){
        pageEnd = filteredQuestions.size()-1;
    }
    else{
        pageEnd = pageStart+5;
    }

    // How should I go about tracking which page the user is on?
    // Maybe have an integer that is kept in and retrieved from DataStore?
    //      Will require someone else to add that to DataStore
    //      Would push the below for loops into a private method

    // create a pointer to the filtered question bank and navigate it to the start of the current page.
    private Question temp = filteredQuestions.getHead();
    for(int i=0 ; i<((pageNum*5)-1) ; i++){
        temp = temp.next();
    }

    // From pageStart "index" in filteredQuestions until pageEnd "index", add each question to 
    // currentPage. Afterwards, maybe return the finished currentPage ArrayList?
    for(int i=pageStart ; i<pageEnd ; i++){
        currentPage.add(temp);
        temp = temp.next;
    }

    */
}
