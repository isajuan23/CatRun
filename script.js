const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load images
const playerImage = new Image();
playerImage.src = 'character.png'; // Path to your character image
playerImage.onload = () => {
    startGame(); // Start the game once the image has loaded
};

// Load background layers
const backgroundImage1 = new Image();
backgroundImage1.src = 'background1.png'; // First background layer (farthest back)
const backgroundImage2 = new Image();
backgroundImage2.src = 'background2.png'; // Second background layer (middle)
const foregroundImage = new Image();
foregroundImage.src = 'foreground.png'; // Foreground layer (closest to player)
let groundImage = new Image();
groundImage.src = 'ground.png'; // Path to your ground image
let isGroundImageLoaded = false;
const logoImage = new Image();
logoImage.src = 'logo.png'; // Path to your logo image


groundImage.onload = () => {
    isGroundImageLoaded = true;
    console.log('Ground image loaded');
};

const boxImage = new Image();
boxImage.src = 'box.png'; // Path to your box image

let player = {
    x: 50,
    y: 340,
    width: 40,
    height: 60,
    velocityY: 0,
    isJumping: false,
    animationFrame: 0,
    frameCount: 6,
    frameWidth: 40,
    frameHeight: 60,
    frameDelay: 5,
    currentFrameDelay: 0
};

let boxes = [];
let boxWidth = 40;
let boxHeight = 40;
let boxVelocityX = -5;
let score = 0;
let gameInterval;
let gravity = 1;

// Positions for parallax backgrounds
let bg1X = 0; // Position of the first background layer
let bg2X = 0; // Position of the second background layer
let fgX = 0;  // Position of the foreground layer
let groundX = 0; // Position of the ground layer

// Speed of each background layer
const bg1Speed = 1;  // Slowest
const bg2Speed = 2;  // Medium
const fgSpeed = 3;   // Fastest
const groundSpeed = 5; // Speed of the ground layer

function startGame() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("endScreen").style.display = "none";
    resetGame();
    gameInterval = setInterval(updateGame, 20);
}

function resetGame() {
    player.y = 300;
    player.velocityY = 0;
    player.isJumping = false;
    boxes = [];
    score = 0;

    // Reset background positions
    bg1X = 0;
    bg2X = 0;
    fgX = 0;
    groundX = 0; // Reset ground position
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Move background layers
    bg1X -= bg1Speed; // Move the first background layer
    bg2X -= bg2Speed; // Move the second background layer
    fgX -= fgSpeed;   // Move the foreground layer
    groundX -= groundSpeed; // Move the ground layer

    // Reset background positions to create a loop
    if (bg1X <= -canvas.width) bg1X = 0;
    if (bg2X <= -canvas.width) bg2X = 0;
    if (fgX <= -canvas.width) fgX = 0;
    if (groundX <= -canvas.width) groundX = 0; // Reset ground position

    // Draw background layers
    ctx.drawImage(backgroundImage1, bg1X, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage1, bg1X + canvas.width, 0, canvas.width, canvas.height); // Duplicate for seamless scrolling

    ctx.drawImage(backgroundImage2, bg2X, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage2, bg2X + canvas.width, 0, canvas.width, canvas.height); // Duplicate for seamless scrolling

    ctx.drawImage(foregroundImage, fgX, 0, canvas.width, canvas.height);
    ctx.drawImage(foregroundImage, fgX + canvas.width, 0, canvas.width, canvas.height); // Duplicate for seamless scrolling

    // Draw ground layer
    ctx.drawImage(groundImage, groundX, canvas.height - 40, canvas.width, 40); // Draw ground layer at the bottom
    ctx.drawImage(groundImage, groundX + canvas.width, canvas.height - 40, canvas.width, 40); // Duplicate for seamless scrolling

    if (isGroundImageLoaded) {
        ctx.drawImage(groundImage, groundX, canvas.height - 40, canvas.width, 40);
        ctx.drawImage(groundImage, groundX + canvas.width, canvas.height - 40, canvas.width, 40); 
    } else {
        console.log('Ground image not yet loaded');
    }

    // Draw the logo in the top right corner
    ctx.drawImage(logoImage, canvas.width - 200, 10, 200, 100);

    drawPlayer(); // Draw player with animation
    handleBoxes(); // Handle box logic
    checkCollision(); 
    displayScore();
    handleGravity(); 
}

function drawPlayer() {
    let frameX = player.animationFrame * player.frameWidth;

    ctx.drawImage(
        playerImage,
        frameX, 0,
        player.frameWidth, player.frameHeight,
        player.x, player.y,
        player.width, player.height
    );

    player.currentFrameDelay++;
    if (player.currentFrameDelay >= player.frameDelay) {
        player.animationFrame = (player.animationFrame + 1) % player.frameCount;
        player.currentFrameDelay = 0;
    }
}

function handleBoxes() {
    const minGap = 200;
    const maxGap = 500;

    if (boxes.length === 0 || boxes[boxes.length - 1].x < canvas.width - (Math.random() * (maxGap - minGap) + minGap)) {
        let boxX = canvas.width;
        let boxY = 325; // The Y position for the ground-level box
        let boxStackChance = Math.random();
        
        boxes.push({ x: boxX, y: boxY, width: boxWidth, height: boxHeight });
        
        if (boxStackChance < 0.3) {
            boxes.push({ x: boxX, y: boxY - boxHeight, width: boxWidth, height: boxHeight });
        }
    }

    for (let i = 0; i < boxes.length; i++) {
        let box = boxes[i];
        box.x += boxVelocityX; // Move box to the left
        ctx.drawImage(boxImage, box.x, box.y, box.width, box.height); // Draw the box image

        if (box.x + box.width < 0) {
            boxes.splice(i, 1);
            score++;
            i--; 
        }
    }
}

function handleGravity() {
    if (player.isJumping) {
        player.velocityY += gravity;
        player.y += player.velocityY;
        if (player.y >= 300) {
            player.y = 300;
            player.isJumping = false;
        }
    }
}

function checkCollision() {
    for (let box of boxes) {
        if (player.x < box.x + box.width &&
            player.x + player.width > box.x &&
            player.y < box.y + box.height &&
            player.y + player.height > box.y) {
            endGame();
        }
    }
}

function endGame() {
    clearInterval(gameInterval);
    document.getElementById("finalScore").innerText = score;
    document.getElementById("endScreen").style.display = "block";
}

function restartGame() {
    startGame();
}

function displayScore() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 20);
}

document.addEventListener("keydown", function(event) {
    if (event.code === "Space" && !player.isJumping) {
        player.isJumping = true;
        player.velocityY = -15;
    }
});

// Show start screen
document.getElementById("startScreen").style.display = "block"; // Show the start screen
