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
 *              > should handle having not enogh questions for a full last page     DONE
 *              > should display a message when filtered question bank is empty     DONE
*/
public class QuestionPage {
    private int pageStart = 0;
    private int pageEnd = 0;
    private int pageNum = 0;    // may end up moving this out to ApiController
    private int numPages = 0;
    //  TODO: Need to figure out what value this error should have for it's ID. It shouldn't conflict with other question ID's.
    private Question errorEmpty = new Question(0, "No questions to display, filters too strict.", "ERROR");
    // will uncomment if last page needs padding in order to display properly.
    //private Question blankQuestion = new Question(0, "","");
    DataStore store = new DataStore();
    List<Question> questions = new ArrayList<>();

    /* NAME:        makePage
     * 
     * INPUTS:      category    :   String
     * 
     * OUTPUTS:     page        :   List<Question>
     * 
     * DESCRIPTION: 
     * This method takes in category to create a filtered question bank from, 
     * and creates a page that is 5 entries long from a starting index that is 
     * determined by ((pageNum - 1) * 5) - 1 to an end point that is either 4 
     * indices after the page start, or the end of the filtered question bank. 
     * Then return the List of questions in the page.
     */
    List<Question> makePage(String category){
        //  Validate that input is usable
        if(category == null){
            throw new IllegalArgumentException("category is null!");
        }
        // Initializing values.
        List<Question> page = new ArrayList<>();
        // Fill the question bank
        initFilteredBank(category);

        //  Create a DataBank to create a filtered question bank from
        //  If no questions made it past the filter, then add the predefined 
        //  "empty bank" question to the bank to inform user of issue.
        if(questions.size() == 0){
            questions.add(errorEmpty);
        }


        // Add all questions from List within range index range[pageStart - pageEnd] to page  
        for(int i=pageStart ; i<=pageEnd ; i++){
            page.add(questions.get(i));
        }

        return page;
    }

    /* NAME:    incrementPage
     * 
     * INPUTS:  none
     * 
     * OUTPUTS: none
     * 
     * DESCRIPTION: 
     * Increments the local pageNum value and updates the pageStart and pageEnd
     *  values to match. Should not go past last page.
     */
    void incrementPage(){
        if(pageNum == numPages){
            return;
        }
        pageNum++;
        pageStart = ((pageNum - 1) * 5)-1;
        //  Get the end of the page range
        //  If on last page and page would not be full, use index of last question in questions as pageEnd
        //  ASSUMPTION: The display pane on the website handles blank space correctly when last page isn't full
        //                  If it doesn't, I will add blank dummy questions into last page to fill it up.
        if((pageNum == numPages) && ((questions.size()%5) != 0)){
            pageEnd = questions.size()-1;
        }
        //  Otherwise, index of pageEnd is 4 indices after pageStart
        //  May need to remove else block while keeping the body of it if I need to pad out last page.
        else{
            pageEnd = pageStart + 4;
        }
    }

    /* NAME:    decrementPage
     * 
     * INPUTS:  none
     * 
     * OUTPUTS: none
     * 
     * DESCRIPTION: 
     * Decrements the local pageNum value and updates the pageStart and pageEnd
     * values to match. Should not go below page 1.
     */
    void decrementPage(){
        if(pageNum == 1){
            return;
        }
        pageNum--;
        pageStart = ((pageNum - 1) * 5)-1;
        
        pageEnd = pageStart + 4;
    }

    /* NAME:    initFilteredBank
     * 
     * INPUTS:  category    :   String
     * 
     * OUTPUTS: none
     * 
     * DESCRIPTION: 
     * Gets the question bank from data store and makes filtered bank to store 
     * locally so that I don't have to constantly recreate the filtered bank.
     * This method also initializes the numPages and pageNum values. 
     */
    private void initFilteredBank(String category){
        store = new DataStore();
        questions = store.getQuestions(category);
        // will uncomment this block if last page padding is needed.
        /*//  Pads out the last page with blank questions
         *for(int i = questions.size() ; i<=((numPages * 5)-1) ; i++){
         *  questions.add(blankQuestions);
         *}
         */
        numPages = (int)Math.floor((questions.size()/5))+1;
        pageNum = 1;
    }
}
