/**
 * Constant and variable definitions
 */

/**
 * Shapes assigned to the cards
 * @type {string[]}
 */
const shapes = [
    "fa-chess", "fa-chess",
    "fa-chess-bishop", "fa-chess-bishop",
    "fa-chess-board", "fa-chess-board",
    "fa-chess-king", "fa-chess-king",
    "fa-chess-knight", "fa-chess-knight",
    "fa-chess-pawn", "fa-chess-pawn",
    "fa-chess-queen", "fa-chess-queen",
    "fa-chess-rook", "fa-chess-rook"
];

/**
 * First threshold to remove a star
 * @type {number}
 */
const ratingThreshold1 = 35;

/**
 * Second threshold to remove a star
 * @type {number}
 */
const ratingThreshold2 = 45;

/**
 * Object containing the open cards
 * @type {{}}
 */
let openCards = {};

/**
 * Number of moves used by the player in a match
 * @type {number}
 */
let moves = 0;

/**
 * Number of matched cards
 * @type {number}
 */
let matchCount = 0;


/**
 * Event listener to initialize the game when the page is ready
 */
document.addEventListener('DOMContentLoaded', newGame);

/**
 * Event listeners for the 'Restart Game' button
 */
document.querySelector('.fa-redo').addEventListener('click', newGame);

/**
 * Event listeners for the modal's buttons
 */
document.querySelector('.modal-close').addEventListener('click', closeModal);
document.querySelector('.modal-no').addEventListener('click', closeModal);
document.querySelector('.modal-yes').addEventListener('click', function(){
    newGame();
    closeModal();
});


/**
 * Classes
 */

/**
 * Timer class to keep track of elapsed time
 */
class MemoryTimer {
    /**
	 * Class constructor
     */
	constructor() {
		this.node = document.querySelector(".timer");
		this.ticks = 0;
		this.interval = 0;
	}

    /**
	 * Adds leading zero to a digit
     * @param subject
     * @returns {string}
     */
	format(subject) {
		return subject.toString().padStart(2, "0");
	}

    /**
	 * Returns the number of elapsed seconds
     * @returns {number}
     */
	getTicks() {
		return this.ticks;
	}

    /**
	 * Transforms seconds to a HH:MM:SS formatted timestamp
     * @param ticks
     * @returns {string}
     */
	getTime(ticks) {
		let hours = this.format(Math.floor(ticks / 3600));
		ticks = ticks % 3600;
		let minutes = this.format(Math.floor(ticks / 60));
		let seconds = this.format(ticks % 60);
		return `${hours}:${minutes}:${seconds}`;
	}

    /**
	 * Resets timer parameters to their initial values
     */
	reset() {
		this.stop();

		this.ticks = 0;
		this.interval = 0;
		this.node.innerText = "00:00:00";
	}

    /**
	 * Starts counting seconds (if there isn't already an active timee)
     */
	start() {
		if (this.interval !== 0) {
			return;
		}

		this.interval = setInterval("timer.tick()", 1000);
	}

    /**
	 * Stops the timee
     */
	stop() {
		clearInterval(this.interval);
	}

    /**
	 * Increments number of seconds elapsed and updates the timer shown on the page
     */
	tick() {
		this.ticks++;
		this.update();
	}

    /**
	 * Updates the timer shown on the page
     */
	update() {
		this.node.innerText = this.getTime(this.ticks);
	}
}
var timer = new MemoryTimer();

/**
 * Storage class used for the leaderboard
 */
class MemoryStorage {
    /**
	 * Clears the browsers local storage (Empties the leaderboard)
     */
	static clear() {
		localStorage.clear();
	}

    /**
	 * Gets an item from the local storage
     * @param key
     * @returns {string | null}
     */
	static getItem(key) {
		if (this.isAvailable() === false) {
			return;
		}
		return localStorage.getItem(key);
	}

    /**
	 * Checks if localStorage is available for use
	 * (Becasue in Edge we don't have permissions to use it)
     * @returns {boolean}
     */
	static isAvailable() {
		return (typeof localStorage) !== "undefined";
	}

