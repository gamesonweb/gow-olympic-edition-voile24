import {
  FreeCamera,
  FollowCamera,
  HemisphericLight,
  MeshBuilder,
  Scene,
  Vector3,
  SceneLoader,
  Vector2,
  KeyboardEventTypes,
  Color3,
  Color4,
  CubeTexture,
  Mesh,
  StandardMaterial,
  Texture,
  Quaternion,
  PhysicsImpostor,
} from "@babylonjs/core";


import { Inspector } from "@babylonjs/inspector";
import { GlobalManager } from "./globalmanager";
import { levels } from './levels';
import CustomLoadingScreen   from "./customLoadingScreen.js";


import finishUrl from "../assets/models/finish_line.glb";
import mountain1MeshUrl from "../assets/models/mountain1.glb";
import mountain2MeshUrl from "../assets/models/mountain2.glb";
import arrowMeshUrl from "../assets/models/direction_arrows.glb";
import frogMeshUrl from "../assets/models/frog.glb";
import flowersMeshUrl from "../assets/models/pond_pack.glb";
import olympicMeshUrl from "../assets/models/olympic_rings.glb";
import landscapeMeshUrl from "../assets/models/landscape.glb";
import vogueMeshUrl from "../assets/models/vogueMery.glb";

import chekered from "../assets/textures/checkered.png";
import Player from "./player";
import Mountain from "./moutain";
import Weather from "./weather";

class Game {
  canvas;
  engine;
  gameScene;
  sphere;
  mapsize = 1000;
  phase = 0.0;
  camera;
  startTimer = 0;
  timerActive = false;

  

  player;
  spawnPoint;
  inputMap = {};
  actions = {};

  width;
  height;
  rows;
  buoys = [];

  constructor(canvas, engine) {
    GlobalManager.engine = engine;
    GlobalManager.canvas = canvas;
  }

