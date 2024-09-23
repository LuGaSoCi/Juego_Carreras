import { UIManager } from './ui1.js';
import { Player } from './player1.js';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
}; 

const game = new Phaser.Game(config);
let players = [];
let uiManager;
let finishLine;
let canMove = false; // Nueva variable para controlar el movimiento

// Web Workers
const distanceWorker = new Worker('./workerDistance.js');
const lapsWorker = new Worker('./workerLaps.js');
const timerWorker = new Worker('./workerTimer.js');
function preload() {
    this.load.image('car', './assets/car3.png');
    this.load.image('track', './assets/track.png');
    this.load.image('startButton', './assets/startButton.png'); // Cargar la imagen del botón
}

function create() {
    players = [];
    uiManager = new UIManager(this);
    this.endGame = endGame.bind(this);

    const trackBackground = this.add.image(game.config.width / 2, game.config.height / 2, 'track').setOrigin(0.5);
    trackBackground.displayWidth = game.config.width;
    trackBackground.displayHeight = game.config.height;

    const barrierThickness = 0;
    const barrierColor = 0x0000ff; 

    const outerBarrier = this.add.graphics();
    outerBarrier.fillStyle(barrierColor, 1);
    outerBarrier.fillRect(0, 0, game.config.width, barrierThickness);
    outerBarrier.fillRect(0, 0, barrierThickness, game.config.height);
    outerBarrier.fillRect(0, game.config.height - barrierThickness, game.config.width, barrierThickness);
    outerBarrier.fillRect(game.config.width - barrierThickness, 0, barrierThickness, game.config.height);
    outerBarrier.setDepth(0);

    const innerBarrierThickness = 0;
    const innerBarrierColor = 0xff0000;

    const innerBarrierX = game.config.width / 4;
    const innerBarrierY = game.config.height / 4;
    const innerBarrierWidth = game.config.width / 2;
    const innerBarrierHeight = game.config.height / 2;

    const innerBarrier = this.physics.add.staticGroup();

    innerBarrier.create(innerBarrierX + innerBarrierWidth / 2, innerBarrierY, 'block')
        .setDisplaySize(innerBarrierWidth, innerBarrierThickness).setOrigin(0.5);
    innerBarrier.create(innerBarrierX + innerBarrierWidth / 2, innerBarrierY + innerBarrierHeight, 'block')
        .setDisplaySize(innerBarrierWidth, innerBarrierThickness).setOrigin(0.5);
    innerBarrier.create(innerBarrierX, innerBarrierY + innerBarrierHeight / 2, 'block')
        .setDisplaySize(innerBarrierThickness, innerBarrierHeight).setOrigin(0.5);
    innerBarrier.create(innerBarrierX + innerBarrierWidth, innerBarrierY + innerBarrierHeight / 2, 'block')
        .setDisplaySize(innerBarrierThickness, innerBarrierHeight).setOrigin(0.5);

    finishLine = this.physics.add.staticGroup();
    finishLine.create(550, game.config.height / 1.18, 'track')
        .setOrigin(0.5)
        .setDisplaySize(1, 190);

    Player.setFinishLine(finishLine);

    players.push(new Player(this, 600, this.game.config.height - 100, 'car', 'jugador1'));
    players.push(new Player(this, 600, this.game.config.height - 100, 'car', 'jugador2'));

    players.forEach(player => {
        this.physics.add.collider(player.sprite, innerBarrier);
    });

    // Crear el botón de inicio como imagen
    const startButton = this.add.image(game.config.width / 2, game.config.height / 2, 'startButton')
        .setOrigin(0.5)
        .setInteractive();

        startButton.on('pointerdown', () => {
            canMove = true; // Permitir movimiento
            console.log('Start button clicked, sending start message to timerWorker');
            timerWorker.postMessage('start'); // Iniciar el temporizador
            startButton.destroy(); // Destruir el botón después de hacer clic
        });
        

    uiManager.distanceText1.setDepth(1);
    uiManager.distanceText2.setDepth(1);
    uiManager.lapsText1.setDepth(1);
    uiManager.lapsText2.setDepth(1);
    uiManager.timeText.setDepth(1);
    
     // Configuramos para escuchar mensajes del worker del temporizador
     timerWorker.onmessage = function(e) {
        //const tiempo = e.data;        
        //uiManager.updateTimer(tiempo); 
        console.log('Message from timer worker:', e.data); // Log in main thread console          
    };        

    distanceWorker.onmessage = function(e) {
        const { player, distance } = e.data;
        const currentPlayer = players.find(p => p.playerName === player);
        if (currentPlayer) {
            currentPlayer.distance = distance;
        }
    };

    lapsWorker.onmessage = function(e) {
        const { player, laps } = e.data;
        const currentPlayer = players.find(p => p.playerName === player);
        if (currentPlayer) {
            currentPlayer.laps = laps;
        }
    };

    players.forEach(player => {
        distanceWorker.postMessage({ player: player.playerName, distance: player.distance });
        lapsWorker.postMessage({ player: player.playerName }); 
    });
    timerWorker.postMessage('start');    
    
    const line = this.add.graphics();
    line.lineStyle(5, 0xff0000, 1);
    line.moveTo(game.config.width / 2 - 100, 100);
    line.lineTo(game.config.width / 2 + 100, 100); 
    
    
}

function update() {
    if (canMove) { // Solo permitir movimiento si el juego ha comenzado
        players.forEach(player => {
            player.update();

            distanceWorker.postMessage({ player: player.playerName, distance: player.distance });

            if (player.crossedFinishLine() && player.laps < 1) {
                lapsWorker.postMessage({ player: player.playerName });
            }
            if (player.laps >= 1) {
                this.endGame(`${player.playerName} gana la carrera!`);
                timerWorker.postMessage('stop');
            }
        });
    }
    uiManager.updateUI(players);
}

function endGame(message) {
    this.physics.pause();
    players.forEach(player => {
        player.sprite.setVelocity(0);
        player.sprite.setAngularVelocity(0);
    });
    
    timerWorker.terminate();  
    distanceWorker.terminate();  
    lapsWorker.terminate(); 
    uiManager.showVictoryMessage(message);    
    const restartButton = this.add.text(game.config.width / 2, game.config.height / 2 + 100, 'Reiniciar Juego', {
        fontSize: '32px',
        fill: '#ffffff'
    }).setOrigin(0.5).setDepth(2);

    restartButton.setInteractive();    
    restartButton.on('pointerdown', () => {
        this.scene.restart();  // Reinicia la escena completa
    });
}
