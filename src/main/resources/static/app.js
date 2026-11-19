//Page elements used by the different pratice pages.
const categorySelect = document.getElementById("category");
const questionsDiv = document.getElementById("questions");
const requestsDiv = document.getElementById("requests");
const message = document.getElementById("message");
const createRequestButton = document.getElementById("createRequest");
const pairingsDiv = document.getElementById("pairings");
const pairingFilter = document.getElementById("pairingFilter");
const userSwitcher = document.getElementById("userSwitcher");
const currentUserText = document.getElementById("currentUser");
const requestMenu=document.getElementById("requestMenu");
const requestForm =document.getElementById("requestForm");
const practiceDateTimeInput =document.getElementById("practiceDateTime");
const cancelRequestButton =document.getElementById("cancelRequest");
const practiceCompletedText = document.getElementById("practiceCompleted");
const feedbackListDiv = document.getElementById("feedbackList");
let feedbackWritten = new Set(); // pairing ids this student already wrote feedback for
let confirmPromptTimer = null; // fires when the next interview becomes ready to confirm
//Keep the selected demo user when moving between pages.
let currentUserId = Number(localStorage.getItem("currentUserId"));
 const nextButton = document.getElementById("nextButton");
const prevButton = document.getElementById("prevButton");
const currPage = document.getElementById("currPage");
const buttonTable = document.getElementById("buttonTable");
const readinessFilter = document.getElementById("readinessFilter");
if (nextButton) {
    nextButton.addEventListener("click", incrementPage);
}

if (prevButton) {
    prevButton.addEventListener("click", decrementPage);
}

if (categorySelect) {
    categorySelect.addEventListener("change", resetPageNum);
}
var pageSize = 5; // set to 5 for testing purposes
var pageStart = 0;
var pageEnd = pageSize-1;
var pageNum = 0;
var numPages = 0;
if (!currentUserId) {
    currentUserId = 101;
}
//Loads interview questions with the option of filtering by category.
async function loadQuestions() {
    let url = "/api/practice/questions";
    if (categorySelect.value !== "") {
        url = url + "?category=" + categorySelect.value;
    }
    var response = await fetch(url);
    var questions = await response.json();
    // Load saved question statuses for the current user.
    const statusResponse = await fetch("/api/practice/questions/statuses", {
        headers: {
            "X-User-Id": currentUserId
        }
    });

    if (!statusResponse.ok) {
        questionsDiv.textContent = "Could not load question statuses.";
        return;
    }

    const statuses = await statusResponse.json();

    // Filter questions by readiness, if selected.
    if (readinessFilter.value !== "") {
        questions = questions.filter(question =>
            (statuses[question.id] || "NOT_REVIEWED") === readinessFilter.value
        );
    }

    // Keep the current page valid when filtering changes the number of questions.
    if (pageNum * pageSize >= questions.length) {
        pageNum = 0;
    }

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
    if (questions.length === 0) {
        questionsDiv.innerHTML = "<p>No questions match these filters.</p>";
        currPage.innerText = "0";
        return;
    }
    // Creates page of questions
    for (let i = pageStart; i <= pageEnd; i++) {
        const question = questions[i];
        const status = statuses[question.id] || "NOT_REVIEWED";

        const questionCard =
            "<div class='card'>" +
                "<div>" + escapeHtml(question.text) + "</div>" +
                "<small>" + escapeHtml(question.category) + "</small>" +
                "<div class='readiness-checkboxes'>" +

                "<label><input type='checkbox' " +
                    (status === "DONE" ? "checked" : "") +
                    " onchange='updateQuestionStatus(" +
                    question.id + ", \"DONE\", this.checked)'> Done</label>" +

                "<label><input type='checkbox' " +
                    (status === "REVIEW" ? "checked" : "") +
                    " onchange='updateQuestionStatus(" +
                    question.id + ", \"REVIEW\", this.checked)'> Review</label>" +
                "</div>" +

            "</div>";
        questionsDiv.innerHTML = questionsDiv.innerHTML + questionCard;
    }

    // change the state of the next and prev buttons based on whether they are active or not
    prevButton.innerText = "<- Prev";

    currPage.innerText = pageNum + 1;

    nextButton.innerText = "Next ->";
}

