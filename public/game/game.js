window.onload = function () {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        window.location.href = "/log"
    }
    
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false; 

    const objectCanvas = document.getElementById("coinCanvas");
    const ctxObject = objectCanvas.getContext("2d");

    const shopCanvas = document.getElementById("shopCanvas");
    const ctxShop = shopCanvas.getContext("2d");

    const mapImage = new Image();
    mapImage.src = "texture/location.png";

    const playerSprite = new Image();
    playerSprite.src = "texture/player.png";

    const treeSprite = new Image();
    treeSprite.src = "texture/tree.png";

    const rockSprite = new Image();
    rockSprite.src = "texture/rock.png";

    const buildSprite = new Image();
    buildSprite.src = "texture/building.png";

    const crystalSprite = new Image();
    crystalSprite.src = "texture/crystal.png";

    const speedSprite = new Image();
    speedSprite.src = "texture/speed.png";

    const radiusSprite = new Image();
    radiusSprite.src = "texture/radius.png";

    const coinSprite = new Image();
    coinSprite.src = "texture/coin.png";
    
    const thiefSprite = new Image();
    thiefSprite.src = "texture/thief.png";

    let player = {
        x: 50,
        y: 90,
        size: 10,
        speed: 0.5,
        dx: 0,
        dy: 0,
        coins: 0,
        vision: 5
    };

    const keys = {};

    window.addEventListener("keydown", (e) => keys[e.key] = true);
    window.addEventListener("keyup", (e) => keys[e.key] = false);
    
    let objects = [];
    let thief = []
    let coins = [];
    let space = [];
    let walls = [];
    let buildings = [];
    let maxspeed = false; 
    let maxvision = false;

    function updatePlayerMovement() {
        let moveX = 0, moveY = 0;
        if (keys["ArrowUp"]) moveY -= 1;
        if (keys["ArrowDown"]) moveY += 1;
        if (keys["ArrowLeft"]) moveX -= 1;
        if (keys["ArrowRight"]) moveX += 1;
        if (keys["e"]||keys["E"]) console.log(123);
        
        let length = Math.sqrt(moveX * moveX + moveY * moveY);
        if (length !== 0) {
            moveX /= length;
            moveY /= length;
        }

        player.dx = moveX * player.speed;
        player.dy = moveY * player.speed;

        if (!checkCollision(player.x + player.dx, player.y)) {
            player.x += player.dx
        } else {
            if (!checkCollision(player.x + Math.sign(player.dx), player.y)) {
                player.x += Math.sign(player.dx); 
            }
        };
        if (!checkCollision(player.x, player.y + player.dy)) {
            player.y += player.dy; 
        } else {
            if (!checkCollision(player.x, player.y + Math.sign(player.dy))) {
                player.y += Math.sign(player.dy); 
            }
        }
        takeCoin(player.x, player.y);
    }

    function checkCollision(x, y) {
        let playerLeft = x - player.size/2, playerRight = x + player.size/2;
        let playerTop = y - player.size/2, playerBottom = y + player.size/2;

        for (let wall of walls) {
            if (
                playerRight > wall.x1 && playerLeft < wall.x2 &&
                playerBottom > wall.y1 && playerTop < wall.y2
            ) {
                return true;
            }
        }
        for (let object of objects) {
            if (
                playerRight > object.xc - object.size/2 && playerLeft < object.xc + object.size/2 &&
                playerBottom > object.yc - object.size/2 && playerTop < object.yc + object.size/2
            ) {
                return true;
            } 
        }
        return false;
    }

    function takeCoin(x, y) { 
        let playerLeft = x - player.size / 2, playerRight = x + player.size / 2;
        let playerTop = y - player.size / 2, playerBottom = y + player.size / 2;
    
        coins = coins.filter(coin => {
            let coinLeft = coin.xc - coin.size / 2, coinRight = coin.xc + coin.size / 2;
            let coinTop = coin.yc - coin.size / 2, coinBottom = coin.yc + coin.size / 2;
    
            let collision = playerRight > coinLeft && playerLeft < coinRight &&
                            playerBottom > coinTop && playerTop < coinBottom;
    
            if (collision) {
                player.coins += coin.points; 
            }
    
            return !collision; 
        });
    }
    function spawnCoin() {
        if (coins.length < 10) {
            let randomX, randomY;
            
            do {
                randomX = Math.floor(Math.random() * 25);
                randomY = Math.floor(Math.random() * 25);
            } while (space[randomY][randomX] === 0);  
    
            new_xc = 10 + randomX * 20;
            new_yc = 10 + randomY * 20;
            points = Math.floor(Math.random() * 15 + 6);
            newCoin = { xc: new_xc, yc: new_yc, size: Math.floor(4 + (points-5)/5*2), points: points };
            coins.push(newCoin);
        }
    }

    let thiefIdCounter = 0; 

