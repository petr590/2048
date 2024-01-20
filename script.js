const	$overlay  = $('.field .overlay'),
		$score    = $('.score'),
		$maxScore = $('.max-score'),
		$winModal     = $('#win-modal'),
		$loseModal    = $('#lose-modal')

const maxScore = Number(localStorage.getItem('maxScore2048') ?? '0')
$maxScore.text(maxScore)


function saveMaxScore() {
	localStorage.setItem('maxScore2048', Math.max(maxScore, game.score))
}

$(window).on('unload', saveMaxScore)


const SIZE = 4

class Game2048 {
	score = 0
	won = false

	constructor() {
		for (let x = 0; x < SIZE; x++) {
			let line = []
			this[x] = line
			
			for (let y = 0; y < SIZE; y++) {
				line.push({ value: 0 })
			}
		}
	}

	addTile(x, y, value) {
		let cell = this[x][y]
		cell.value = value
		cell.elem = $('<div class="tile">')
				.text(value).attr('value', value).css('--x', x).css('--y', y)

		$overlay.append(cell.elem)
	}

	move(sx, sy, dx, dy) {
		let src = this[sx][sy],
			dst = this[dx][dy]

		this[sx][sy] = dst
		this[dx][dy] = src

		src.elem?.css('--x', dx).css('--y', dy)
		dst.elem?.css('--x', sx).css('--y', sy)
	}


	clear(x, y) {
		let cell = this[x][y]
		cell.value = 0
		cell.elem?.remove()
		cell.elem = null
	}

	collapse(x, y, value) {
		let cell = this[x][y]
		cell.value = value
		cell.elem.text(value).attr('value', value)
		this.score += value

		if (value == 2048 && !this.won) {
			$winModal.addClass('shown')
			this.won = true
		}
	}


	upStep() {
		let moved = false

		for (let x = 0; x < SIZE; x++) {
			let floor = 0,
				last = 0

			for (let y = 0; y < SIZE; y++) {
				let val = this[x][y].value

				if (val != 0) {
					if (last == val) {
						this.clear(x, y)
						this.collapse(x, floor - 1, val * 2)
						last = 0
						moved = true

					} else {
						if (floor != y) {
							this.move(x, y, x, floor)
							moved = true
						}

						floor += 1
						last = val
					}
				}
			}
		}

		return moved
	}


	downStep() {
		let moved = false

		for (let x = 0; x < SIZE; x++) {
			let floor = SIZE - 1,
				last = 0

			for (let y = floor; y >= 0; y--) {
				let val = this[x][y].value

				if (val != 0) {
					if (last == val) {
						this.clear(x, y)
						this.collapse(x, floor + 1, val * 2)
						last = 0
						moved = true

					} else {
						if (floor != y) {
							this.move(x, y, x, floor)
							moved = true
						}

						floor -= 1
						last = val
					}
				}
			}
		}

		return moved
	}


	leftStep() {
		let moved = false

		for (let y = 0; y < SIZE; y++) {
			let floor = 0,
				last = 0

			for (let x = 0; x < SIZE; x++) {
				let val = this[x][y].value

				if (val != 0) {
					if (last == val) {
						this.clear(x, y)
						this.collapse(floor - 1, y, val * 2)
						last = 0
						moved = true

					} else {
						if (floor != x) {
							this.move(x, y, floor, y)
							moved = true
						}

						floor += 1
						last = val
					}
				}
			}
		}

		return moved
	}


	rightStep() {
		let moved = false

		for (let y = 0; y < SIZE; y++) {
			let floor = SIZE - 1,
				last = 0

			for (let x = floor; x >= 0; x--) {
				let val = this[x][y].value

				if (val != 0) {
					if (last == val) {
						this.clear(x, y)
						this.collapse(floor + 1, y, val * 2)
						last = 0
						moved = true

					} else {
						if (floor != x) {
							this.move(x, y, floor, y)
							moved = true
						}

						floor -= 1
						last = val
					}
				}
			}
		}

		return moved
	}


	addRandomTile() {
		let coords = []

		for (let x = 0; x < SIZE; ++x) {
			for (let y = 0; y < SIZE; ++y) {
				if (this[x][y].value == 0) {
					coords.push({x, y})
				}
			}
		}

		let coord = coords[Math.floor(Math.random() * coords.length)]
		this.addTile(coord.x, coord.y, Math.random() < 0.8 ? 2 : 4)
	}

	clearAll() {
		for (let x = 0; x < SIZE; x++) {
			for (let y = 0; y < SIZE; y++) {
				let cell = this[x][y]
				cell.value = 0
				cell.elem?.remove()
				cell.elem = null
			}
		}
	}

	restart() {
		saveMaxScore()
		$score.text(0)
		this.score = 0

		$overlay.empty()
		this.clearAll()
		this.addRandomTile()
	}

	isLose() {
		for (let x = 0; x < SIZE; x++) {
			for (let y = 0; y < SIZE; y++) {
				let val = this[x][y].value

				if (val == 0 ||
					x < SIZE - 1 && val == this[x+1][y].value ||
					y < SIZE - 1 && val == this[x][y+1].value) {
					
					return false
				}
			}
		}

		return true
	}
}


const game = new Game2048()


$(document.body).on('keydown', event => {
	switch (event.key) {
		case 'ArrowUp':
			if (!game.upStep()) return
			break

		case 'ArrowDown':
			if (!game.downStep()) return
			break

		case 'ArrowLeft':
			if (!game.leftStep()) return
			break
			
		case 'ArrowRight':
			if (!game.rightStep()) return
			break

		default:
			return
	}
	
	$score.text(game.score)
	$maxScore.text(Math.max(maxScore, game.score))

	game.addRandomTile()

	if (game.isLose()) {
		$loseModal.addClass('shown')
	}
})


$('.restart').on('click', () => game.restart())



$winModal.find('.go').on('click', () => {
	$winModal.removeClass('shown')
})

$loseModal.find('.go').on('click', () => {
	$loseModal.removeClass('shown')
	game.restart()
})



game.addRandomTile()