async function updateQuestionStatus(questionId, selectedStatus, checked) {

    // Unchecking the selected box returns the question to Not Reviewed.
    let status = "NOT_REVIEWED";

    if (checked) {
        status = selectedStatus;
    }

    const response = await fetch(
        "/api/practice/questions/" + questionId + "/status",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": currentUserId
            },
            body: JSON.stringify({
                status: status
            })
        }
    );

    if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Could not update question status.");
    }

    // Reload to update both checkboxes and the filtered list.
    loadQuestions();
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
//Loads all currently open practice requests.
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
        currentUserId === request.requesterUserId;

    let requestCard =
        "<div class='card'>" +

            "<div>" +
                "<strong>Student " +
                request.requesterUserId +
                "</strong>" +
            "</div>" +

            "<div class='request-time'>" +
                "<small>" +
                    "Created: " +
                    formatTimestamp(request.timeCreated) +
                "</small>" +
            "</div>" +

            "<div class='request-time'>" +
                "<small>" +
                    "<strong>Practice time:</strong> " +
                    formatTimestamp(request.scheduledFor) +
                "</small>" +
            "</div>";

    if (ownRequest) {
        requestCard +=
            "<div class='request-action'>" +
                "This is your request." + "<button onclick='cancelRequest(" + request.id + ")'>Cancel</button>" +
            "</div>";
    } else {
        requestCard +=
            "<div class='request-action'>" +
                "<button onclick='acceptRequest(" +
                request.id +
                ")'>" +
                    "Accept" +
                "</button>" +
            "</div>";
    }

    requestCard += "</div>";

    requestsDiv.innerHTML += requestCard;
}
}
//Creates a new practice request for the given user.
async function createRequest(event) {
    event.preventDefault();
    practiceDateTimeInput.setCustomValidity("");

    if (!practiceDateTimeInput.reportValidity()) {
        return;
    }

    const scheduledFor = new Date(practiceDateTimeInput.value).getTime();
    if ( Number.isNaN(scheduledFor) ||scheduledFor <= Date.now()) {
        practiceDateTimeInput.setCustomValidity("Please select a future date and time.");

        practiceDateTimeInput.reportValidity();

        return;
    }

    const response = await fetch(
            "/api/practice/requests",
            {
                method: "POST",
                headers: {
                    "Content-Type":"application/json",
                    "X-User-Id": currentUserId
                },
                body: JSON.stringify({scheduledFor:scheduledFor})
            }
        );
    const data =
        await response.json();
    if (!response.ok) {
        showMessage(data.error);
        return;
    }
    //showMessage("Practice request created.");
    closeRequestMenu();
    showMessage("");
    loadRequests();
}