function spawnThief() {
    const maxThieves = 3; 
    if (thief.length < maxThieves) {
        let randomX, randomY;
        const radius = 50;

        do {
            do {
                randomX = Math.floor(Math.random() * 25);
                randomY = Math.floor(Math.random() * 25);
            } while (space[randomY][randomX] === 0);

            new_xc = 10 + randomX * 20;
            new_yc = 10 + randomY * 20;

        } while (
            (player.x - player.size / 2 - radius < new_xc) &&
            (player.x + player.size / 2 + radius > new_xc) &&
            (player.y - player.size / 2 - radius < new_yc) &&
            (player.y + player.size / 2 + radius > new_yc)
        );

        let newThief = { id: thiefIdCounter++, xc: new_xc, yc: new_yc, size: 10, angular: 0, dx: 0, dy: 0};
        thief.push(newThief); 

        setTimeout(() => {
            let index = thief.findIndex(t => t.id === newThief.id);
            if (index !== -1) {
                thief.splice(index, 1);
            }
        }, 7000);
    }
}

const visionThief = 40; 
const thiefSpeed = 0.8;  

function checkThiefCollision(x, y) {
    let thiefSize = 10; 
    let thiefLeft = x - thiefSize / 2, thiefRight = x + thiefSize / 2;
    let thiefTop = y - thiefSize / 2, thiefBottom = y + thiefSize / 2;

    for (let wall of walls) {
        if (
            thiefRight > wall.x1 && thiefLeft < wall.x2 &&
            thiefBottom > wall.y1 && thiefTop < wall.y2
        ) {
            return true;
        }
    }

    for (let object of objects) {
        if (
            thiefRight > object.xc - object.size / 2 && thiefLeft < object.xc + object.size / 2 &&
            thiefBottom > object.yc - object.size / 2 && thiefTop < object.yc + object.size / 2
        ) {
            return true;
        }
    }

    return false;
}


