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
                "<div>" + question.text + "</div>" +
                "<small>" + question.category + "</small>" +
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
    const successMessage = "Student " + data.requesterUserId + " paired with Student " + data.partnerUserId + ".";
    showMessage(successMessage);
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
                "<strong>Practice Partner:</strong> Student " +
                otherUserId +
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
            "Student " + pairing.requesterUserId +
            " paired with Student " + pairing.partnerUserId +
            "</div>";
        pairingsDiv.innerHTML += pairingCard;
    }
}

function showMessage(text) {
    message.textContent = text;
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