//Accepts another student's practice request.
async function acceptRequest(requestId) {
    const url = "/api/practice/requests/" + requestId + "/accept";
    const response =
        await fetch(url,
            {
                method: "POST",
                headers: {
                    "X-User-Id": currentUserId
                }
            }
        );

    const data =
        await response.json();

    if (!response.ok) {
        showMessage(data.error);
        return;
    }
    showMessage("Practice request accepted.");
    loadRequests();
    loadPairings();
}
// Cancels the current student's own practice request.
async function cancelRequest(requestId) {
    const response = await fetch(
        "/api/practice/requests/" + requestId + "/cancel",
        {
            method: "POST",
            headers: {
                "X-User-Id": currentUserId
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        showMessage(data.error || "Could not cancel request.");
        return;
    }

    showMessage("Practice request canceled.");
    loadRequests();
}


//This function loads pairings for the user. ||PRODUCED BY CHATGPT||
async function loadPairings() {
    const response = await fetch(
        "/api/practice/pairings",
        {
            headers: {
                "X-User-Id": currentUserId
            }
        }
    );

    const pairings = await response.json();

    // Remember which pairings this student has already written feedback for
    feedbackWritten = new Set();
    try {
        const feedbackResponse = await fetch("/api/practice/feedback", {
            headers: { "X-User-Id": currentUserId }
        });
        if (feedbackResponse.ok) {
            const written = await feedbackResponse.json();
            for (let i = 0; i < written.length; i++) {
                if (written[i].authorUserId === currentUserId) {
                    feedbackWritten.add(written[i].pairingId);
                }
            }
        }
    } catch (e) {}

    let filteredPairings = pairings;
    //Filters the list for requests user has accepted or accepted requests user has made. ||PRODUCED BY CHATGPT||
    if(pairingFilter){
        if(pairingFilter.value==="created"){
            filteredPairings=pairings.filter(pairing=>pairing.requesterUserId===currentUserId);
        }else if(pairingFilter.value === "accepted"){
            filteredPairings=pairings.filter(pairing=>pairing.partnerUserId===currentUserId);
        }
    }

    pairingsDiv.innerHTML = "";
    scheduleConfirmPrompt(pairings);

    if (filteredPairings.length === 0) {
        pairingsDiv.innerHTML =
            "<p>No results found.</p>";
        return;
    }

    for (let i = 0; i < filteredPairings.length; i++) {
        const pairing = filteredPairings[i];

        const otherUserId =
            currentUserId === pairing.requesterUserId
                ? pairing.partnerUserId
                : pairing.requesterUserId;

        const pairingCard =
            "<div class='card'>" +
                "<div>"+
                    "<strong>Practice Partner:</strong> Student " +
                    otherUserId +
                "</div>"+
                "<small>"+
                    "<strong Practice time:</strong> "+
                    formatTimestamp(pairing.scheduledFor)+
                    "<br>"+ (pairing.proposedScheduledFor != null
                ? "<strong>Proposed time:</strong> " +
                formatTimestamp(pairing.proposedScheduledFor) +
                "<br>"
                : "") +

                    "Request created: "+
                    formatTimestamp(pairing.timeCreated)+
                    "<br>"+
                    "Request accepted: "+
                    formatTimestamp(pairing.timeAccepted)+
                "</small><br>"+
            (pairing.proposedScheduledFor != null &&
            pairing.proposedByUserId !== currentUserId
                ? "<button onclick='acceptProposedTime(" + pairing.id + ")'>Accept</button> " +
                "<button onclick='rejectProposedTime(" + pairing.id + ")'>Reject</button><br>"
                : "") +
            interviewSectionHtml(pairing) +
            "</div>";

        pairingsDiv.innerHTML += pairingCard;
    }
}
// The current user's own answer for this pairing (null = not answered yet).
function myConfirmation(pairing) {
    return pairing.requesterUserId === currentUserId
        ? pairing.requesterConfirmation
        : pairing.partnerConfirmation;
}
// True when the current user is in this pairing, has not answered yet, the pairing
// is not canceled/decided, and the scheduled date and time has passed.
// Both students get this prompt (each confirms the interview for the other).
function needsInterviewConfirmation(pairing) {
    return (pairing.requesterUserId === currentUserId || pairing.partnerUserId === currentUserId) &&
        !pairing.canceled &&
        !pairing.interviewResult &&
        (myConfirmation(pairing) === null || myConfirmation(pairing) === undefined) &&
        pairing.scheduledFor <= Date.now();
}
function otherUserIdFor(pairing) {
    return currentUserId === pairing.requesterUserId ? pairing.partnerUserId : pairing.requesterUserId;
}
// Builds the bottom part of a pairing card: confirmation prompt, result, or the usual buttons.
function interviewSectionHtml(pairing) {
    const answer = myConfirmation(pairing);
    const answered = answer !== null && answer !== undefined;
    // 1. Student answered but still owes feedback: shown in the same box as the prompt
    if (answered && !pairing.canceled && !feedbackWritten.has(pairing.id)) {
        return "<div class='interview-confirm'>" +
                "<strong>You answered: " + (answer ? "Yes" : "No") + "</strong><br>" +
                "<label for='feedbackText-" + pairing.id + "'>Feedback is required:</label><br>" +
                "<textarea class='feedback-input' id='feedbackText-" + pairing.id + "' rows='4' " +
                    "style='width: 100%; box-sizing: border-box; margin: 6px 0;' " +
                    "placeholder='How did your partner do in the interview?' " +
                    "oninput='saveFeedbackDraft(" + pairing.id + ", this.value)'>" +
                    escapeHtml(feedbackDrafts[pairing.id] || "") +
                "</textarea>" +
                //rating section produced by ChatGPT
                "<div class='feedback-rating-row'>" +

                    "<label for='feedbackRating-" +
                        pairing.id +
                        "'>" +
                        "Rating:" +
                    "</label>" +

                    "<select class='feedback-rating' " +
                        "id='feedbackRating-" +
                        pairing.id +
                        "'>" +

                        "<option value=''>Select Rating</option>" +
                        "<option value='1'>1</option>" +
                        "<option value='2'>2</option>" +
                        "<option value='3'>3</option>" +
                        "<option value='4'>4</option>" +
                        "<option value='5'>5</option>" +

                        "</select>" +

                 "</div>" +
                //end section produced by chatGpt
                "<div class='interview-result failed' id='feedbackError-" + pairing.id + "'></div>" +
                "<button onclick='submitFeedback(" + pairing.id + ")'>Submit Feedback</button>" +
            "</div>";
    }
    // 2. Final result
    if (pairing.completed) {
        return "<div class='interview-result success'>Interview completed successfully</div>";
    }
    if (pairing.interviewResult) {
        return "<div class='interview-result failed'>Interview was not completed</div>";
    }
    // 3. Prompt (both students get it once the scheduled time has passed)
    if (needsInterviewConfirmation(pairing)) {
        return "<div class='interview-confirm'>" +
                "<strong>Was the interview with Student " + otherUserIdFor(pairing) + " completed?</strong><br>" +
                "<button onclick='confirmInterview(" + pairing.id + ", true)'>Yes</button> " +
                "<button onclick='confirmInterview(" + pairing.id + ", false)'>No</button>" +
            "</div>";
    }
    // 4. Answered and feedback sent, waiting on the other student
    if (!pairing.canceled && answer === true) {
        return "<div class='interview-confirm'>You confirmed the interview. Waiting forF Student " +
            otherUserIdFor(pairing) + " to confirm.</div>";
    }
    return "<button onclick='changeDateTime(" + pairing.id + ")'>Change Date & Time</button>" +
        "<button onclick='cancelPairing(" + pairing.id + ")'>Cancel Session</button>";
}
// Reloads the pairings at the moment the next interview's time passes so the Yes/No prompt appears.
function scheduleConfirmPrompt(pairings) {
    clearTimeout(confirmPromptTimer);
    const now = Date.now();
    let nextDue = null;
    for (let i = 0; i < pairings.length; i++) {
        const p = pairings[i];
        if ((p.partnerUserId === currentUserId || p.requesterUserId === currentUserId) && !p.canceled && !p.interviewResult && p.scheduledFor > now) {
            if (nextDue === null || p.scheduledFor < nextDue) {
                nextDue = p.scheduledFor;
            }
        }
    }
    if (nextDue !== null) {
        // setTimeout cannot handle delays over ~24 days, so cap it and re-check
        const delay = Math.min(nextDue - now + 500, 2147483647);
        confirmPromptTimer = setTimeout(loadPairingsForCurrentUser, delay);
    }
}
// Sends the current student's yes/no answer about the interview to the API.
async function confirmInterview(pairingId, passed) {
    const response = await fetch(
        "/api/practice/pairings/" + pairingId + "/confirm",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": currentUserId
            },
            body: JSON.stringify({ passed: passed })
        }
    );
    if (!response.ok) {
        let data = {};
        try { data = await response.json(); } catch (e) {}
        alert(data.error || "Unable to confirm the interview.");
        await loadPairingsForCurrentUser();
        return;
    }
    await loadPairingsForCurrentUser();
    await loadPracticeCompleted();
}
// Feedback is written inside the same box as the interview prompt (see interviewSectionHtml).
// Drafts are remembered so typed text is not lost if the cards are redrawn.
const feedbackDrafts = {};
function saveFeedbackDraft(pairingId, value) {
    feedbackDrafts[pairingId] = value;
}
async function submitFeedback(pairingId) {
    const box = document.getElementById("feedbackText-" + pairingId);
    const errorDiv = document.getElementById("feedbackError-" + pairingId);
    const text = box ? box.value : "";
    const ratingBox=document.getElementById("feedbackRating-"+pairingId);
    const rating =ratingBox ? Number(ratingBox.value):0;
    if (text.trim() === "") {
        if (errorDiv) {
            errorDiv.textContent = "Please type your feedback before submitting.";
        }
        return;
    }
    //produced by GPT
    if(rating <1 || rating>5){
        if(errorDiv){
            errorDiv.textContent="Please select a rating from 1 to 5.";
        }
        return;
    }
    //end produced by GPT
    const response = await fetch(
        "/api/practice/pairings/" + pairingId + "/feedback",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": currentUserId
            },
            body: JSON.stringify({ text: text,rating: rating })
        }
    );
    if (!response.ok) {
        let data = {};
        try { data = await response.json(); } catch (e) {}
        if (data.error && data.error.indexOf("already submitted") !== -1) {
            delete feedbackDrafts[pairingId];
            await loadPairingsForCurrentUser();
            return;
        }
        if (errorDiv) {
            errorDiv.textContent = data.error || "Unable to submit feedback.";
        }
        return;
    }
    delete feedbackDrafts[pairingId];
    showMessage("Feedback submitted. Thank you!");
    await loadPairingsForCurrentUser();
    await loadPracticeCompleted();
}
// Feedback page: shows feedback the user wrote and received, with a search box.
let allFeedback = [];
let userNames = {}; // user id -> username
async function loadFeedback() {
    if (!feedbackListDiv) {
        return;
    }
    const usersResponse = await fetch("/api/practice/users");
    if (usersResponse.ok) {
        const users = await usersResponse.json();
        userNames = {};
        for (let i = 0; i < users.length; i++) {
            userNames[users[i].id] = users[i].name;
        }
    }
    const response = await fetch("/api/practice/feedback", {
        headers: { "X-User-Id": currentUserId }
    });
    if (!response.ok) {
        feedbackListDiv.innerHTML = "<p>Unable to load feedback.</p>";
        return;
    }
    allFeedback = await response.json();
    showFeedback();
}
function usernameOf(userId) {
    return userNames[userId] || ("Student " + userId);
}
// True if the search text matches the pairing id, the time stamp, or either student's username.
function feedbackMatches(f, query) {
    if (query === "") {
        return true;
    }
    const d = new Date(f.timestamp);
    const iso = d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");
    const fields = [
        String(f.pairingId),
        formatTimestamp(f.timestamp),
        iso,
        usernameOf(f.authorUserId),
        usernameOf(f.partnerUserId)
    ];
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].toLowerCase().includes(query)) {
            return true;
        }
    }
    return false;
}
function showFeedback() {
    const box = document.getElementById("feedbackSearch");
    const query = box ? box.value.trim().toLowerCase() : "";
    const directionBox = document.getElementById("feedbackDirection");
    const direction = directionBox ? directionBox.value : "all";
    const items = allFeedback.filter(function(f) {
        if (direction === "mine" && f.authorUserId !== currentUserId) {
            return false; // only feedback this student wrote
        }
        if (direction === "aboutMe" && !(f.partnerUserId === currentUserId && f.authorUserId !== currentUserId)) {
            return false; // only feedback the other student wrote about this student
        }
        return feedbackMatches(f, query);
    });
    if (items.length === 0) {
        feedbackListDiv.innerHTML = (query === "" && direction === "all")
            ? "<p>No feedback yet.</p>"
            : "<p>No feedback matches your search.</p>";
        return;
    }
    let html = "";
    for (let i = 0; i < items.length; i++) {
        const f = items[i];
        const mine = f.authorUserId === currentUserId;
        html +=
            "<div class='card'>" +
                "<div><strong>" +
                    (mine ? "You wrote this about " + escapeHtml(usernameOf(f.partnerUserId))
                          : escapeHtml(usernameOf(f.authorUserId)) + " wrote this" +
                            (f.partnerUserId === currentUserId ? " about you"
                                : " about " + escapeHtml(usernameOf(f.partnerUserId)))) +
                "</strong></div>" +
                "<small>Pairing ID: " + f.pairingId +
                    " | Interview with: " + escapeHtml(usernameOf(mine ? f.partnerUserId : f.authorUserId)) +
                    " | Interview: " + (f.interviewCompleted ? "Completed" : "Not completed") +
                    " | Rating: " + (f.rating >=1&&f.rating<=5 ? f.rating + "/5":"Not rated")+
                    " | " + formatTimestamp(f.timestamp) + "</small>" +
                "<p>" + escapeHtml(f.text) + "</p>" +
            "</div>";
    }
    feedbackListDiv.innerHTML = html;
}
const feedbackSearchBox = document.getElementById("feedbackSearch");
if (feedbackSearchBox) {
    feedbackSearchBox.addEventListener("input", showFeedback);
}
const feedbackDirectionBox = document.getElementById("feedbackDirection");
if (feedbackDirectionBox) {
    feedbackDirectionBox.addEventListener("change", showFeedback);
}
// Updates the "Practice Completed: Yes/No" indicator using the API.
async function loadPracticeCompleted() {
    if (!practiceCompletedText) {
        return;
    }
    try {
        const response = await fetch("/api/practice/practice-completed", {
            headers: { "X-User-Id": currentUserId }
        });
        if (!response.ok) {
            practiceCompletedText.textContent = "Practice Completed: Unknown";
            return;
        }
        const completed = await response.json();
        practiceCompletedText.textContent =
            "Practice Completed: " + (completed === true ? "Yes" : "No");
    } catch (e) {
        practiceCompletedText.textContent = "Practice Completed: Unknown";
    }
}
async function cancelPairing(pairingId) {
    const confirmed = confirm("Are you sure you want to cancel this session?");

    if (!confirmed) {
        return;
    }
    const response = await fetch(
        "/api/practice/pairings/" + pairingId + "/cancel",
        {
            method: "POST",
            headers: {
                "X-User-Id": currentUserId
            }
        }
    );
    if (!response.ok) {
        alert("Unable to cancel the session.");
        return;
    }
    await loadPairings();
}// end of cancel pairing
async function changeDateTime(pairingId) {
    const dateInput = document.createElement("input");
    dateInput.type = "datetime-local";
    document.querySelectorAll('input[type="datetime-local"]').forEach(input => {
        input.remove();
    });
    document.querySelector(
        `button[onclick="changeDateTime(${pairingId})"]`
    ).insertAdjacentElement("afterend", dateInput);
    dateInput.showPicker();
    dateInput.addEventListener("change", async () => {
        const newDateTime = dateInput.value;
        console.log("Selected date and time:", newDateTime);


        if (newDateTime === null) {
            return;
        }
        const newTime = new Date(newDateTime.replace(" ", "T")).getTime();
        if (!Number.isFinite(newTime)) {
            alert("Please enter a valid date and time.");
            return;
        }
        const response = await fetch(
            "/api/practice/pairings/" + pairingId + "/propose-time?newTime=" + newTime,
            {
                method: "POST",
                headers: {"X-User-Id": currentUserId}
            }
        );
        if (!response.ok) {
            alert("Unable to propose a new date and time.");
            return;
        }

        alert("New date and time proposed successfully.");
        await loadPairings();
    });
}// end of change time
async function acceptProposedTime(pairingId) {
    const response = await fetch(
        "/api/practice/pairings/" + pairingId + "/accept-time",
        {
            method: "POST",
            headers: { "X-User-Id": currentUserId }
        }
    );

    if (!response.ok) {
        alert("Unable to accept the proposed time.");
        return;
    }

    alert("New appointment time accepted.");
    await loadPairings();
}// end of accept proposed time
async function rejectProposedTime(pairingId) {
    const confirmed = confirm(
        "Rejecting this proposal will cancel the entire session. Continue?"
    );

    if (!confirmed) {
        return;
    }

    const response = await fetch(
        "/api/practice/pairings/" + pairingId + "/reject-time",
        {
            method: "POST",
            headers: { "X-User-Id": currentUserId }
        }
    );

    if (!response.ok) {
        alert("Unable to reject the proposed time.");
        return;
    }

    alert("Proposal rejected. Session canceled.");
    await loadPairings();
}// end of reject proposed time
//Admin view shows all pairings, not just those of the user
async function loadAdminPairings() {
    const response = await fetch(
        "/api/practice/admin/pairings",
        {
            headers: {
                "X-User-Id": currentUserId
            }
        }
    );
    const pairings = await response.json();
    pairingsDiv.innerHTML = "";
    for (let i = 0; i < pairings.length; i++) {
        const pairing = pairings[i];
        const pairingCard =
            "<div class='card'>" +
                "<div>" +
                    "Student " +
                    pairing.requesterUserId +
                    " paired with Student " +
                    pairing.partnerUserId +
                "</div>" +
                "<small>" +
                    "Request created: " +
                    formatTimestamp(pairing.timeCreated) +
                    "<br>" +
                    "Request accepted: " +
                    formatTimestamp(pairing.timeAccepted) +
                    "<br>" +
                    (pairing.canceled ? "Interview Status: Canceled"
                        : pairing.completed ? "Interview Status: Interview completed successfully"
                        : pairing.interviewResult ? "Interview Status: Interview not completed"
                        : "Interview Status: Not confirmed yet") +
                "</small>" +
            "</div>";
            
        pairingsDiv.innerHTML += pairingCard;
    }
}