function moveThief() {
    for (let thiefty of thief) {
        let dx = player.x - thiefty.xc;
        let dy = player.y - thiefty.yc;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < visionThief) {
            let newX = thiefty.xc + (dx / distance) * thiefSpeed;
            let newY = thiefty.yc + (dy / distance) * thiefSpeed;

            let canMoveX = !checkThiefCollision(newX, thiefty.yc);
            let canMoveY = !checkThiefCollision(thiefty.xc, newY);

            if (canMoveX && canMoveY) {
                thiefty.dx = thiefty.xc - newX;
                thiefty.dy = thiefty.yc - newY;
                
                thiefty.xc = newX;
                thiefty.yc = newY;
            } else if (canMoveX) {
                thiefty.dx = thiefty.xc - newX;
                thiefty.dy = thiefty.yc - newY;
                thiefty.xc = newX;
            } else if (canMoveY) {
                thiefty.dx = thiefty.xc - newX;
                thiefty.dy = thiefty.yc - newY;
                thiefty.yc = newY;
            } else {
                thiefty.dx = thiefty.xc - newX;
                thiefty.dy = thiefty.yc - newY;
            }
        }

        let playerLeft = player.x - player.size / 2;
        let playerRight = player.x + player.size / 2;
        let playerTop = player.y - player.size / 2;
        let playerBottom = player.y + player.size / 2;

        if (
            thiefty.xc + thiefty.size / 2 > playerLeft &&
            thiefty.xc - thiefty.size / 2 < playerRight &&
            thiefty.yc + thiefty.size / 2 > playerTop &&
            thiefty.yc - thiefty.size / 2 < playerBottom
        ) {
            let distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
            if (distanceToPlayer <= 10) {
                let stolenAmount = player.coins >= 100 ? 100 : player.coins;
                player.coins -= stolenAmount;

                let index = thief.findIndex(t => t.id === thiefty.id);
                if (index !== -1) {
                    thief.splice(index, 1);
                }
            }
        }
    }
}



    
    function drawSpace() {
        for (let y = 0; y < space.length; y++) {
            for (let x = 0; x < space[y].length; x++) {
                if (space[y][x] === 1) {  
                    ctx.fillStyle = "blue";
                    ctx.fillRect(x * 20 + 5, y * 20 + 5 , 10, 10); 
                }
            }
        }
    }
    
    

    async function getWorldData() {
        const response = await fetch("/game_info");
        const data = await response.json();
        walls = data.walls;
        space = data.space;
        objects = data.objects;
        
        buildings = objects.filter(obj => obj.type === "building").map(obj => ({ xc: obj.xc, yc: obj.yc }));
        console.log(buildings)
        console.log(objects)
    }

    async function getGameData() {
        const response = await fetch(`/user_info/${userId}`);
        const data = await response.json();
        player = {x: data.player.x, y: data.player.y, size: 10, speed: data.player.speed, dx: 0, dy: 0, coins: data.player.coins, vision: data.player.vision} || player;
        if (!(player.speed + 0.05 < 1.5)) {
            maxspeed = true
        }
        if (!(player.vision - 0.4 > 1)) {
            maxvision = true
        }
        
        console.log(player, "getGameData")
    }
    async function saveToLocalStorage() {
        localStorage.setItem("player", JSON.stringify({x: player.x, y: player.y, coins: player.coins, speed: player.speed, vision: player.vision}));
        localStorage.setItem("worldData", JSON.stringify({space, walls, objects}));
        const playerData = {x: player.x, y: player.y, coins: player.coins, speed: player.speed, vision: player.vision}
        const responce = await  fetch(`/save_game/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ player: playerData })
        })
        console.log(playerData, "saveToLocalStorage")
    }    
    
    function loadFromLocalStorage() {
        const savedPlayer = localStorage.getItem("player");
        const savedWorldData = localStorage.getItem("worldData");
    
        if (savedPlayer) {
            let playerData = JSON.parse(savedPlayer);
            player = {x: playerData.x, y: playerData.y, size: 10, speed: playerData.speed, dx: 0, dy: 0, coins: playerData.coins, vision: playerData.vision};
            if (!(player.speed + 0.05 < 1.5)) {
                maxspeed = true
            }
            if (!(player.vision - 0.4 > 1)) {
                maxvision = true
            }
        }
        if (savedWorldData) {
            let worldData = JSON.parse(savedWorldData);
            walls = worldData.walls;
            space = worldData.space;
            objects = worldData.object;
        }
        console.log(savedPlayer, "LoadFromLocalStorage")
    
    }
    
    function logout() {
        localStorage.removeItem("userId");
        localStorage.removeItem("player");
        localStorage.removeItem("worldData");
        window.location.href = "/log"
        
    }
    document.getElementById("saveButton").addEventListener("click", saveToLocalStorage);
    document.getElementById("logoutButton").addEventListener("click", logout);


    function drawWalls() {
        ctx.fillStyle = "red"; 
        for (let wall of walls) {
            let wallX1 = wall.x1 
            let wallY1 = wall.y1 
            let wallX2 = wall.x2 
            let wallY2 = wall.y2 
            
            ctx.fillRect(wallX1, wallY1, (wallX2 - wallX1) +1, (wallY2 - wallY1)+1);
        }
    }

    function drawObjects() {
        for (let object of objects) {
            ctx.save(); 
            ctx.translate(object.xc, object.yc); 
            if (object.type === "tree") {
                ctx.drawImage(treeSprite, -object.size / 2, -object.size / 2, object.size, object.size);
            } else if (object.type === "crystal") {
                ctx.drawImage(crystalSprite, -object.size / 2, -object.size / 2, object.size, object.size);
            } else if (object.type === "rock") {
                ctx.drawImage(rockSprite, -object.size / 2, -object.size / 2, object.size, object.size);
            } else if (object.type === "building") {
                ctx.drawImage(buildSprite, -object.size / 2, -object.size / 2, object.size, object.size);
            } 
            ctx.restore(); 
        }
    }

    function drawCoins() {
        for (let coin of coins) {
            ctx.save(); 
            ctx.translate(coin.xc, coin.yc); 
            ctx.drawImage(coinSprite, -coin.size / 2, -coin.size / 2, coin.size, coin.size);
            ctx.restore();
        }
    }

    function drawThief() {
        for (let thiefy of thief) {
            if (thiefy.dx !== 0 || thiefy.dy !== 0) { 
                let dx = player.x - thiefy.xc;
                let dy = player.y - thiefy.yc;
                let angle = Math.atan2(dy, dx); 
                thiefy.angle = angle + Math.PI/2; 
            }

            
            ctx.save(); 
            ctx.translate(thiefy.xc, thiefy.yc); 
            ctx.rotate(thiefy.angle); 
            ctx.drawImage(thiefSprite, -thiefy.size / 2, -thiefy.size / 2, thiefy.size, thiefy.size);
            ctx.restore();
        }
    }
   function drawCoinsAndScore() {
        
        ctxObject.clearRect(0, 0, objectCanvas.width, objectCanvas.height);
        ctxObject.fillStyle = "black";
        ctxObject.fillRect(0, 0, objectCanvas.width, objectCanvas.height); 

        ctxObject.imageSmoothingEnabled = false;
        ctxObject.drawImage(coinSprite, 10,10,50,50);
        ctxObject.font = "16px Arial";
        ctxObject.fillStyle = "#fff";
        ctxObject.fillText(player.coins, 65, 40);
    }

    function interact(){
        for (let building of buildings) {
            if ((player.x - player.size/2 < building.xc + 15)&&(player.x + player.size/2 > building.xc - 15) 
                && (player.y - player.size/2 < building.yc + 15) && (player.y + player.size/2 > building.yc - 15)) {
                    return true
                }
        }
        return false
    }

    
    function upgradeSpeed() {
        if (player.speed + 0.05 < 1.5) {
            if (player.coins >= 150) {
                player.coins -= 150;
                player.speed += 0.1;
                console.log("Speed upgraded:", player.vision);
                if (!(player.speed + 0.05 < 1.5)) {
                    maxspeed = true
                }
            }
        } else {
            console.log("Max speed")
        }
    }
    
    function upgradeVision() {
        if (player.vision - 0.4 > 1) {
            if (player.coins >= 100) {
                player.coins -= 100;
                player.vision -= 0.4;
                console.log("Vision upgraded:", player.vision);
                if (!(player.vision - 0.4 > 1)) {
                    maxvision = true
                }
            }
        } else {
            console.log("Max vision")
        }  
    }

    
    const shopItems = [
        { x: 10, y: 10, width: 50, height: 50, action: () => upgradeSpeed() },
        { x: 10, y: 60, width: 50, height: 50, action: () => upgradeVision() }
    ];

    shopCanvas.addEventListener("click", function(event) {
        const rect = shopCanvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
    
        if(interact()){
            shopItems.forEach(item => {
                if (
                    mouseX >= item.x && mouseX <= item.x + item.width &&
                    mouseY >= item.y && mouseY <= item.y + item.height
                ) {
                    item.action(); 
                }
            });
        }
        
    });

    
    function drawShop() {
        ctxShop.clearRect(0, 0, shopCanvas.width, shopCanvas.height);
        ctxShop.fillStyle = "black";
        ctxShop.fillRect(0, 0, shopCanvas.width, shopCanvas.height); 
    
        if (interact()) {
            ctxShop.imageSmoothingEnabled = false;
    
            ctxShop.drawImage(speedSprite, shopItems[0].x, shopItems[0].y, shopItems[0].width, shopItems[0].height);
            ctxShop.font = "16px Arial";
            ctxShop.fillStyle = "#fff";
            ctxShop.fillText(Math.round(2*player.speed*1000)/1000, 65, 30);
            if(maxspeed) {
                ctxShop.fillText("MAX", 80, 55);
            } else {
                ctxShop.drawImage(coinSprite, shopItems[0].x +50, shopItems[0].y + 30, shopItems[0].width/3, shopItems[0].height/3);
                ctxShop.fillText(150, 80, 55);
            }
            
            ctxShop.drawImage(radiusSprite, shopItems[1].x, shopItems[1].y, shopItems[1].width, shopItems[1].height);
            ctxShop.fillText(Math.round(5/player.vision*1000)/1000, 65, 80);
            if(maxvision) {
                ctxShop.fillText("MAX", 80, 100);    
            } else {
                ctxShop.drawImage(coinSprite, shopItems[0].x +50, shopItems[0].y + 75, shopItems[0].width/3, shopItems[0].height/3);
                ctxShop.fillText(100, 80, 100);
            }
            
        }
    }
    
    let angle = 0;
        
    function drawPlayer() {
        
        if(!(player.dx == 0 && player.dy == 0)) 
            angle = Math.atan2(player.dy, player.dx) + Math.PI/2;

        ctx.save();
        ctx.translate(player.x, player.y); 
        ctx.rotate(angle); 
        ctx.drawImage(playerSprite, -player.size / 2, -player.size / 2, player.size, player.size); 
        ctx.restore(); 
    }
    
    

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        
        let viewSize = 100;
        let scale = player.vision;
        let viewX = player.x - viewSize / 2;
        let viewY = player.y - viewSize / 2;
        
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height); 


        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(scale, 0, 0, scale, canvas.width / 2, canvas.height / 2);
        ctx.translate(-player.x, -player.y);
        
        ctx.drawImage(mapImage, 0, 0);
        
        //drawWalls(); 
        //drawSpace()
        
        drawObjects();
        spawnCoin();
        drawCoins();
        spawnThief();
        moveThief();
        drawThief();
        updatePlayerMovement();
        drawShop();
        
        //ctx.fillStyle = "red";
        //ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);
        drawPlayer();
        
        ctx.restore();
        drawCoinsAndScore();
        requestAnimationFrame(gameLoop);
    }
    
    

    mapImage.onload = async function () {
        canvas.width = 500;
        canvas.height = 500;
        if (!userId) {
            window.location.href = "/log";
            return;
        }
        loadFromLocalStorage();
        await getWorldData();            
        await getGameData();

        saveToLocalStorage();
        gameLoop();
    };
};
