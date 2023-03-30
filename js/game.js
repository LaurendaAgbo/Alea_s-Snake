class Game {
	constructor () {

	}

	init () {
		let stage = document.getElementById("game-content");
		let ctx = stage.getContext("2d");
    
    let snake = [
      {x: 50, y: 70},
      {x: 40, y: 70},
      {x: 30, y: 70},
      {x: 20, y: 70},
      {x: 10, y: 70}
    ];
    let food = {x:0, y:0};

    let x_step = 5;
    let y_step = 0;
		
    let score = 0;

		let updateElements = {
			stage: stage,
			ctx: ctx,
			food: food,
			snake: snake,
			x_step: x_step,
			y_step: y_step,
			score: score,
			high_score: localStorage.getItem('high_score') > score ? localStorage.getItem('high_score') : score
		}

    this.generateWorld(updateElements);
	}

	showPopup (popup) {
    this.hidePopup('');
  
    if (popup == 'lose') {
      document.querySelector('#lose').style.display = 'flex';
    } else if (popup == 'start') {
      document.querySelector('#instructions').style.display = 'flex';
    }
  }
  
  hidePopup (popup) {
    if (popup == 'lose') {
      document.querySelector('#lose').style.display = 'none';
    } else if (popup == 'start') {
      document.querySelector('#instructions').style.display = 'none';
    }
    else if (popup == '') {
      document.querySelectorAll('.overlay').forEach(function (elm) {
        elm.style.display = 'none';
      });
    }
  }

	playMusic (music, volume) {
    let playing = document.querySelector(music);
    playing.play();
    playing.volume = volume;
  }
  
  stopMusic (music) {
    if (music == '') {
      let sounds = document.getElementsByTagName('audio');
      for (let i = 0; i < sounds.length; i++) {
        sounds[i].pause();
      }
    }
      
  }

	generateWorld (updateElements) {
    this.playMusic('#playing', 0.1);
		this.keepScore(updateElements.score, updateElements.high_score);

    // True if changing direction
    let changing_direction = false;
		let change_direction;
		
		updateElements.food = this.generateFood(updateElements);
		this.update(updateElements, changing_direction, change_direction);

	}

	update (updateElements, changing_direction, change_direction) {
		const mainClass = this;

		if (this.has_game_ended(updateElements)) {
			updateElements.high_score = localStorage.getItem('high_score') > updateElements.score ? localStorage.getItem('high_score') : updateElements.score;
			localStorage.setItem('high_score', updateElements.high_score);
			this.stopMusic('');
			this.playMusic('#loseSound', 0.5);
			this.showPopup('lose');
			return;
		}

		changing_direction = false;
		
		setTimeout(function onTick() {
			mainClass.clear_board(updateElements);
			mainClass.createFood(updateElements);

			change_direction = function(event) {
				updateElements = mainClass.change_direction(event, changing_direction, updateElements);
			}
			document.addEventListener("keydown", change_direction);
			
			mainClass.move_snake(updateElements);
			mainClass.createSnake(updateElements);

			mainClass.update(updateElements, changing_direction, change_direction);
		}, 100)
	}

	clear_board (updateElements) {
		updateElements.ctx.fillStyle = "#465749";
		updateElements.ctx.fillRect(0,0, updateElements.stage.width, updateElements.stage.height);
	}

	createSnake (updateElements) {
		const mainClass = this;
		// Draw each part
		updateElements.snake.forEach((snakePart) => {mainClass.createSnakePart(updateElements.ctx, snakePart)});
	}

	createSnakePart (ctx, snakePart) {
		ctx.fillStyle = 'white';
		ctx.fillRect(snakePart.x, snakePart.y, 5, 5);
		// Border around the snake part
		ctx.strokeStyle = "#465749";
		ctx.strokeRect(snakePart.x, snakePart.y, 5, 5);
	}

	move_snake(updateElements) {
		const head = {x: updateElements.snake[0].x + updateElements.x_step, y: updateElements.snake[0].y + updateElements.y_step};
		// Add the new head to the beginning of snake body
		updateElements.snake.unshift(head);

		const has_eaten_food = updateElements.snake[0].x === updateElements.food.x && updateElements.snake[0].y === updateElements.food.y;
		if (has_eaten_food) {
			this.playMusic('#eat', 0.5);

			updateElements.score += 100;
			this.keepScore(updateElements.score, updateElements.high_score);
			
			// New location for food
			updateElements.food = this.generateFood(updateElements);
		} 
		else {
			updateElements.snake.pop();
		}
	}

	generateFood(updateElements) {
		const mainClass = this;
		updateElements.food.x = random_food(0, updateElements.stage.width - 5);
		updateElements.food.y = random_food(0, updateElements.stage.height - 5);
		// if food location is where the snake currently is, generate a new food location
		updateElements.snake.forEach(function has_snake_eaten_food(snakePart) {
			const has_eaten = snakePart.x == updateElements.food.x && snakePart.y == updateElements.food.y;
			if (has_eaten) mainClass.generateFood(updateElements);
		});

		return updateElements.food;
	}

	createFood(updateElements) {
		updateElements.ctx.fillStyle = '#86be17';
		updateElements.ctx.fillRect(updateElements.food.x, updateElements.food.y, 5, 5);
	}

	change_direction (event, changing_direction, updateElements) {
		const LEFT_KEY = 37;
		const RIGHT_KEY = 39;
		const UP_KEY = 38;
		const DOWN_KEY = 40;
			
		if (changing_direction) return updateElements;
		changing_direction = true;
		const keyPressed = event.keyCode;
		const goingUp = updateElements.y_step === -5;
		const goingDown = updateElements.y_step === 5;
		const goingRight = updateElements.x_step === 5;
		const goingLeft = updateElements.x_step === -5;

		if (keyPressed === LEFT_KEY && !goingRight) {
			updateElements.x_step = -5;
			updateElements.y_step = 0;
		}
		if (keyPressed === UP_KEY && !goingDown) {
			updateElements.x_step = 0;
			updateElements.y_step = -5;
		}
		if (keyPressed === RIGHT_KEY && !goingLeft) {
			updateElements.x_step = 5;
			updateElements.y_step = 0;
		}
		if (keyPressed === DOWN_KEY && !goingUp) {
			updateElements.x_step = 0;
			updateElements.y_step = 5;
		}
		return updateElements;
	}

	keepScore (score, high_score) {
    document.getElementById('score').innerText = score;
    document.getElementById('highScore').innerText = high_score;
  }

	has_game_ended(updateElements) {
		for (let i = 4; i < updateElements.snake.length; i++) {
			if (updateElements.snake[i].x === updateElements.snake[0].x && updateElements.snake[i].y === updateElements.snake[0].y) return true
		}
		const hitLeftWall = updateElements.snake[0].x < 0;
		const hitRightWall = updateElements.snake[0].x > updateElements.stage.width - 5;
		const hitToptWall = updateElements.snake[0].y < 0;
		const hitBottomWall = updateElements.snake[0].y > updateElements.stage.height - 5;
		return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall
	}
}

function random_food(min, max) {
	return Math.round((Math.random() * (max-min) + min) / 5) * 5;
}