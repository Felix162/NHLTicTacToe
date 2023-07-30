let btnRef = document.querySelectorAll(".button-option");
let teamRef = document.querySelectorAll(".teams-option");
let popupRef = document.querySelector(".popup");
let gameRef = document.querySelector(".game");
let newgameBtn = document.getElementById("new-game");
let restartBtn = document.getElementById("restart");
let confirmBtn = document.getElementById("confirm");
let msgRef = document.getElementById("message");
let playerTurnRef = document.getElementById("turn");
let playerGuessesRef = document.getElementById("guess");
let fillRef = document.getElementById("fill");
let tictactoeBtn = document.getElementById("tictactoe");
let gridBtn = document.getElementById("grid");
let gridvariantBtn = document.getElementById("gridvariant");
const searchInput = document.querySelector(".searchInput");
const input = searchInput.querySelector("input");
const resultBox = searchInput.querySelector(".resultBox");
const icon = searchInput.querySelector(".icon");

const TIC_TAC_TOE = "TicTacToe";
const TRADITIONAL_GRID = "Grid";
const GRID_VARIANT = "GridVariant";

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

let powerplayAnswers = [];

let P1turn = true;
let count = 0;

let teams = [];
let players = [];
let suggestions = [];
let selectedPlayer = "";
let selectedCaseId = null;
let selectedGameMode = TIC_TAC_TOE;
let correctguesses = 0;
let countdownInterval = null;
let isCountdownStarted = false;

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
        element.title = "";
        element.disabled = false;
        element.style.backgroundColor = "#ffffff";
    });
    //disable popup
    popupRef.classList.add("hide");
};

//
const displayTeams = () => {
    teams = [];
    fetch('teams.json') /*, { cache: "reload" }*/
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
    fetch('nhlplayers.json') /*, { cache: "reload" }*/
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

const endGameGridFunction = () => {
    setTimeout(function() {
        disableButtons();
        msgRef.innerHTML = "Your final score : " + correctguesses + "/9";
    }, 2000);
};

const endGameVariantGridFunction = (totalPoints) => {
    setTimeout(function() {
        disableButtons();
        msgRef.innerHTML = "Your final score : " + correctguesses + "/9 and a total of " + totalPoints + " points";
    }, 5000);
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
    powerplayAnswers = [];
    selectedPlayer = "";
    selectedCaseId = null;
    countdownInterval = null;
    isCountdownStarted = false;
    correctguesses = 0;
    document.getElementById("turn").innerHTML = "Now Playing : Player 1";
    document.getElementById("turn").style.backgroundColor = "blue";
    enableButtons();
    displayTeams();
    gameRef.classList.remove("hide");
    showElementsBasedOnGameMode();
});

restartBtn.addEventListener("click", () => {
    correctguesses = 0;
    count = 0;
    P1turn = true;
    powerplayAnswers = [];
    selectedPlayer = "";
    selectedCaseId = null;
    countdownInterval = null;
    isCountdownStarted = false;
    document.getElementById("turn").innerHTML = "Now Playing : Player 1";
    document.getElementById("turn").style.backgroundColor = "blue";
    enableButtons();
    displayTeams();
    showElementsBasedOnGameMode();

});

tictactoeBtn.addEventListener("click", () => {
    selectedGameMode = TIC_TAC_TOE;
    newgameBtn.style.visibility = "visible";
    tictactoeBtn.style.backgroundColor = "green";
    gridBtn.style.backgroundColor = "#0a0027";
    gridvariantBtn.style.backgroundColor = "#0a0027";
});

gridBtn.addEventListener("click", () => {
    selectedGameMode = TRADITIONAL_GRID;
    newgameBtn.style.visibility = "visible";
    gridBtn.style.backgroundColor = "green";
    tictactoeBtn.style.backgroundColor = "#0a0027";
    gridvariantBtn.style.backgroundColor = "#0a0027";
});

