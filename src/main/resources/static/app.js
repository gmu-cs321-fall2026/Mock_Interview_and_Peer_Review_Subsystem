const categorySelect = document.getElementById("category");
const questionsDiv = document.getElementById("questions");
const requestsDiv = document.getElementById("requests");
const message = document.getElementById("message");
const createRequestButton = document.getElementById("createRequest");
const pairingsDiv = document.getElementById("pairings");
const pairingFilter = document.getElementById("pairingFilter");
const userSwitcher = document.getElementById("userSwitcher");
const currentUserText = document.getElementById("currentUser");
let currentUserId = Number(localStorage.getItem("currentUserId"));
 
if (!currentUserId) {
    currentUserId = 101;
}


async function loadQuestions() {
    let url = "/api/practice/questions";
    if (categorySelect.value !== "") {
        url = url + "?category=" + categorySelect.value;
    }
 
    const response = await fetch(url);
    const questions = await response.json();
 
    questionsDiv.innerHTML = "";
 
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionCard =
            "<div class='card'>" +
                "<div>" + escapeHtml(question.text) + "</div>" + //partial edit by adding escapehtml by Claude when doing jason
                "<small>" + escapeHtml(question.category) + "</small>" +
            "</div>";
 
        questionsDiv.innerHTML = questionsDiv.innerHTML + questionCard;
    }
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
            currentUserId === request.requesterUserId;

        let requestCard = "<div class='card'>" + "Student " + request.requesterUserId+"</strong></div>"+"<small>Created: "+formatTimestamp(request.timeCreated)+"</small>";

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


    //showMessage("Practice request created.");
    loadRequests();
}


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

if (categorySelect) {
    categorySelect.addEventListener("change", loadQuestions);
    loadQuestions();
}

if (createRequestButton) {
    createRequestButton.addEventListener("click", createRequest);
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
}
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
 
const submitQuestionButton = document.getElementById("submitQuestion");
const questionRequestsDiv = document.getElementById("questionRequests");
 
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
 