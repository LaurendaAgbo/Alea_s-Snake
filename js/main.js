document.addEventListener("DOMContentLoaded", function(event) {
	let game = new Game();

	game.showPopup('start');
	document.getElementById("startGame").onclick = startGame;
	function startGame () {
		localStorage.setItem('high_score', 0);

		game.hidePopup('');
	
		game.init(); 
	}

	document.getElementById("restart").onclick = function () {
		game.hidePopup('');
	
		game.init(); 
	};
});