function showMessage(text) {
    if (!message) {
        return;
    }
    message.textContent = text;
}
//code for formatting timestamp||produced by ChatGPT||
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

//helper for minimum date ||produced by ChatGPT||
function formatDateTimeInput(date) {
    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    const hours =
        String(date.getHours()).padStart(2, "0");

    const minutes =
        String(date.getMinutes()).padStart(2, "0");

    return (
        year +
        "-" +
        month +
        "-" +
        day +
        "T" +
        hours +
        ":" +
        minutes
    );
}
//open the menu ||produced by ChatGPT||
function openRequestMenu() {
    if (!requestMenu || !practiceDateTimeInput) {
        return;
    }

    practiceDateTimeInput.value = "";

    practiceDateTimeInput.min =
        formatDateTimeInput(new Date());

    practiceDateTimeInput.setCustomValidity("");

    requestMenu.hidden = false;

    practiceDateTimeInput.focus();
}
//close the menu ||produced by ChatGPT||
function closeRequestMenu() {
    if (!requestMenu) {
        return;
    }

    requestMenu.hidden = true;
    if (practiceDateTimeInput) {
        practiceDateTimeInput.value = "";
        practiceDateTimeInput.setCustomValidity("");
    }
}






if (categorySelect) {
    categorySelect.addEventListener("change", loadQuestions);
    loadQuestions();
}
//menu listeners ||produced by ChatGPT||
if (createRequestButton) {
    createRequestButton.addEventListener("click", openRequestMenu);
}
if (requestForm) {
    requestForm.addEventListener(
        "submit",
        createRequest
    );
}

