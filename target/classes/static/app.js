const userIdInput = document.getElementById("userId");
const categorySelect = document.getElementById("category");
const questionsDiv = document.getElementById("questions");
const requestsDiv = document.getElementById("requests");
const message = document.getElementById("message");
const createRequestButton = document.getElementById("createRequest");
const pairingsDiv = document.getElementById("pairings");
const nextButton = document.getElementById("nextButton");
const prevButton = document.getElementById("prevButton");
const currPage = document.getElementById("currPage");
const buttonTable = document.getElementById("buttonTable");
nextButton.addEventListener("click", incrementPage);
prevButton.addEventListener("click", decrementPage);
categorySelect.addEventListener("change", resetPageNum); // When switching question categories, reset pageNum
var pageSize = 5; // set to 5 for testing purposes
var pageStart = 0;
var pageEnd = pageSize-1;
var pageNum = 0;
var numPages = 0;

async function loadQuestions() {
    let url = "/api/practice/questions";
    if (categorySelect.value !== "") {
        url = url + "?category=" + categorySelect.value;
    }

    var response = await fetch(url);
    var questions = await response.json();

<<<<<<< HEAD
=======
    //if(questions.length%pageSize > 0){
        // TODO:    Padding filtered question bank to have pageSize * numPages questions in it
        //          for beautification purposes.
    //}
>>>>>>> 35f8eff7284cac915f8fcc117e669549d9e56aeb
    numPages = Math.ceil((questions.length / pageSize));    // ceiling function gets appropriate number of pages
    // Page navigation buttons default to disabled
    nextButton.setAttribute("disabled", "disabled");
    prevButton.setAttribute("disabled", "disabled");
    // If the current page is not the last page, then enable the next page button
    if(pageNum < numPages-1){
        nextButton.removeAttribute("disabled");
    }
    if(pageNum > 0){
        prevButton.removeAttribute("disabled");
    }
    pageStart = pageNum * pageSize; // gets starting index of page in questions

    // gets the ending index of page using starting index and page size.
    pageEnd = pageStart + (pageSize - 1);
    // If the page has less than pageSize questions and you are at the last page,
    // then the ending index for the page should be the ending index for the 
    // question bank. 
    if((questions.length%pageSize > 0) && (pageNum == numPages-1)){
        pageEnd = questions.length - 1;
    }

    questionsDiv.innerHTML = "";

    // Creates page of questions
    for (let i = pageStart; i <= pageEnd; i++) {
        const question = questions[i];
        const questionCard =
            "<div class='card'>" +
                "<div>" + question.text + "</div>" +
                "<small>" + question.category + "</small>" +
            "</div>";

        questionsDiv.innerHTML = questionsDiv.innerHTML + questionCard;
    }
<<<<<<< HEAD
    
=======
>>>>>>> 35f8eff7284cac915f8fcc117e669549d9e56aeb
    // change the state of the next and prev buttons based on whether they are active or not
    prevButton.innerText = "<- Prev";
    
    currPage.innerText = pageNum + 1;
    
    nextButton.innerText = "Next ->";
}

async function resetPageNum(){
    pageNum = 0;
}

async function incrementPage(){
    if(pageNum < (numPages-1)){
        if(pageNum == 0){
            prevButton.removeAttribute("disabled");
        }
        pageNum++;
        if(pageNum == numPages-1){
            nextButton.setAttribute("disabled", "disabled");
        }
    }
    loadQuestions();
}

async function decrementPage(){
    if(pageNum > 0){
        if(pageNum == (numPages - 1)){
            nextButton.removeAttribute("disabled");
        }
        pageNum--;
        if(pageNum == 0){
            prevButton.setAttribute("disabled", "disabled");
        }
    }
    loadQuestions();
}

async function loadRequests() {
    const response = await fetch("/api/practice/requests");
    const requests = await response.json();
    requestsDiv.innerHTML = "";

    if (requests.length === 0) {
        requestsDiv.innerHTML = "<p>No open requests.</p>";
        return;
    }


    for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        const ownRequest =
            Number(userIdInput.value) === request.requesterUserId;

        let requestCard = "<div class='card'>" + "Student " + request.requesterUserId;

        if (ownRequest) {
            requestCard = requestCard + "<p>This is your request.</p>";
        } else {
            requestCard = requestCard + "<button onclick='acceptRequest(" + request.id + ")'>Accept</button>";
        }
        requestCard = requestCard + "</div>";
        requestsDiv.innerHTML = requestsDiv.innerHTML + requestCard;
    }
}

async function createRequest() {
    const response = await fetch(
            "/api/practice/requests",
            {
                method: "POST",
                headers: {
                    "X-User-Id": userIdInput.value
                }
            }
        );
    const data =
        await response.json();
    if (!response.ok) {
        showMessage(data.error);
        return;
    }


    showMessage("Practice request created.");
    loadRequests();
}


async function acceptRequest(requestId) {
    const url = "/api/practice/requests/" + requestId + "/accept";

    const response =
        await fetch(url,
            {
                method: "POST",
                headers: {
                    "X-User-Id": userIdInput.value
                }
            }
        );

    const data =
        await response.json();

    if (!response.ok) {
        showMessage(data.error);
        return;
    }
    const successMessage = "Student " + data.requesterUserId + " paired with Student " + data.partnerUserId + ".";
    showMessage(successMessage);
    loadRequests();
    loadPairings();
}



async function loadPairings() {
    const response = await fetch(
        "/api/practice/pairings",
        {
            headers: {
                "X-User-Id": userIdInput.value
            }
        }
    );

    const pairings = await response.json();

    pairingsDiv.innerHTML = "";

    if (pairings.length === 0) {
        pairingsDiv.innerHTML =
            "<p>You do not have any accepted practice requests.</p>";
        return;
    }

    for (let i = 0; i < pairings.length; i++) {
        const pairing = pairings[i];

        const otherUserId =
            Number(userIdInput.value) === pairing.requesterUserId
                ? pairing.partnerUserId
                : pairing.requesterUserId;

        const pairingCard =
            "<div class='card'>" +
                "<strong>Practice Partner:</strong> Student " +
                otherUserId +
            "</div>";

        pairingsDiv.innerHTML += pairingCard;
    }
}



















function showMessage(text) {
    message.textContent = text;
}

categorySelect.addEventListener("change", loadQuestions);
createRequestButton.addEventListener("click", createRequest);
userIdInput.addEventListener("change", function(){ loadRequests(); loadPairings();});
loadQuestions();
loadRequests();
loadPairings();