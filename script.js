let main = document.querySelector(".main");
const scoreElem = document.getElementById('score');
const levelElem = document.getElementById('level');
const nextTetroElem = document.getElementById('next-tetro');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const gameOver = document.getElementById('game-over');

let playfield = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
];

// let playfield = Array(20).fill(Array(10).fill(0)); // создаем массив поля с игрой 

let score = 0; // подсчет очков 
let gameTimeID;
let currentLevel = 1;
let isPaused = true; // кнопка паузы (когда меняю на true по пробелу пауза включаеться и перестает работать сброс вниз фигуры?)
let possibleLevels = {
    1: {
        scorePerLine: 10,
        speed: 400, // cкорость игры 
        nextLevelScore: 500,
    },
    2: {
        scorePerLine: 15,
        speed: 300,
        nextLevelScore: 1500,
    },
    3: {
        scorePerLine: 20,
        speed: 200,
        nextLevelScore: 2500,
    },
    4: {
        scorePerLine: 30,
        speed: 100,
        nextLevelScore: 3500,
    },
    5: {
        scorePerLine: 50,
        speed: 50,
        nextLevelScore: Infinity,
    },
};

let figures = {
    O: [
        [1,1],
        [1,1],
    ],
    I: [
        [0,0,0,0,],
        [1,1,1,1,],
        [0,0,0,0,],
        [0,0,0,0,],
    ],
    S: [
        [0,1,1,],
        [1,1,0,],
        [0,0,0,],
    ],
    Z: [
        [1,1,0,],
        [0,1,1,],
        [0,0,0,],
    ],
    L: [
        [1,0,0,],
        [1,1,1,],
        [0,0,0,],
    ],
    J: [
        [0,0,1,],
        [1,1,1,],
        [0,0,0,],
    ],
    T: [
        [1,1,1,],
        [0,1,0,],
        [0,0,0,],
    ],
}

let activeTetro = getNewTetro(); //координаты фигры на игровом поле, которая будет крутиться 
let nextTetro = getNewTetro(); // следующая фигура которая будет падать за первой 

function draw() {
    let mainInnerHTML = '';
    for ( let y = 0; y < playfield.length; y++) {
     for ( let x = 0; x < playfield[y].length; x++) {
         if (playfield[y][x] === 1) {
            mainInnerHTML += '<div class="cell movingCell"></div>';
         } else if (playfield[y][x] === 2) {
            mainInnerHTML += '<div class="cell movingCell fixedCell"></div>';
         } else {
            mainInnerHTML += '<div class="cell"></div>';
         }
      }
    }
    main.innerHTML = mainInnerHTML;
}

function drawNextTetro() {
    let nextTetroInnerHTML = '';
    for ( let y = 0; y < nextTetro.shape.length; y++) {
        for( let x = 0; x < nextTetro.shape[y].length; x++) {
            if (nextTetro.shape[y][x]) {
                nextTetroInnerHTML += '<div class="cell movingCell"></div>';
            } else {
                nextTetroInnerHTML += '<div class="cell"></div>';
            }
        }
        nextTetroInnerHTML += '<br/>'
    }
    nextTetroElem.innerHTML = nextTetroInnerHTML;
}

function removePrevActiveTetro() {
    for ( let y = 0; y < playfield.length; y++) {
        for ( let x = 0; x < playfield[y].length; x++) {
            if (playfield[y][x] === 1) {
                playfield[y][x] = 0;
            } 
        }
    }
}

function addActiveTetro() {
    removePrevActiveTetro(); // функция для затерания фигуры которая осталась на поле 
    for ( let y = 0; y < activeTetro.shape.length; y++) {
        for ( let x = 0; x < activeTetro.shape[y].length; x++) {
            if (activeTetro.shape[y][x] === 1){
                playfield[activeTetro.y + y][activeTetro.x + x] = activeTetro.shape[y][x]; // добавить к статическому х и у еще по х и у для отображения фигуры на поле
            }
        }
    }
}

function rotateTetro() { // поворот фигуры
    const prevTetroState = activeTetro.shape;

    activeTetro.shape = activeTetro.shape[0].map((val, index) =>
     activeTetro.shape.map((row) => row[index]).reverse()
    );

    if (hasCollisions()) { // что бы фигура не ломала другие фиксим
        activeTetro.shape = prevTetroState;
    }
}

function hasCollisions() {
    for ( let y = 0; y < activeTetro.shape.length; y++) {
        for ( let x = 0; x < activeTetro.shape[y].length; x++) {
            if ( activeTetro.shape[y][x] && 
                (playfield[activeTetro.y + y] === undefined ||
                playfield[activeTetro.y + y][ activeTetro.x + x] === undefined || // проверка что бы не вышла фигура за пределы поля
                playfield[activeTetro.y + y][ activeTetro.x + x] === 2) // что бы фигура не перезаписывала другие
                ) {
                return true;
            }
        }
    }
    return false;
}