    /**
	 * Gets all items in ascending order from the local storage
     * @param key
     * @returns {Array}
     */
	static getItems(key) {
		var records = [];
		if (this.isAvailable()) {
            for (let key in localStorage) {
            	let item = this.getItem(key);
                if (item !== null) {
                    records.push(item);
				}
            }
        }
		return records;
	}

    /**
	 * Stores an item in the local storage
     * @param key
     * @param value
     */
	static setItem(key, value) {
        if (this.isAvailable() === false) {
            return;
        }
		localStorage.setItem(key, value);
	}
}


/**
 * Functions
 */

/**
 * Adds a card to the open cards
 * @param key
 * @param value
 */
function addToOpenCards(key, value) {
    openCards[key] = value;
}

/**
 * Checks if all the cards are matched
 * Displays a congratulations message including a leaderboard
 * Offers the player to play a new game
 */
function checkWinner() {
    if (matchCount !== shapes.length) {
		return;
    }

	timer.stop();

    let ticks = timer.getTicks();
    let timeSpent = timer.getTime(ticks);
    MemoryStorage.setItem(Date.now(), ticks);

    showModal();
}

function closeModal() {
    document.querySelector(".modal").classList.add('hidden');
}

/**
 * Removes a star when a threshold is reached
 * @returns {undefined}
 */
function decreaseStars() {
    if (moves === ratingThreshold1) {
        return removeStar();
    }

    if (moves === ratingThreshold2) {
        return removeStar();
    }
}

/**
 * Removes all cards from the deck
 */
function emptyDeck() {
	let cards = document.querySelectorAll('.card');
	for (let card of cards) {
		card.remove();
  	}
}

/**
 * Removes all entries from the leaderboard shown in the UI
 */
function emptyLeaderboard() {
    let records = document.querySelectorAll(".leaderboard ul li");
    for (let record of records) {
        record.remove();
    }
}

/**
 * Fetches the leaderboard from the browser's local storage
 * @returns {Array}
 */
function getLeaderboard() {
    var records = MemoryStorage.getItems();

    var leaderboard = [];
    for (let record of records) {
        if (record !== null) {
            leaderboard.push(timer.getTime(record));
        }
    }
    leaderboard.sort();

    return leaderboard;
}

/**
 * Increases the number of matched cards
 */
function incrementMatchCount() {
    matchCount += 2;
}

/**
 * Increases the number of moves and updates the UI accordingly
 */
function incrementMoves() {
    moves++;
    document.querySelector(".moves").innerText = moves;
    if (moves === 1) {
        document.querySelector(".moves-text").innerText = "Move";
    } else {
        document.querySelector(".moves-text").innerText = "Moves";
    }
    decreaseStars();
}

/**
 * Marks matching cards
 */
function makeMatch() {
	let key = Object.keys(openCards)[0];
	let shape = openCards[key];
	let cards = document.querySelectorAll('.' + shape);
	for (let card of cards) {
		card.parentNode.className = "card match";
		card.parentNode.removeEventListener("click", playCard);
	}
	resetOpenCards();
}

/**
 * Hides the shown cards because they don't match
 */
function misMatch() {
	resetOpenCards();
	let cards = document.querySelectorAll(".open");
	for (let card of cards) {
		card.className = "card";
	}
}

/**
 * Initializes a new game
 */
function newGame() {
    rebuildDeck(shapes);
    resetOpenCards();
    resetMoves();
    resetMatchCount();
    timer.reset();
}

/**
 * The main stack of operations run when a card is clicked
 * @param event
 */
function playCard(event) {
    /**
     * If the player clicked on the symbol, we send the click event to the li element.
     */
    if (event.target.localName === "i") {
        event.target.parentNode.click();
        return;
    }

    timer.start();

    if (showCard(event) === false) {
        return;
    }

    var iClasses = event.target.childNodes[0].className.split(' ');
    addToOpenCards(event.target.id, iClasses[1]);

    let isMatch = function() {
        let keys = Object.keys(openCards);
        if (keys.length!=2) {
            return;
        }
        if (openCards[keys[0]] === openCards[keys[1]]) {
            return true;
        }
        return false;
    }();

    if (isMatch===true) {
        makeMatch();
        incrementMatchCount();
    } else if (isMatch===false) {
        setTimeout(misMatch, 300);
    } else {}

    incrementMoves();
    checkWinner();
}

