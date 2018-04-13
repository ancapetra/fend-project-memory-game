/*
 * Create a list that holds all of your cards
 */

const shapes = [
	"fa-diamond", "fa-diamond",
	"fa-paper-plane-o", "fa-paper-plane-o",
	"fa-anchor", "fa-anchor",
	"fa-bolt", "fa-bolt",
	"fa-cube", "fa-cube",
	"fa-bomb", "fa-bomb",
	"fa-leaf", "fa-leaf",
	"fa-bicycle", "fa-bicycle"
]
let openCards = []

let moves = 0;

let matchCount = 0;

class MemoryTimer {
	constructor() {
		this.node = document.querySelector(".timer");
		this.ticks = 0;
		this.interval = 0;
	}
	format(subject) {
		return subject.toString().padStart(2, "0");
	}
	getTicks() {
		return this.ticks;
	}
	getTime(ticks) {
		var hours = this.format(Math.floor(ticks / 3600));
		ticks = ticks % 3600;
		let minutes = this.format(Math.floor(ticks / 60));
		let seconds = this.format(ticks % 60);
		return `${hours}:${minutes}:${seconds}`;
	}
	reset() {
		this.ticks = 0;
		this.interval = 0;
		this.node.innerText = "00:00:00";
	}
	start() {
		if (this.interval !== 0) {
			return;
		}
		this.interval = setInterval("timer.tick()", 1000);
	}
	stop() {
		clearInterval(this.interval);
	}
	tick() {
		this.ticks++;
		this.update();
	}
	update() {
		this.node.innerText = this.getTime(this.ticks);
	}
}
var timer = new MemoryTimer();

class MemoryStorage {
	static clear() {
		localStorage.clear();
	}
	static getItem(key) {
		return localStorage.getItem(key);
	}
	static getItems(key) {
		var records = [];
		for (let key in localStorage) {
			records.push(this.getItem(key));
		}
		records.sort();
		return records;
	}
	static setItem(key, value) {
		localStorage.setItem(key, value);
	}
}


/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

document.querySelector('.fa-repeat').addEventListener('click', function(){
	init();
});

function emptyDeck() {
	let cards = document.querySelectorAll('.card');
	for (let card of cards) {
	    card.remove();
  	}
}

function rebuildDeck(shapes) {
	emptyDeck();

	let ul = document.querySelector('.deck');

	let shuffled = shuffle(shapes);
	for (let shape of shuffled) {
		let li = document.createElement("li");
		li.addEventListener('click', playCard);
		li.className = "card";
		let i = document.createElement("i");
		i.className = "fa " + shape;
		li.appendChild(i);
		ul.appendChild(li);
	}
}

addEventListener('DOMContentLoaded', init);

function init() {
	rebuildDeck(shapes);
	resetOpenCards();
	resetMoves();
	resetMatchCount();
	timer.reset();
}

// Shuffle function from http://stackoverflow.com/a/2450976
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


/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */

function playCard(card) {
	timer.start();

	if (showCard(card)===false) {
		return;
	}

	if (card.target.childNodes.length === 0) {
		return;
	}
	let iClasses = card.target.childNodes[0].className.split(' ');
	addToOpenCards(iClasses[1]);

	let isMatch = function() {
		if (openCards.length!=2) {
			return;
		}
		if (openCards[0]===openCards[1]) {
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

function showCard(card) {
	let classList = card.target.className.split(' ');

	if (classList.indexOf("open")===-1) {
		card.target.className = "card open show";
		return true;
	}
	return false;
}

function addToOpenCards(card) {
	openCards.push(card);
}

function makeMatch() {
	let shape = openCards[0];
	let cards = document.querySelectorAll('.' + shape);
	for (let card of cards) {
		card.parentNode.className = "card match";
	}
	resetOpenCards();
}

function misMatch() {
	resetOpenCards();
	let cards = document.querySelectorAll(".open");
	for (let card of cards) {
		card.className = "card";
	}
}

function resetOpenCards() {
	openCards = [];
}

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

function decreaseStars() {
	if (moves === 30) {
		removeStar();
	}
	if (moves === 40) {
		removeStar();
	}
}

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

function incrementMatchCount() {
	matchCount += 2;
}

function checkWinner() {
	if (matchCount === shapes.length) {
		timer.stop();

		let ticks = timer.getTicks();
		let timeSpent = timer.getTime(ticks);
		MemoryStorage.setItem(Date.now(), ticks);

		let leaderboard = getLeaderboard();

		let stars = document.querySelectorAll(".fa-star").length;
		var message = `Congratulations!
You've won ${stars} star(s) in ${timeSpent}!
Leaderboard:`;
		if (leaderboard.length > 0) {
			let found = shown = false;
			var myPosition = 0;
			for (let i = 0; i<leaderboard.length; i++) {
				let position = i + 1;
				let record = leaderboard[i];
				if (position <= 10) {
					if (position < 10) {
						var arrow = "     ";
					} else {
						var arrow = "   ";
					}
					if (timeSpent === record) {
						if (found === false) {
							var arrow = "\u25b6";
						}
						found = shown = true;
					}
					message += `
${arrow} ${position}. ${record}`;
				} else {
					if (timeSpent === record && found === false) {
						found = true;
						myPosition = position;
					}
				}
			}
			if (shown === false) {
				var arrow = "\u25b6";
				message += `
    ...
${arrow} ${myPosition}. ${timeSpent}`;
			}
		}
		message += `
Do you want to play again?`;
		if (confirm(message)) {
			init();
		}
	}
}

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

function resetMatchCount() {
	matchCount = 0;
}

function getLeaderboard() {
	var records = MemoryStorage.getItems();
	
	var leaderboard = [];
	for (let record of records) {
		if (record !== null) {
			leaderboard.push(timer.getTime(record));
		}
	}

	return leaderboard;
}