gridvariantBtn.addEventListener("click", () => {
    selectedGameMode = GRID_VARIANT;
    newgameBtn.style.visibility = "visible";
    gridvariantBtn.style.backgroundColor = "green";
    tictactoeBtn.style.backgroundColor = "#0a0027";
    gridBtn.style.backgroundColor = "#0a0027";
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
    if (selectedGameMode != GRID_VARIANT) {
        // Bring background color of previously selected case back to white
        btnRef.forEach((element) => {
            if (!element.disabled) element.style.backgroundColor = "#ffffff";
        });
    } else {
        btnRef.forEach((element) => {
            if (element.style.backgroundColor == "rgb(102, 255, 102)" && element.innerText == "") element.style.backgroundColor = "#ffffff";
            if (element.innerText != "") element.style.backgroundColor = "blue";
        });
    }

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
            return el.Name.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(userData.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
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
    if (selectedGameMode == TIC_TAC_TOE) {
        confirmPlayerTicTacToe();

    } else if (selectedGameMode == TRADITIONAL_GRID) {
        confirmPlayerTraditionalGrid();

    } else if (selectedGameMode == GRID_VARIANT) {
        confirmPlayerGridVariant();
    }
}

function confirmPlayerTicTacToe() {
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

function confirmPlayerTraditionalGrid() {
    if (selectedCaseId != null) {
        let playerIsValid = verifyPlayerValidity();

        element = document.getElementById(selectedCaseId);
        element.style.backgroundColor = "#ffffff";
        input.value = '';
        input.disabled = true;
        count += 1;

        if (playerIsValid) {
            element.style.backgroundColor = "blue";
            element.innerText = selectedPlayer;
            element.disabled = true;
            correctguesses += 1;
        }

        selectedCaseId = null;
        let guessesLeft = 9 - count;
        playerGuessesRef.innerText = "Guesses left : " + guessesLeft.toString();

        if (count == 9) {
            endGameGridFunction();
        }
    }
}

function confirmPlayerGridVariant() {
    if (selectedCaseId != null) {
        let existingElement = powerplayAnswers.find(element => element.caseID == selectedCaseId);
        if (existingElement != undefined) {
            let index = powerplayAnswers.indexOf(existingElement);
            powerplayAnswers.splice(index, 1);
        }
        powerplayAnswers.push({ caseID: selectedCaseId, player: selectedPlayer });

        element = document.getElementById(selectedCaseId);
        element.style.backgroundColor = "blue";
        element.innerText = selectedPlayer;
        input.value = '';
        input.disabled = true;
        if (powerplayAnswers.length == 9) confirmBtn.style.display = "block";
    }
}

function gridVariantConfirm(extraPoints) {
    let totalPoints = extraPoints;
    powerplayAnswers.forEach((guess, index) => {
        selectedCaseId = guess.caseID;
        selectedPlayer = guess.player;
        element = document.getElementById(selectedCaseId);
        let playerIsValid = verifyPlayerValidity();
        if (playerIsValid) {
            element.style.backgroundColor = "green";
            correctguesses += 1;
            totalPoints += 10 - index;
        } else {
            element.style.backgroundColor = "red";
            totalPoints -= 10 - index;
        }
        element.disabled = true;
    });

    endGameVariantGridFunction(totalPoints);
}

function home() {
    window.location.reload();
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

function showElementsBasedOnGameMode() {
    if (selectedGameMode == TIC_TAC_TOE) {
        playerTurnRef.style.display = 'block';
        playerGuessesRef.style.display = 'none';
        fillRef.style.display = "none";
        confirmBtn.style.display = "none";

    } else if (selectedGameMode == TRADITIONAL_GRID) {
        playerTurnRef.style.display = 'none';
        playerGuessesRef.style.display = 'block';
        fillRef.style.display = "none";
        playerGuessesRef.innerText = "Guesses left : 9";
        confirmBtn.style.display = "none";

    } else if (selectedGameMode == GRID_VARIANT) {
        playerTurnRef.style.display = 'none';
        playerGuessesRef.style.display = 'none';
        fillRef.style.display = "block";
        restartBtn.style.display = "none";

        if (!isCountdownStarted) {
            document.getElementById("fill").style.backgroundColor = "#ffffff";
            setTimeout(function() {
                isCountdownStarted = true;
                targetTime = new Date().getTime() + 2 * 60 * 1000;
                countdownInterval = setInterval(updateCountdown, 1000);
            }, 1000);
        } else {
            isCountdownStarted = false;
            document.getElementById("fill").textContent = "02:00";
            setTimeout(function() {
                isCountdownStarted = true;
                targetTime = new Date().getTime() + 2 * 60 * 1000;
                countdownInterval = setInterval(updateCountdown, 1000);
            }, 1000);
        }
    }
}

//Enable Buttons and disable popup on page load
window.onload = function() {
    fetchPlayers();
}

// Function to update the countdown
function updateCountdown() {
    if (isCountdownStarted) {
        const currentTime = new Date().getTime();
        const remainingTime = targetTime - currentTime;

        if (remainingTime <= 0) {
            document.getElementById("fill").textContent = "00:00";
            document.getElementById("fill").style.backgroundColor = "red";
            clearInterval(countdownInterval);
            gridVariantConfirm(0);
            isCountdownStarted = false;
        } else {
            const minutes = Math.floor(remainingTime / (1000 * 60)).toString().padStart(2, "0");
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000).toString().padStart(2, "0");
            document.getElementById("fill").textContent = minutes + ":" + seconds;
            if (minutes < 1 && seconds <= 30) document.getElementById("fill").style.backgroundColor = "yellow";
        }
    }
}

function confirmGrid() {
    if (isCountdownStarted) {
        const currentTime = new Date().getTime();
        const remainingTime = targetTime - currentTime;
        const minutes = Math.floor(remainingTime / (1000 * 60)).toString().padStart(2, "0");
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000).toString().padStart(2, "0");
        let score = parseInt(minutes) * 60 + parseInt(seconds);
        clearInterval(countdownInterval);
        gridVariantConfirm(score);
        isCountdownStarted = false;
    }
}