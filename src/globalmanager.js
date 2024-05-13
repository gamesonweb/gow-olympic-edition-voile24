import { Vector3 } from "@babylonjs/core";

class GlobalManager {
  engine;
  canvas;
  scene;
  camera;
  lights = [];
  circuitChoice = 0;
  weatherChoice = 1;
  gameState ;

  shadowGenerators = [];

  deltaTime;
  choiceWeather;

  gravityVector = new Vector3(0, 0, 0);
  States = Object.freeze({
    STATE_NONE: 0,
    STATE_INIT: 10,
    STATE_LOADING: 20,
    STATE_MENU: 25,
    STATE_LAUNCH: 40,
    STATE_NEW_LEVEL: 45,
    STATE_READY: 55,
    STATE_RUNNING: 60,
    STATE_END: 70,
    STATE_RESTART: 80,
  });

  constructor() {
  }

  static get instance() {
    return globalThis[Symbol.for(`PF_${GlobalManager.name}`)] || new this();
  }

  init(canvas, engine) {
    this.canvas = canvas;
    this.engine = engine;
  }

  update() {
    this.deltaTime = this.engine.getDeltaTime() / 1000.0;
  }

  addLight(light) {
    this.lights.push(light);
  }
  addShadowGenerator(shadowGen) {
    this.shadowGenerators.push(shadowGen);
  }

  addShadowCaster(object, bChilds) {
    bChilds = bChilds || false;
    for (let shad of this.shadowGenerators) {
      shad.addShadowCaster(object, bChilds);
    }
  }
  changeGameState(newState) {
    this.gameState = newState;
  }
  setLevel(level) {
    this.currentLevel = level;
  }
  setWeather(weather) {
    this.currentWeather = weather;
  }
}

const { instance } = GlobalManager;
export { instance as GlobalManager };
