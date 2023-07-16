let btnRef = document.querySelectorAll(".button-option");
let teamRef = document.querySelectorAll(".teams-option");
let popupRef = document.querySelector(".popup");
let gameRef = document.querySelector(".game");
let newgameBtn = document.getElementById("new-game");
let restartBtn = document.getElementById("restart");
let msgRef = document.getElementById("message");
const searchInput = document.querySelector(".searchInput");
const input = searchInput.querySelector("input");
const resultBox = searchInput.querySelector(".resultBox");
const icon = searchInput.querySelector(".icon");

//Winning Pattern Array
let winningPattern = [
    [0, 1, 2],
    [0, 3, 6],
    [2, 5, 8],
    [6, 7, 8],
    [3, 4, 5],
    [1, 4, 7],
    [0, 4, 8],
    [2, 4, 6],
];

let teamsCorrespondance = [
    ['R1', 'C1'],
    ['R1', 'C2'],
    ['R1', 'C3'],
    ['R2', 'C1'],
    ['R2', 'C2'],
    ['R2', 'C3'],
    ['R3', 'C1'],
    ['R3', 'C2'],
    ['R3', 'C3'],
];
//Player 'X' plays first
let P1turn = true;
let count = 0;

let teams = [];
let players = [];
let suggestions = [];
let selectedPlayer = "";
let selectedCaseId = null;

//Disable All Buttons
const disableButtons = () => {
    btnRef.forEach((element) => (element.disabled = true));
    //enable popup
    popupRef.classList.remove("hide");
    gameRef.classList.add("hide");
};

//Enable all buttons (For New Game and Restart)
const enableButtons = () => {
    btnRef.forEach((element) => {
        element.innerText = "";
        element.disabled = false;
        element.style.backgroundColor = "#ffffff";
    });
    //disable popup
    popupRef.classList.add("hide");
};

//
const displayTeams = () => {
    teams = [];
    fetch('teams.json')
        .then(response => response.json())
        .then(data => {
            teamRef.forEach((element) => {
                let index = 0;
                let regenerate = true;
                do {
                    index = Math.floor(Math.random() * data.length);
                    if (!teams.includes(data[index].Id)) {
                        teams.push(data[index].Id);
                        regenerate = false;
                    }
                }
                while (regenerate);
                element.src = "Logos2/" + data[index].Id + ".svg";
                element.title = data[index].Id;
            });
        })
        .catch(error => {
            // Handle any errors that occur during the request
            console.error('Error:', error);
        });
};

const fetchPlayers = () => {
    fetch('nhlplayers.json')
        .then(response => response.json())
        .then(data => {
            data.forEach((element) => {
                players.push(element);
                suggestions.push({ "Name": element.Name, "Pos": element.Pos });
            });
        })
        .catch(error => {
            // Handle any errors that occur during the request
            console.error('Error:', error);
        });
};

//This function is executed when a player wins
const winFunction = (letter) => {
    setTimeout(function() {
        disableButtons();
        if (letter == "X") {
            msgRef.innerHTML = "&#x1F389; 'Player 1' Wins &#x1F389;";
        } else {
            msgRef.innerHTML = "&#x1F389; 'Player 2' Wins &#x1F389;";
        }

    }, 2000);
};

//Function for draw
const drawFunction = () => {
    setTimeout(function() {
        disableButtons();
        msgRef.innerHTML = "&#x1F60E; It's a Draw &#x1F60E;";
    }, 2000);
};

//New Game
newgameBtn.addEventListener("click", () => {
    count = 0;
    P1turn = true;
    document.getElementById("turn").innerHTML = "Now Playing : Player 1";
    document.getElementById("turn").style.backgroundColor = "blue";
    enableButtons();
    displayTeams();
    gameRef.classList.remove("hide");
});

restartBtn.addEventListener("click", () => {
    count = 0;
    P1turn = true;
    document.getElementById("turn").innerHTML = "Now Playing : Player 1";
    document.getElementById("turn").style.backgroundColor = "blue";
    enableButtons();
    displayTeams();
});

