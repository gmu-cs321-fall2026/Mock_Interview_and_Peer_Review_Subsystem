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
    private int pageNum = 0;    // may end up moving this out to ApiController
    private int numPages = 0;
    //  TODO: Need to figure out what value this error should have for it's ID. It shouldn't conflict with other question ID's.
    private Question errorEmpty = new Question(5, "No questions to display, filters too strict.", "ERROR");
    //  TODO: May need to use this if the webpage builder doesn't handle non-full last question pages correctly.
    //        Will implement that logic and uncomment this initializer if necessary.
    // private Question blankQuestion = new Question(0, "","");

    /* NAME:        makePage
     * 
     * INPUTS:      category    :   String          // May not need this if I can just get a filtered question bank
     *              questions   :   List<Question>  
     *              pageNum     :   int             // May not need this if we store page num in this class
     * 
     * OUTPUTS:     page        :   List<Question>
     * 
     * DESCRIPTION: 
     * This method takes in a List of Questions from the question bank that passed 
     * the filters, and creates a page that is 5 entries long from a starting index
     * that is determined by ((pageNum - 1) * 5) - 1 to an end point that is either
     * 4 indices after the page start, or the end of the filtered question bank.
     * Then return the List of questions in the page.
     * 
     * I may need to create the filtered question bank in-situ, which would mean the
     * inputs would change from (questions, pageNum) to (category, pageNum), and I
     * would initialize filteredQuestions in the method body instead of accepting it
     * as an input parameter.
     */
    List<Question> makePage(List<Question> questions, int pageNum){
        //  Validate that input is usable
        if(questions == null){
            throw new IllegalArgumentException("questions is null!");
        }
        //  If no questions made it past the filter, then add the predefined 
        //  "empty bank" question to the bank to inform user of issue.
        if(questions.size() == 0){
            questions.add(errorEmpty);
        }

        // Initializing values.
        int numPages = (int)Math.floor((questions.size()/5)) + 1; // Ensure there are enough pages to fit all questions 
        List<Question> page = new ArrayList<>();
        // get the start of the page range
        int pageStart = ((pageNum - 1) * 5)-1;

        //  Get the end of the page range
        //  If on last page and page would not be full, use index of last question in questions as pageEnd
        //  ASSUMPTION: The display pane on the website handles blank space correctly when last page isn't full
        //                  If it doesn't, I will add blank dummy questions into last page to fill it up.
        if((pageNum == numPages) && ((questions.size()%5) != 0)){
            // will uncomment this block if last page padding is needed.
            /*//  Pads out the last page with blank questions
             *for(int i = questions.size() ; i<=((numPages * 5)-1) ; i++){
             *  questions.add(blankQuestions);
             *}
             */
            pageEnd = questions.size()-1;
        }
        //  Otherwise, index of pageEnd is 4 indices after pageStart
        //  May need to remove else block while keeping the body of it if I need to pad out last page.
        else{
            pageEnd = pageStart + 4;
        }

        // Add all questions from List within range index range[pageStart - pageEnd] to page  
        for(int i=pageStart ; i<=pageEnd ; i++){
            page.add(questions.get(i));
        }

        return page;
    }

}