if (cancelRequestButton) {
    cancelRequestButton.addEventListener(
        "click",
        closeRequestMenu
    );
}
if (practiceDateTimeInput) {
    practiceDateTimeInput.addEventListener(
        "input",
        function() {
            practiceDateTimeInput.setCustomValidity("");
        }
    );
}
if (pairingFilter) {
    pairingFilter.addEventListener("change", loadPairings);
}

if (userSwitcher) {
    loadUsers();
}

loadPracticeCompleted();

if (requestsDiv) {
    loadRequests();
}

if (pairingsDiv) {
    loadPairingsForCurrentUser();
}
if (feedbackListDiv) {
    loadFeedback();
}
// Auto-refresh every 5 seconds so a student sees their partner's confirmation (and the
// interview prompt appearing) without reloading the page.
setInterval(function() {
    loadPracticeCompleted();
    if (pairingsDiv && !document.querySelector('input[type="datetime-local"]') &&
        !document.querySelector('.feedback-input')) {
        loadPairingsForCurrentUser();
    }
}, 5000);
if (readinessFilter) {
    readinessFilter.addEventListener("change", function() {
        pageNum = 0;
        loadQuestions();
    });
}
//Builds the demo user buttons and updates role-specific page selections.
async function loadUsers() {
    const response =
        await fetch("/api/practice/users");

    const users =
        await response.json();

    userSwitcher.innerHTML = "";
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const button =
            document.createElement("button");
        button.textContent =
            user.name;
        if (user.id === currentUserId) {
            button.classList.add("selected-user");

            currentUserText.textContent =
                "Current User: " +
                user.name +
                " (" +
                user.role +
                ")";
        }
        button.addEventListener(
            "click",
            function() {
                selectUser(user.id);
            }
        );

        userSwitcher.appendChild(button);
    }
    const currentUser = users.find(u => u.id === currentUserId);
    const adminSection = document.getElementById("adminOnly");
    if (adminSection) {
        const isAdmin = currentUser && currentUser.role === "ADMIN";
        adminSection.style.display = isAdmin ? "block" : "none";
        if (isAdmin) {
            loadQuestionRequests();
        }
    }

}
//Choose the student or admin pairing view based on selected role.
async function loadPairingsForCurrentUser() {
    const response = await fetch("/api/practice/users");
    const users = await response.json();
    const currentUser = users.find(user => user.id === currentUserId);
    if (currentUser && currentUser.role === "ADMIN") {
        loadAdminPairings();
    }else{
        loadPairings();
    }
}
//Changes the active demo user and refreshes data shown on page.
function selectUser(userId) {
    currentUserId = userId;
    showMessage("");
    localStorage.setItem(
        "currentUserId",
        userId
    );
    loadUsers();
    loadPracticeCompleted();
    if (requestsDiv) {
        loadRequests();
    }
    if (pairingsDiv) {
        loadPairingsForCurrentUser();
    }
    if (feedbackListDiv) {
        loadFeedback();
    }
    if (questionsDiv) {
        pageNum = 0;
        loadQuestions();
    }
    if (document.getElementById("dashboardStats")) {
        loadDashboard();
    }
}
// Converts user-entered text into safe text so it displays as text instead of HTML.
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