function removeFullLines() { //Проверить, есть ли заполненные линии и очистить их
    let canRemoveLine = true,
        filledLines = 0;
    for ( let y = 0; y < playfield.length ; y++) {
        for ( let x = 0; x < playfield[y].length; x++) {
            if (playfield[y][x] !==2) {
                canRemoveLine = false;
                break;
            }
        }
        if (canRemoveLine) {
            playfield.splice(y, 1);
            playfield.splice(0, 0, [0,0,0,0,0,0,0,0,0,0,]); // что бы вернуть пусиую строку удаленную
            filledLines += 1;
        }
        canRemoveLine = true;
    } 

    switch (filledLines) { // начисление доп очков за уничтожение сразу нескольких линий 
        case 1:
            score += possibleLevels[currentLevel].scorePerLine; // что бы очки начислялись за каждый уровень вместе с бонусами 
         break;
        case 2:
            score += possibleLevels[currentLevel].scorePerLine * 3;
         break;
        case 3:
            score += possibleLevels[currentLevel].scorePerLine * 6;
         break;
        case 4:
            score += possibleLevels[currentLevel].scorePerLine * 12;
         break;
    }

    scoreElem.innerHTML = score;
    
    if(score >= possibleLevels[currentLevel].nextLevelScore) { // переход на следующий уровень
        currentLevel++;
        levelElem.innerHTML = currentLevel;
    }
}

function getNewTetro(){ // генерим новые фигурки
    const possibleFigures = 'IOLJTSZ';
    const rand = Math.floor(Math.random ()*7);
    const newTetro = figures[possibleFigures[rand]];

    return{ // выпадение целого обьекта рандумной формы
        x: Math.floor((10 - newTetro[0].length)/2), // что бы фигура падала по середине ,
        y: 0,
        shape: newTetro,
    }; 
}

function fixTetro() {
    for ( let y = 0; y < playfield.length ; y++) {
        for ( let x = 0; x < playfield[y].length; x++) {
            if (playfield[y][x] === 1) {
                playfield[y][x] = 2;
            }
        }
    }
}

function moveTetroDown() {
    activeTetro.y += 1;
    if (hasCollisions()) { // будет проверять вылазит ли фигура за поле 
        activeTetro.y -= 1;
        fixTetro();
        removeFullLines(); // удаление линии
        activeTetro = nextTetro; // возращает полность новую фигуру и отцентрирует ее 
        if (hasCollisions()) {
            reset(); // скидывает все состояние игры на начало
        // alert('game over');
        }
        nextTetro = getNewTetro();
    } 
}

function dropeTetro() { // проверка для Spase уперлась ли фигура при падении куда то 
    for ( let y = activeTetro.y; y < playfield.length; y++) {
        activeTetro.y += 1;
        if (hasCollisions()) {
         activeTetro.y -= 1;
         break;
        }
    }
}

function reset() { 
    isPaused = true; // ставим игру на пузу
    clearTimeout(gameTimeID); // очтанавливаем цыкл игры
    playfield = [
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
    ];

    draw();
    gameOver.style.display = 'block';
}

document.onkeydown = function(e) {
        if (!isPaused) { // если игра на паузе
        if (e.keyCode === 37) { // двигаем фигуру влево
            activeTetro.x -= 1;
            if (hasCollisions()) {
                activeTetro.x += 1;
            }
        }
        else if (e.keyCode === 39){ // двигаем фигуру вправо
            activeTetro.x += 1;
            if (hasCollisions()) { // фигура что бы не вышла вправо
                activeTetro.x -= 1;
            }
        }
        else if (e.keyCode === 40){ // ускоряем фигуру 
            moveTetroDown();
        }
        else if (e.keyCode === 38){ // вращаем фигуру 
            rotateTetro(); 
        } else if (e.keyCode === 32){ // по нажатию на spase фигура падает вниз
            dropeTetro();
        }
        updateGameState();
    }
};

function updateGameState( ) {
    if (!isPaused) {
        addActiveTetro();
        draw();
        drawNextTetro();
    }
}

pauseBtn.addEventListener('click', (e) =>{ // пауза
    if (e.target.innerHTML === 'Pause') { // "е" что бы взять событие когда игра на паузе и возобновить ее
        e.target.innerHTML = 'Continue'
        clearTimeout(gameTimeID);
    } else {
        e.target.innerHTML = 'Pause'
        gameTimeID = setTimeout(startGame, possibleLevels[currentLevel].speed);
    }
   isPaused = !isPaused; // что бы игра продолжалась присваеваю "!"
});

startBtn.addEventListener('click' , (e) => {
    e.target.innerHTML = 'Start again';
    isPaused = false;
    gameTimeID = setTimeout(startGame, possibleLevels[currentLevel].speed);
    gameOver.style.display = 'none';
});

scoreElem.innerHTML = score;
levelElem.innerHTML = currentLevel;

draw();

function startGame() {
    moveTetroDown();
    if (!isPaused){
        updateGameState();
        gameTimeID = setTimeout(startGame, possibleLevels[currentLevel].speed);
    }
}