/**
 * Removes a star from the UI
 */
function removeStar() {
	let stars = document.querySelectorAll(".fa-star");
	if (stars.length === 1) {
		return;
	}
	for (let star of stars) {
	    star.parentNode.remove();
	    return;
 	}
}

/**
 * Empties and rebuilds the deck with a new set of shuffled cards
 * @param shapes
 */
function rebuildDeck(shapes) {
    emptyDeck();

    let ul = document.querySelector('.deck');

    let nr = 0;
    let shuffled = shuffle(shapes);
    for (let shape of shuffled) {
        let li = document.createElement("li");
        li.addEventListener("click", playCard);
        li.id = `card${nr}`;
        li.className = "card";
        let i = document.createElement("i");
        i.className = "fas " + shape;
        li.appendChild(i);
        ul.appendChild(li);
        nr++;
    }
}

/**
 * Resets the number of matches found in a match
 */
function resetMatchCount() {
    matchCount = 0;
}

/**
 * Resets the number of moves and updates the UI accordingly
 */
function resetMoves() {
	moves = 0;
	document.querySelector(".moves").innerText = moves;
	document.querySelector(".moves-text").innerText = "Moves";

	let stars = document.querySelector(".stars");
	var lis = stars.children.length;
	while (lis < 3) {
		var star = stars.lastElementChild.cloneNode(true);
		stars.appendChild(star);
		lis = stars.children.length;
	}
}

/**
 * Empties the object holding the open cards
 */
function resetOpenCards() {
    openCards = {};
}

/**
 * Shows a card if it's not already shown
 * @param event
 * @returns {boolean}
 */
function showCard(event) {
    let classList = event.target.className.split(' ');

    if (classList.indexOf("open")===-1) {
        if (event.target.localName === "i") {
            event.target.parentNode.className = "card open show";
        } else {
            event.target.className = "card open show";
        }
        return true;
    }
    return false;
}

/**
 * Displays a modal window once the player has won the game
 */
function showModal() {
    let ticks = timer.getTicks();
    let stars = document.querySelectorAll(".fa-star").length;
    let timeSpent = timer.getTime(ticks);

    document.querySelector(".modal-message").innerText = `You've won ${stars} star(s) in ${timeSpent}!`;

    let leaderboard = getLeaderboard();
    if (leaderboard.length > 0) {
        let limit = 10;
        var myPosition = 0;
        var myRecord = "myRecord";
        let found = shown = false;

        document.querySelector(".leaderboard").classList.remove('hidden');

        emptyLeaderboard();
        let ul = document.querySelector(".leaderboard ul");
        for (let i = 0; i<leaderboard.length; i++) {
            let position = i + 1;
            let record = leaderboard[i];

            if (position <= limit) {
                let iNode = document.createElement("i");
                iNode.innerText = position;

                let li = document.createElement("li");
                if (timeSpent === record) {
                    li.className = myRecord;
                    myRecord = '';
                    found = shown = true;
                }
                li.appendChild(iNode);
                li.innerHTML += record;
                ul.appendChild(li);
            } else {
                if (timeSpent === record && found === false) {
                    found = true;
                    myPosition = position;
                }
            }
        }

        if (shown === false && leaderboard.length > 10) {
            if (myPosition > (limit + 1)) {
                let li = document.createElement("li");
                li.innerText = '...';
                ul.appendChild(li);
            }
            let iNode = document.createElement("i");
            iNode.innerText = myPosition;
            let li = document.createElement("li");
            li.appendChild(iNode);
            li.innerHTML += timeSpent;
            ul.appendChild(li);
        }
    }

    document.querySelector(".modal").classList.remove('hidden');
}

/**
 * Shuffles an array
 * @param array
 * @desc Shuffle function from http://stackoverflow.com/a/2450976
 * @returns {*}
 */
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/**
 * Shortcut key
 */
Mousetrap.bind('r', function() { 
    newGame();
}, 'keypress');