  initKeyboard() {
    GlobalManager.scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          this.inputMap[kbInfo.event.code] = true;
          break;
        case KeyboardEventTypes.KEYUP:
          this.inputMap[kbInfo.event.code] = false;
          this.actions[kbInfo.event.code] = true;
          break;
      }
    });
  }

  async start() {
    await this.initGame();
    this.gameLoop();
    // this.endGame();
    
  }
  async loadLevel(level) {
    this.width = level.width;
    this.height = level.height;
    this.rows = [];
    for (let y = 0; y < this.height; y++) {
      let currentRow = [];
      for (let x = 0; x < this.width; x++) {
        let tile = level.rows[this.height - 1 - y].charAt(x);
        currentRow.push(tile);
      }
      this.rows.push(currentRow);
    }
  }

  async drawLevel(player) {
    const scaleFactor = this.mapsize / this.width; // 2000 / 40 = 50
    for (let y = 0; y < this.height; y++) {
      let currentRow = this.rows[y];
      for (let x = 0; x < this.width; x++) {
        let currentCell = currentRow[x];

        let object;
        let buoy;
        let mountain;
        let finishline;
        let hasNeighbor;
        let texture;
        let material;
        let animation;
        let miniMountain;
        // let  objectDepth;
        // Vérification

        switch (currentCell) {
          case "S":
            player.mesh.position = new Vector3(
              x * scaleFactor - this.mapsize / 2,
              4,
              y * scaleFactor - this.mapsize / 2
            );
            
            break;
          case "F":
            finishline = SceneLoader.ImportMeshAsync(
              "",
              "",
              finishUrl,
              GlobalManager.scene
            );
            finishline.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                0,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(3, 3, 3);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.name = "finishline";

              mesh.checkCollisions = true;

              for (let childMesh of result.meshes) {
                childMesh.checkCollisions = true;
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }
            });

            object = MeshBuilder.CreateBox(
              "ENDWALL",
              {
                height: 50,
                width: 50,
                depth: 50,
              },
              GlobalManager.scene
            );
            object.checkCollisions = true;
            object.position = new Vector3(
              x * scaleFactor - this.mapsize / 2,
              0,
              y * scaleFactor - this.mapsize / 2
            );
            object.scaling = new Vector3(0.9, 0.5, 0.05);
            object.isVisible = false;
            break;
          case "M":
            //TODO Ajouter un murc

            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              mountain1MeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(0.12, 0.12, 0.12);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.name = "Mountain";

              // mesh.checkCollisions = true;

              for (let childMesh of result.meshes) {
                // childMesh.checkCollisions = true;
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }
            });

            break;
          case "m":
            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              mountain2MeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(50, 50, 50);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.name = "mountain";

              for (let childMesh of result.meshes) {
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }
            });

            break;
          case "L":
            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              landscapeMeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(10, 10, 10);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.name = "Landscape";

              mesh.rotate(Vector3.Up(), Math.PI/2);

              for (let childMesh of result.meshes) {
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }
            });

            break;
          case "O":
            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              olympicMeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(5, 5, 5);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.name = "Olympic";

              // mesh.checkCollisions = true;

              for (let childMesh of result.meshes) {
                // childMesh.checkCollisions = true;
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }
            });

            break;
          case "V":
            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              vogueMeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(50, 50, 50);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.name = "VogueMery";
              mesh.rotate(Vector3.Up(), Math.PI);

              for (let childMesh of result.meshes) {
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }
            });

            break;
          case "D":

            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              arrowMeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(1, 1, 1);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.rotate(Vector3.Up(), Math.PI);
              mesh.name = "Arrow";

              for (let childMesh of result.meshes) {
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }

              animation = result.animationGroups;
              animation.forEach((anim) => {
                anim.start(true);
              });
            });

            break;

          case "Z":
            //TODO Ajouter un murc

            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              arrowMeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              );
              mesh.scaling = new Vector3(1, 1, 1);
              mesh.rotationQuaternion = Quaternion.Identity();

              mesh.name = "Arrow";

              for (let childMesh of result.meshes) {
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }

              animation = result.animationGroups;
              animation.forEach((anim) => {
                anim.start(true);
              });
            });

            break;
          case "Q":
            //TODO Ajouter un murc

            object = SceneLoader.ImportMeshAsync(
              "",
              "",
              arrowMeshUrl,
              GlobalManager.scene
            );
            object.then((result) => {
              let mesh = result.meshes[0];
              mesh.position = new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2 + 8
              );
              mesh.scaling = new Vector3(1, 1, 1);
              mesh.rotationQuaternion = Quaternion.Identity();
              mesh.rotate(Vector3.Up(), Math.PI);
              mesh.name = "Arrow";

              for (let childMesh of result.meshes) {
                if (childMesh.getTotalVertices() > 0) {
                  childMesh.receiveShadows = true;
                  GlobalManager.addShadowCaster(childMesh);
                }
              }

              animation = result.animationGroups;
              animation.forEach((anim) => {
                anim.start(true);
              });
            });

            break;
          case "b":
            mountain = new Mountain(
              new Vector3(
                x * scaleFactor - this.mapsize / 2,
                2,
                y * scaleFactor - this.mapsize / 2
              )
            );
            await mountain.init();
            break;
          case "B":
            object = MeshBuilder.CreateBox(
              "barrier",
              {
                height: 2,
                width: 30,
                depth: 30,
              },
              GlobalManager.scene
            );
            object.checkCollisions = true;
            object.position = new Vector3(
              x * scaleFactor - this.mapsize / 2,
              4.5,
              y * scaleFactor - this.mapsize / 2
            );
            //  object.scaling = new Vector3(0.8335, 1, 0.0005);

            object.material = new StandardMaterial(
              "wallMaterial",
              GlobalManager.scene
            );
            object.material.diffuseColor = new Color3(1, 0, 0);
            object.visibility = 0.5;

            // Création de la texture
            texture = new Texture(chekered, GlobalManager.scene);

            // Création du matériau
            material = new StandardMaterial(
              "materialForWall",
              GlobalManager.scene
            );
            material.diffuseTexture = texture; // Appliquer la texture comme texture diffuse

            // Appliquer le matériau à la paroi
            object.material = material;

            hasNeighbor = false;
            if (x > 0 && currentRow[x - 1] === "B") {
              // Vérifier le voisin à gauche
              hasNeighbor = true;
            }
            if (x < this.width - 1 && currentRow[x + 1] === "B") {
              // Vérifier le voisin à droite
              hasNeighbor = true;
            }

            // Appliquer la rotation seulement s'il y a un voisin à gauche ou à droite
            if (!hasNeighbor) {
              object.rotate(Vector3.Up(), Math.PI / 2); // Rotation de 90 degrés
            }
            break;
          default:
            break;
        }
      }
    }
  }

  async initGame() {
    GlobalManager.gameState = GlobalManager.States.STATE_READY;

    GlobalManager.engine.loadingScreen = new CustomLoadingScreen();
    GlobalManager.engine.displayLoadingUI();

    await this.createScene();
    
    this.initKeyboard();

    // MANQUE LA GESTION DES STATES
    await this.loadLevel(levels[GlobalManager.circuitChoice]);
    await this.drawLevel(this.player);

    const weather = new Weather(this.player);
    await weather.setWeather(GlobalManager.weatherChoice);
   
    GlobalManager.engine.hideLoadingUI();

    //TODO : le bloc suivant à supprimer
    window.addEventListener("keydown", (event) => {
      if (event.key === "i" || event.key === "I") {
        Inspector.Show(this.gameScene, Game);
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "w" || event.key === "W") {
        weather.setWeather(2);
      }
      if (event.key === " ") {
        this.startCountDown(); // Démarre le compte à rebours
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "e" || event.key === "E") {
        weather.setWeather(1);
      }
    });

  }


  gameLoop() {
      
    const divFps = document.getElementById("fps");
    const time = document.getElementById("time");
    GlobalManager.engine.runRenderLoop(() => {
      if(GlobalManager.gameState == GlobalManager.States.STATE_RUNNING) {
        this.startTimer = this.startTimer + GlobalManager.deltaTime
        this.updateGame();
        
      }
      if(GlobalManager.gameState == GlobalManager.States.STATE_END) {
        this.stopTimer();
        document.getElementById("chrono").innerText = this.startTimer.toFixed(2);
        document.getElementById("playerinfo").style.display = 'flex';
        GlobalManager.changeGameState(GlobalManager.States.STATE_RESTART);
      }
      if(GlobalManager.gameState == GlobalManager.States.STATE_RESTART) {
        this.endGame();
      }
      time.innerHTML = this.startTimer.toFixed(2) + " secondes";
      GlobalManager.update();
      divFps.innerHTML = GlobalManager.engine.getFps().toFixed() + " fps";
      GlobalManager.scene.render();
    });
  }

  updateGame() {
    if (typeof this.player !== 'undefined' && typeof this.player.mesh !== 'undefined') {
      this.player.update(this.inputMap, this.actions);
    }
  }

  async createScene() {
    //Scene
    GlobalManager.scene = new Scene(GlobalManager.engine);
    GlobalManager.scene.collisionsEnabled = true;
    const assumedFramesPerSecond = 60;
    GlobalManager.scene.gravity = new Vector3(
      0,
      GlobalManager.gravityVector / assumedFramesPerSecond,
      0
    );

    //Player
    this.player = new Player(new Vector3(
      this.mapsize / 2,
       4,
      this.mapsize / 2
     ));
     await this.player.init();

    //Camera
    // GlobalManager.camera = new FollowCamera(
    //   "followCam1",
    //   GlobalManager.scene
    // );
    GlobalManager.camera = new FollowCamera("FollwoCam", new Vector3(
      this.mapsize / 2,
       300,
      this.mapsize / 2
     ), GlobalManager.scene, this.player.mesh)
    GlobalManager.camera.radius = 12; // Distance de la cible
    GlobalManager.camera.heightOffset = 4; // Hauteur par rapport à la cible
    GlobalManager.camera.rotationOffset = 180; // Rotation de 90 degrés autour de la cible
    GlobalManager.camera.attachControl(this.canvas, true);
    GlobalManager.camera.inputs.clear(); // Supprimer les inputs par défaut
    


    //Light
    GlobalManager.addLight(new HemisphericLight(
      "light1",
      new Vector3(0, 1, 0),
      GlobalManager.scene
    ));

    setTimeout(() => {
      document.getElementById("messageContainer").style.display = 'block';
    },2000);
  }

  go() {
    // Vérifie si le timer est déjà actif
    if(GlobalManager.gameState == GlobalManager.States.STATE_READY) {
      if (!this.timerActive) {
        this.timerActive = true; // Active le timer
        this.startTimer = 0; // Réinitialise le timer
  
        GlobalManager.changeGameState(GlobalManager.States.STATE_RUNNING);
      } else {
        console.log('Timer is already running.');
      }
    }
    
  }

  stopTimer() {
    this.timerActive = false; // Désactive le timer
    console.log(`Timer stopped at ${this.startTimer.toFixed(2)} seconds.`);
  }

  endGame() {
    // Arrêt de la boucle de rendu
    GlobalManager.engine.stopRenderLoop();

    // Dispose tous les meshes dans la scène
    GlobalManager.scene.meshes.forEach(mesh => {
        mesh.dispose();
    });

    // Dispose tous les sons dans la scène
    GlobalManager.scene.soundTracks.forEach(soundTrack => {
        soundTrack.soundCollection.forEach(sound => {
            sound.dispose();
        });
    });

    // Dispose tous les matériaux et textures
    GlobalManager.scene.materials.forEach(material => {
        material.dispose();
    });
    GlobalManager.scene.textures.forEach(texture => {
        texture.dispose();
    });

    // Dispose la scène elle-même
    GlobalManager.scene.dispose();

    // Éventuellement réinitialiser des paramètres ou nettoyer des ressources supplémentaires
    this.resetGame();
}

resetGame() {
    // Réinitialise les variables du jeu si nécessaire
    this.startTimer = 0;
    this.timerActive = false;
    // Autres réinitialisations au besoin
}

startCountDown() {
  if (GlobalManager.gameState == GlobalManager.States.STATE_READY) {
    document.getElementById("messageContainer").style.display = 'none';
    let display = document.getElementById('countDown');
    document.getElementById("countDownContainer").style.display = 'block'; // Affiche la div
    let timer = 3;

    // Mise à jour immédiate du compteur avant de démarrer l'intervalle
    const updateCountDown = () => {
      display.textContent = timer; // Met à jour le texte dans la div avec la valeur actuelle de timer
      if (timer-- <= 0) {
        clearInterval(countdownInterval); // Arrête l'intervalle une fois le compte à rebours terminé
        display.textContent = "Go!";
        setTimeout(() => {
          display.textContent = ""; // Efface le texte après 1 seconde
          this.go();
          document.getElementById("countDownContainer").style.display = 'none'; // Masque la div
        }, 1000);
      }
    };

    // Appel immédiat
    updateCountDown();
    
    // Création d'un intervalle qui se déclenche chaque seconde
    let countdownInterval = setInterval(updateCountDown, 1000);
  }
}



}

export default Game;