//Win Logic
const winChecker = () => {
    //Loop through all win patterns
    for (let i of winningPattern) {
        let [element1, element2, element3] = [
            btnRef[i[0]].title,
            btnRef[i[1]].title,
            btnRef[i[2]].title,
        ];
        //Check if elements are filled
        //If 3 empty elements are same and would give win as would
        if (element1 != "" && (element2 != "") & (element3 != "")) {
            if (element1 == element2 && element2 == element3) {
                //If all 3 buttons have same values then pass the value to winFunction
                winFunction(element1);
            }
        }
    }
};

btnRef.forEach((element) => {
    element.setAttribute("onclick", "selectCase(this)");
});

function selectCase(element) {
    // Bring background color of previously selected case back to white
    btnRef.forEach((element) => {
        if (!element.disabled) element.style.backgroundColor = "#ffffff";
    });
    // Green out the case onclick
    element.style.backgroundColor = "#66ff66";

    // keep track of the selected case position to retrieve associated teams
    selectedCaseId = element.id;

    // highlight and activate the search bar
    input.disabled = false;
    input.focus();
}

// if user press any key and release
input.onkeyup = (e) => {
    let userData = e.target.value; //user enetered data
    let emptyArray = [];
    if (userData) {
        emptyArray = suggestions.filter(function(el) {
            //filtering array value and user characters to lowercase and return only those words which are start with user enetered chars
            return el.Name.toLocaleLowerCase().includes(userData.toLocaleLowerCase());
        });
        emptyArray = emptyArray.map((data) => {
            // passing return data inside li tag
            return data = '<li title="' + data.Name + '">' + data.Name + " (" + data.Pos + ")" + '</li>';
        });
        searchInput.classList.add("active"); //show autocomplete box
        showSuggestions(emptyArray);
        let allList = resultBox.querySelectorAll("li");
        for (let i = 0; i < allList.length; i++) {
            //adding onclick attribute in all li tag
            allList[i].setAttribute("onclick", "selectPlayer(this)");
        }
    } else {
        searchInput.classList.remove("active"); //hide autocomplete box
    }
}

function selectPlayer(player) {
    selectedPlayer = player.title;
    // hide suggestions
    resultBox.innerHTML = '';
    searchInput.classList.remove("active");
    // replace user input by selected player's name
    input.value = selectedPlayer;
}

function verifyPlayerValidity() {
    let player = players.find(element => element.Name == selectedPlayer);
    let teamsId = teamsCorrespondance[selectedCaseId];
    let team1 = document.getElementById(teamsId[0]).title;
    let team2 = document.getElementById(teamsId[1]).title;
    return player.Teams.includes(team1) && player.Teams.includes(team2);
}

function confirmPlayer() {
    if (selectedCaseId != null) {
        let playerIsValid = verifyPlayerValidity();

        element = document.getElementById(selectedCaseId);
        element.style.backgroundColor = "#ffffff";
        input.value = '';
        input.disabled = true;

        if (playerIsValid) {
            if (P1turn) {
                document.getElementById("turn").innerHTML = "Now Playing : Player 2";
                document.getElementById("turn").style.backgroundColor = "red";
                P1turn = false;
                element.style.backgroundColor = "blue";
                element.title = "P1";
                element.innerText = selectedPlayer;
                element.disabled = true;
            } else {
                document.getElementById("turn").innerHTML = "Now Playing : Player 1";
                document.getElementById("turn").style.backgroundColor = "blue";
                P1turn = true;
                element.style.backgroundColor = "red";
                element.title = "P2";
                element.innerText = selectedPlayer;
                element.disabled = true;
            }
            //Increment count on each click
            count += 1;
        } else {
            if (P1turn) {
                P1turn = false;
                document.getElementById("turn").innerHTML = "Now Playing : Player 2";
                document.getElementById("turn").style.backgroundColor = "red";
            } else {
                P1turn = true;
                document.getElementById("turn").innerHTML = "Now Playing : Player 1";
                document.getElementById("turn").style.backgroundColor = "blue";
            }
        }

        selectedCaseId = null;

        if (count == 9) {
            drawFunction();
        }
        //Check for win on every click
        winChecker();
    }
}

function showSuggestions(list) {
    let listData;
    if (!list.length) {
        userValue = inputBox.value;
        listData = '<li>' + userValue + '</li>';
    } else {
        listData = list.join('');
    }
    resultBox.innerHTML = listData;
}

//Enable Buttons and disable popup on page load
window.onload = function() {
    //enableButtons();
    fetchPlayers();
    displayTeams();
}