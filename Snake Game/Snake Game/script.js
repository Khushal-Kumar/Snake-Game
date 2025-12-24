// Game Constants & Variables
let inputDir = {x: 0, y: 0}; 
const foodSound = new Audio('music/food.mp3');
const gameOverSound = new Audio('music/gameover.mp3');
const moveSound = new Audio('music/move.mp3');
const musicSound = new Audio('music/music.mp3');
let speed = 9;
let score = 0;
let lastPaintTime = 0;
let snakeArr = [{x: 13, y: 15}];
let food = {x: 6, y: 7};
let isGameRunning = false;

// DOM Elements
const scoreBox = document.getElementById('scoreBox');
const hiscoreBox = document.getElementById('hiscoreBox');
const board = document.getElementById('board');

// 1. Main Game Loop
function main(ctime) {
    window.requestAnimationFrame(main);
    if((ctime - lastPaintTime)/1000 < 1/speed){
        return;
    }
    lastPaintTime = ctime;
    gameEngine();
}

// 2. Collision Logic
function isCollide(snake) {
    // A. Bump into yourself
    for (let i = 1; i < snakeArr.length; i++) {
        if(snake[i].x === snake[0].x && snake[i].y === snake[0].y){
            return true;
        }
    }
    // B. Bump into the wall (Grid is 1 to 18)
    if(snake[0].x >= 19 || snake[0].x <= 0 || snake[0].y >= 19 || snake[0].y <= 0){
        return true;
    }
    return false;
}

// 3. Game Engine
function gameEngine(){
    // Part 1: Updating the snake & Food
    if(isCollide(snakeArr)){
        gameOverSound.play();
        musicSound.pause();
        inputDir = {x: 0, y: 0}; 
        alert("Game Over! Score: " + score + ". Press any key to restart.");
        snakeArr = [{x: 13, y: 15}];
        musicSound.currentTime = 0;
        isGameRunning = false; 
        score = 0; 
        updateScoreBoard();
    }

    // If eaten food
    if(snakeArr[0].y === food.y && snakeArr[0].x === food.x){
        foodSound.play();
        score += 1;
        if(score > hiscoreval){
            hiscoreval = score;
            localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
        }
        updateScoreBoard();
        
        snakeArr.unshift({x: snakeArr[0].x + inputDir.x, y: snakeArr[0].y + inputDir.y});
        
        // Regenerate Food (Safe logic)
        let a = 2; let b = 16;
        food = {x: Math.round(a + (b-a)* Math.random()), y: Math.round(a + (b-a)* Math.random())}
    }

    // Move the snake
    for (let i = snakeArr.length - 2; i>=0; i--) { 
        snakeArr[i+1] = {...snakeArr[i]};
    }

    snakeArr[0].x += inputDir.x;
    snakeArr[0].y += inputDir.y;

    // Part 2: Render
    board.innerHTML = "";
    snakeArr.forEach((e, index)=>{
        snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = e.y;
        snakeElement.style.gridColumnStart = e.x;

        if(index === 0){
            snakeElement.classList.add('head');
        }
        else{
            snakeElement.classList.add('snake');
        }
        board.appendChild(snakeElement);
    });

    // Render Food
    foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y;
    foodElement.style.gridColumnStart = food.x;
    foodElement.classList.add('food')
    board.appendChild(foodElement);
}

// 4. Input Handling
function processInput(key) {
    if (!isGameRunning) {
        // Only start music on first user interaction
        musicSound.play().catch(() => {});
        isGameRunning = true;
    }
    
    moveSound.play();
    
    switch (key) {
        case "ArrowUp":
            if(inputDir.y !== 1) { inputDir.x = 0; inputDir.y = -1; }
            break;
        case "ArrowDown":
            if(inputDir.y !== -1) { inputDir.x = 0; inputDir.y = 1; }
            break;
        case "ArrowLeft":
            if(inputDir.x !== 1) { inputDir.x = -1; inputDir.y = 0; }
            break;
        case "ArrowRight":
            if(inputDir.x !== -1) { inputDir.x = 1; inputDir.y = 0; }
            break;
        default: break;
    }
}

// Helper to update HTML text
function updateScoreBoard() {
    scoreBox.innerHTML = "Score: " + score;
    hiscoreBox.innerHTML = "HiScore: " + hiscoreval;
}

// Handle Mobile Buttons
window.handleMobileInput = function(key) {
    processInput(key);
}

// Initialize High Score
let hiscore = localStorage.getItem("hiscore");
let hiscoreval = 0;

if(hiscore === null){
    localStorage.setItem("hiscore", JSON.stringify(hiscoreval))
}
else{
    hiscoreval = JSON.parse(hiscore);
}

// Force initial render of score
updateScoreBoard();

// Start Loop
window.requestAnimationFrame(main);

// Keyboard Listener
window.addEventListener('keydown', e => {
    // Prevent scrolling with arrows
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
    processInput(e.key);
});