const submitQuestionButton = document.getElementById("submitQuestion");
const questionRequestsDiv = document.getElementById("questionRequests");
//Sends a suggested interview question to the backend
async function submitQuestion() {
    const textBox = document.getElementById("questionText");
    const categoryBox = document.getElementById("questionCategory");
 
    const response = await fetch("/api/practice/question-requests", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-User-Id": currentUserId
        },
        body: JSON.stringify({
            text: textBox.value,
            category: categoryBox.value
        })
    });
    const data = await response.json();
 
    if (!response.ok) {
        showMessage(data.error || data.message || "Something went wrong.");
        return;
    }
 
    textBox.value = "";
    if (data.status === "ACCEPT") {
        showMessage("Question added to the question list.");
    } else {
        showMessage("Question sent to the admin for review.");
    }
    loadQuestionRequests();
}
 
//Admin only: lists every requested question with Accept / Reject buttons
async function loadQuestionRequests() {
    if (!questionRequestsDiv) {
        return;
    }
    const response = await fetch("/api/practice/admin/question-requests", {
        headers: { "X-User-Id": currentUserId }
    });
    if (!response.ok) {
        questionRequestsDiv.innerHTML = "";
        return;
    }
    const requests = await response.json();
 
    if (requests.length === 0) {
        questionRequestsDiv.innerHTML = "<p>No requested questions.</p>";
        return;
    }
 
    questionRequestsDiv.innerHTML = "";
    for (let i = 0; i < requests.length; i++) {
        const r = requests[i];
        let card =
            "<div class='card'>" +
                "<div>" + escapeHtml(r.question) + "</div>" +
                "<small>" + escapeHtml(r.category) + " | Requested by user " + r.userId +
                " | Status: " + escapeHtml(r.status) + "</small>";
 
        if (r.status === "PENDING") {
            card = card +
                "<div style='margin-top:8px'>" +
                    "<button onclick='reviewQuestion(" + r.id + ", \"accept\")'>Accept</button> " +
                    "<button onclick='reviewQuestion(" + r.id + ", \"reject\")'>Reject</button>" +
                "</div>";
        }
        card = card + "</div>";
        questionRequestsDiv.innerHTML += card;
    }
}

