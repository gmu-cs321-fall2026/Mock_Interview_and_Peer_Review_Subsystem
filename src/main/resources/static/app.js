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
                "This is your request." +
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
    loadRequests();
    loadPairings();
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
                    "<br>"+

                    "Request created: "+
                    formatTimestamp(pairing.timeCreated)+
                    "<br>"+
                    "Request accepted: "+
                    formatTimestamp(pairing.timeAccepted)+
                "</small>"+
            "</div>";

        pairingsDiv.innerHTML += pairingCard;
    }
}

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
                "</small>" +
            "</div>";
            
        pairingsDiv.innerHTML += pairingCard;
    }
}

function showMessage(text) {
    message.textContent = text;
}
//code for formatting timestamp||produced by ChatGPT||
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
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

if (requestsDiv) {
    loadRequests();
}

if (pairingsDiv) {
    loadPairingsForCurrentUser();
}
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
    localStorage.setItem(
        "currentUserId",
        userId
    );
    loadUsers();
    if (requestsDiv) {
        loadRequests();
    }
    if (pairingsDiv) {
        loadPairingsForCurrentUser();
    }
    if (questionsDiv) {
        pageNum = 0;
        loadQuestions();
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