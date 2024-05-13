import { Engine } from "@babylonjs/core";
import Game from "./game";
import backgroundImage from "../assets/images/backgroundMenu.png";
import { GlobalManager } from "./globalmanager";


let canvas;
let engine;


window.onload = () => {

  document.getElementById("backgroundImage").src = backgroundImage;

  const menu = document.getElementById("menu");
  const playButton = document.getElementById("playButton");
  const controlsButton = document.getElementById("controlsButton");
  const creditsButton = document.getElementById("creditsButton");
  let timer = document.getElementById("timeContainer");
  let sunnyChoice = document.getElementById("sunny");
  let rainyChoice = document.getElementById("rainy");
  let circuit1 = document.getElementById("circuit1");
  let circuit2 = document.getElementById("circuit2");
  let restartButton = document.getElementById("restartButton");
  let playerInfo = document.getElementById("playerinfo");

  const choicesUser = document.getElementById("choicesUser");
  

  playButton.addEventListener("click", () => {
    menu.style.display = "none";
    choicesUser.style.display = "flex";

  });

  // controlsButton.addEventListener("click", () => {
  //   menu.style.display = "none";
  // });

  // creditsButton.addEventListener("click", () => {
  //   menu.style.display = "none";
  // });



  sunnyChoice.addEventListener("click", () => {
    sunnyChoice.classList.add("active");
    rainyChoice.classList.remove("active");
    GlobalManager.weatherChoice = 1;
  });
  rainyChoice.addEventListener("click", () => {
    GlobalManager.weatherChoice = 2;
    rainyChoice.classList.add("active");
    sunnyChoice.classList.remove("active");
  });

  circuit1.addEventListener("click", () => {
    GlobalManager.circuitChoice = 0;
    circuit1.classList.add("active");
    circuit2.classList.remove("active");
  });
  circuit2.addEventListener("click", () => {
    GlobalManager.circuitChoice = 1;
    circuit2.classList.add("active"); 
    circuit1.classList.remove("active");
  });

  restartButton.addEventListener("click", () => {
    menu.style.display = "none";
    document.getElementById("gui").style.display = "block";
    choicesUser.style.display = "flex";
    playerInfo.style.display = "none";
    console.log(playerInfo);
    console.log(choicesUser);
    console.log("restart");
  });



  document.getElementById("buttonGo").addEventListener("click", () => {
    document.getElementById("gui").style.display = "none";
    GlobalManager.changeGameState(GlobalManager.States.STATE_RUNNING);
      babylonInit().then(() => {
        timer.style.display = "block";
        const game = new Game(canvas, engine);
        game.start();
      });

  });

};


const babylonInit = async () => {
  canvas = document.getElementById("renderCanvas");

  engine = new Engine(canvas, false, {
    adaptToDeviceRatio: true,
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });

};