//Handles an admin accepting or rejecting a submitted question.
async function reviewQuestion(requestId, action) {
    const response = await fetch(
        "/api/practice/admin/question-requests/" + requestId + "/" + action,
        {
            method: "POST",
            headers: { "X-User-Id": currentUserId }
        }
    );
    const data = await response.json();
 
    if (!response.ok) {
        showMessage(data.error || data.message || "Something went wrong.");
        return;
    }
    showMessage(action === "accept" ? "Question accepted and added." : "Question rejected.");
    loadQuestionRequests();
}
 
if (submitQuestionButton) {
    submitQuestionButton.addEventListener("click", submitQuestion);
}
 

//Collapsible sidebar ---
function openNav() {
    const sidebar = document.getElementById("mySidebar");
    if (!sidebar) {
        return;
    }
    sidebar.classList.add("open");
    document.getElementById("sidebarOverlay").classList.add("open");
    document.getElementById("menuButton").setAttribute("aria-expanded", "true");
}

function closeNav() {
    const sidebar = document.getElementById("mySidebar");
    if (!sidebar) {
        return;
    }
    sidebar.classList.remove("open");
    document.getElementById("sidebarOverlay").classList.remove("open");
    document.getElementById("menuButton").setAttribute("aria-expanded", "false");
}

//Pressing Escape also closes the sidebar
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeNav();
    }
});

//Highlight the sidebar link for the page the user is currently on
const currentPage = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".sidebar a").forEach(function(link) {
    if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
    }
});