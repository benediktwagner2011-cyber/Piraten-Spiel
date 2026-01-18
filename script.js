let frame = 0;
let state = "IDLE";
let left = 0;
let leftArrow = false;
let rightArrow = false;
let attacking = false;
const bullets = [];
const enemies = [];
const enemyCount = 200;

let backgroundMusic = new Audio("audio/bg-music.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.1;
let deathSoundEnemy = new Audio("audio/death-enemy.mp3");
let gunShotSound = new Audio("audio/gun-shot.mp3");
let WalkingSound = new Audio("audio/walking1.mp3");
WalkingSound.loop = true;
WalkingSound.playbackRate = 2;


let bgWidth;


setInterval(updateGame, 1000 / 120);
setInterval(movment, 75);
setInterval(checkCollisions, 1000 / 120);
setInterval(checkCharacterCollision, 1000 / 120);
createEnemies();

document.onkeydown = checkKey;
document.onkeyup = unCheckKey;

window.onload = () => {
  // ⭐ NEU
  bgWidth = currentBG.offsetWidth; // ⭐ NEU
  currentBG.style.left = "0px"; // ⭐ NEU
  currentBG2.style.left = bgWidth + "px"; // ⭐ NEU
  currentBG3.style.left = -bgWidth + "px"; // ⭐ NEU
};




function checkKey(e) {
  e = e || window.event;

  if (e.keyCode == "37" ) {
    leftArrow = true;
  } else if (e.keyCode == "39") {
    rightArrow = true;
  }
  if (e.keyCode == "68") {
    startAtack();
  }
}




const linksDiv = document.getElementById("linksDiv");
const rechtsDiv = document.getElementById("rechtsDiv");
const mitteDiv = document.getElementById("mitteDiv");

// LINKS
linksDiv.addEventListener("mousedown", () => { leftArrow = true; });
linksDiv.addEventListener("mouseup", () => { leftArrow = false; });
linksDiv.addEventListener("mouseleave", () => { leftArrow = false; }); // Maus geht raus
linksDiv.addEventListener("touchstart", (e) => { e.preventDefault(); leftArrow = true; });
linksDiv.addEventListener("touchend", () => { leftArrow = false; });

// RECHTS
rechtsDiv.addEventListener("mousedown", () => { rightArrow = true; });
rechtsDiv.addEventListener("mouseup", () => { rightArrow = false; });
rechtsDiv.addEventListener("mouseleave", () => { rightArrow = false; });
rechtsDiv.addEventListener("touchstart", (e) => { e.preventDefault(); rightArrow = true; });
rechtsDiv.addEventListener("touchend", () => { rightArrow = false; });

// MITTE (Schießen)
mitteDiv.addEventListener("mousedown", () => { startAtack(); });
mitteDiv.addEventListener("touchstart", (e) => { e.preventDefault(); startAtack(); });


function startAtack() {
  attacking = true;
  setTimeout(function () {
    gunShotSound.currentTime = 0;
    gunShotSound.play();

    const bullet = document.createElement("img");
    bullet.classList.add("bullet");
    bullet.src = "PNG/bullet.png";

    document.body.appendChild(bullet);

    bullets.push({
      element: bullet,
      initialX: 270,
    });
  }, 50);
}



function unCheckKey(e) {
  e = e || window.event;

  if (e.keyCode == "37") {
    leftArrow = false;
  } else if (e.keyCode == "39") {
    rightArrow = false;
  }
}

function updateGame() {
  if (backgroundMusic.paused) {
    backgroundMusic.play();
  }

  if (state === "WALK" && !WalkingSound.playing) {
  WalkingSound.play();
} else {
  WalkingSound.pause();
}



  if (state !== "DIE") {
    const overlap = 6; // ⭐ NEU: Überlappung in Pixeln
    const moveX = (rightArrow ? -5 : 0) + (leftArrow ? 5 : 0); // ⭐ NEU
    [currentBG, currentBG2, currentBG3].forEach((bg) => {
      // ⭐ NEU
      let bgLeft = parseInt(bg.style.left); // ⭐ NEU
      bg.style.left = bgLeft + moveX + "px"; // ⭐ NEU

      // links raus → rechts wieder anhängen
      if (bgLeft + bg.offsetWidth < 0) {
        // ⭐ NEU
        let maxRight = Math.max(
          // ⭐ NEU
          parseInt(currentBG.style.left), // ⭐ NEU
          parseInt(currentBG2.style.left), // ⭐ NEU
          parseInt(currentBG3.style.left), // ⭐ NEU
        ); // ⭐ NEU
        bg.style.left = maxRight + bg.offsetWidth - overlap + "px"; // ⭐ NEU: kleiner Überlappungs-Puffer
      }

      // rechts raus → links wieder anhängen
      if (bgLeft > window.innerWidth) {
        // ⭐ NEU
        let minLeft = Math.min(
          // ⭐ NEU
          parseInt(currentBG.style.left), // ⭐ NEU
          parseInt(currentBG2.style.left), // ⭐ NEU
          parseInt(currentBG3.style.left), // ⭐ NEU
        ); // ⭐ NEU
        bg.style.left = minLeft - bg.offsetWidth + overlap + "px"; // ⭐ NEU: kleiner Überlappungs-Puffer
      }
    }); // ⭐ NEU

    enemies.forEach((enemy) => {
      if (!enemy.hit) {
        enemy.initialX -= 0.5;
      }
      enemy.element.style.left = `${enemy.initialX + left}px`;
    });

    bullets.forEach((bullet) => {
      bullet.initialX += 100;
      bullet.element.style.left = `${bullet.initialX + left}px`;
    });

    if (rightArrow) {
      left -= 5;
    }

    if (leftArrow) {
      left += 5;
    }

    if (attacking) {
      UpdateState("ATTACK");
    } else if (leftArrow || rightArrow) {
      UpdateState("WALK");
    } else {
      UpdateState("IDLE");
    }
  }
}
function movment() {
  if (state !== "DIE") {
    updateEnemies();
  }
  if (state === "DIE" && frame < 7) {
    // Führe die Sterbeanimation einmal aus
    pirate.src = `PNG/2/2_entity_000_DIE_00${frame}.png`;
    frame++;
  } else if (state !== "DIE") {
    // Andere Zustände
    pirate.src = `PNG/2/2_entity_000_${state}_00${frame}.png`;
    frame++;
    if (leftArrow) {
      pirate.style.transform = "scaleX(-1)";
    }
    if (rightArrow) {
      pirate.style.transform = "scaleX(1)";
    }

    if (frame == 7) {
      attacking = false;
      frame = 0;
    }
  }
}

function createEnemies() {
  for (let i = 0; i < enemyCount; i++) {
    const enemyType = Math.floor(Math.random() * 2) + 2;
    const enemy = document.createElement("img");
    enemy.classList.add("enemy");
    enemy.src = `PNG/Minotaur_0${enemyType}/PNG Sequences/Walking/Minotaur_0${enemyType}_Walking_000.png`;

    document.getElementById("enemiesContainer").appendChild(enemy);

    enemies.push({
      element: enemy,
      initialX: 400 + i * 600 * Math.random(),
      frame: i % 17, //Mathematische rest Beispiel i=20; 20/17 =1 Rest 3 -> frame =3
      type: enemyType,
    });
  }
}

function checkCollisions() {
  enemies.forEach((enemy) => {
    if (!enemy.hit) {
      bullets.forEach((bullet, bulletIndex) => {
        const bulletRect = bullet.element.getBoundingClientRect();
        const enemyRect = enemy.element.getBoundingClientRect();

        if (
          bulletRect.left < enemyRect.right &&
          bulletRect.right > enemyRect.left &&
          bulletRect.top < enemyRect.bottom &&
          bulletRect.bottom > enemyRect.top
        ) {
          deathSoundEnemy.currentTime = 0;
          deathSoundEnemy.play();

          enemy.hit = true;
          enemy.frame = 5;

          bullet.element.remove();
          bullets.splice(bulletIndex, 1);
        }
      });
    }
  });
}

function updateEnemies() {
  enemies.forEach((enemy) => {
    if (enemy.hit) {
      if (enemy.frame < 10) {
        enemy.element.src = `PNG/Minotaur_0${enemy.type}/PNG Sequences/Dying/Minotaur_0${enemy.type}_Dying_00${enemy.frame}.png`;
      } else {
        enemy.element.src = `PNG/Minotaur_0${enemy.type}/PNG Sequences/Dying/Minotaur_0${enemy.type}_Dying_0${enemy.frame}.png`;
      }
      enemy.frame++;

      if (enemy.frame > 14) {
        enemy.frame = 14;
      }
    } else {
      if (enemy.frame < 10) {
        enemy.element.src = `PNG/Minotaur_0${enemy.type}/PNG Sequences/Walking/Minotaur_0${enemy.type}_Walking_00${enemy.frame}.png`;
      } else {
        enemy.element.src = `PNG/Minotaur_0${enemy.type}/PNG Sequences/Walking/Minotaur_0${enemy.type}_Walking_0${enemy.frame}.png`;
      }
      enemy.frame++;
      if (enemy.frame == 17) {
        enemy.frame = 0;
      }
    }
  });
}

function UpdateState(newState) {
  if (state !== newState) {
    frame = 0;
    state = newState;
  }
}



function checkCharacterCollision() {
  if (state !== "DIE") {
    const pirateRect = pirate.getBoundingClientRect();

    enemies.forEach((enemy) => {
      const enemyRect = enemy.element.getBoundingClientRect();

      // Kollision zwischen Charakter und Gegner überprüfen
      if (
        pirateRect.left < enemyRect.right &&
        pirateRect.right > enemyRect.left &&
        pirateRect.top < enemyRect.bottom &&
        pirateRect.bottom > enemyRect.top &&
        !enemy.hit
      ) {
        // Kollision erkannt
        UpdateState("DIE"); // Setze den Zustand des Charakters auf 'DIE'

        // Bewegung des Charakters und der Gegner stoppen
        leftArrow = false;
        rightArrow = false;

        // Gegnerbewegung stoppen
        enemies.forEach((enemy) => {
          enemy.movable = false; // Füge eine Eigenschaft hinzu, um die Bewegung zu kontrollieren
        });
         // ⭐ Popup anzeigen
        const deadDiv = document.querySelector(".Dei");
        deadDiv.style.display = "block";
        deadDiv.classList.add("show");

      }
    });
  }
}
