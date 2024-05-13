import {
  Quaternion,
  SceneLoader,
  TransformNode,
  Vector3,
  Color3,
  Color4,
  ParticleSystem,
  Texture,
} from "@babylonjs/core";
import { GlobalManager } from "./globalmanager";
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";

import playerMeshUrl from "../assets/models/yacht.glb";
import { Mesh, MeshBuilder } from "babylonjs";
import boatWake from "../assets/textures/boatWake.png";

const SPEED = 40;
const TURN_SPEED =  2*Math.PI;
const DEBUG_COLLISION = false;
class Player {
  scorehit = 0;

  mesh;

  spawnPoint;

  positiony;
  phase = 0.0;

  bounce_height = 0.2;

  boatWakeParticle;

  //Vecteur d'input
  moveInput = new Vector3(0, 0, 0);

  //Vecteur de deplacement
  moveDirection = new Vector3(0, 0, 0);

  lookDirectionQuaternion = Quaternion.Identity();

  constructor(spawnPoint) {
    this.spawnPoint = spawnPoint;
  }

  async init() {
    const result = await SceneLoader.ImportMeshAsync(
      "",
      "",
      playerMeshUrl,
      GlobalManager.scene
    );

    this.mesh = result.meshes[0];
    this.mesh.name = "boat";
    this.mesh.rotationQuaternion = Quaternion.Identity();
    this.mesh.position = this.spawnPoint;
    this.positiony = this.spawnPoint.y;

    // this.mesh.physicsImpostor = new PhysicsImpostor(this.mesh, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, GlobalManager.scene);

    for (let childMesh of result.meshes) {
      if (childMesh.getTotalVertices() > 0) {
        childMesh.receiveShadows = true;
        GlobalManager.addShadowCaster(childMesh);
      }
    }
    // Add boat wake (ajout du sillage)
    this.boatWake();

    this.mesh.ellipsoid = new Vector3(2, 3, 2);
    const ellipsoidOffset = 0.0;
    this.mesh.ellipsoidOffset = new Vector3(0, ellipsoidOffset, 0);

    if (DEBUG_COLLISION) {
      const a = this.mesh.ellipsoid.x;
      const b = this.mesh.ellipsoid.y;
      const points = [];
      for (
        let theta = -Math.PI / 2;
        theta < Math.PI / 2;
        theta += Math.PI / 36
      ) {
        const x = a * Math.cos(theta);
        const y = b * Math.sin(theta);
        points.push(new Vector3(0, y, x));
      }

      const ellipse = [];
      ellipse[0] = MeshBuilder.CreateLines(
        "ellipse",
        { points: points },
        GlobalManager.scene
      );
      ellipse[0].color = new Color3(1, 0, 0);
      ellipse[0].parent = this.mesh;
      const steps = 12;
      const dTheta = (2 * Math.PI) / steps;
      for (let i = 1; i <= steps; i++) {
        const points = [];
        ellipse[i] = ellipse[0].clone("ellipse" + i);
        ellipse[i].parent = this.mesh;
        ellipse[i].rotation.y = i * dTheta;
      }
    }
  }

  update(inputMap, actions) {
    this.getInputs(inputMap, actions);

    this.applyCameraToInputs();
    this.move();

    this.phase += 1.9 * GlobalManager.deltaTime;
    this.mesh.position.y =
      this.positiony + Math.sin(this.phase) * this.bounce_height; // Appliquer l'oscillation autour de la position de base
  }

  getInputs(inputMap, actions) {
    this.moveInput.set(0, 0, 0);

    this.boatWakeParticle.minSize = 0;
    this.boatWakeParticle.maxSize = 0;

    if (inputMap["KeyA"] || inputMap["ArrowLeft"]) {
      this.moveInput.x = -1;
      this.boatWakeParticle.minSize = 0;
      this.boatWakeParticle.maxSize = 0.3;
    } else if (inputMap["KeyD"] || inputMap["ArrowRight"]) {
      this.moveInput.x = 1;
      this.boatWakeParticle.minSize = 0;
      this.boatWakeParticle.maxSize = 0.3;
    }

    if (inputMap["KeyW"] || inputMap["ArrowUp"]) {
      this.moveInput.z = 1;
      this.boatWakeParticle.minSize = 0;
      this.boatWakeParticle.maxSize = 0.3;
    }

    if (actions["Space"]) {
      //TODO: Jump
    }
  }

  applyCameraToInputs() {
    this.moveDirection.set(0, 0, 0);

    if (this.moveInput.length() != 0) {
      //Recup le forward de la camera
      let forward = this.getForwardVector(GlobalManager.camera);
      forward.y = 0;
      forward.normalize();
      forward.scaleInPlace(this.moveInput.z);

      //Recup le right de la camera
      let right = this.getRightVector(GlobalManager.camera);
      right.normalize();
      right.scaleInPlace(this.moveInput.x);

      //Add les deux vect
      this.moveDirection = right.add(forward);

      //Normalise
      this.moveDirection.normalize();

      Quaternion.FromLookDirectionLHToRef(
        this.moveDirection,
        Vector3.UpReadOnly,
        this.lookDirectionQuaternion
      );
    }
  }

  move() {
    if (this.moveDirection.length() != 0) {
      //Quaternions !!
      Quaternion.SlerpToRef(
        this.mesh.rotationQuaternion,
        this.lookDirectionQuaternion,
        TURN_SPEED * GlobalManager.deltaTime,
        this.mesh.rotationQuaternion
      );

      this.moveDirection.scaleInPlace(SPEED * GlobalManager.deltaTime);
      // this.mesh.position.addInPlace(this.moveDirection);
    }

    this.moveDirection.addInPlace(
      GlobalManager.gravityVector.scale(GlobalManager.deltaTime)
    );
    this.mesh.moveWithCollisions(this.moveDirection);

    let collidedMesh = this.mesh.collider
      ? this.mesh.collider.collidedMesh
      : null;
    if (collidedMesh) {
      if (collidedMesh.name == "ENDWALL") {
        GlobalManager.changeGameState(GlobalManager.States.STATE_END);
        console.log("End of the game");
      }
    }
  }

  getUpVector(_mesh) {
    let up_local = _mesh.getDirection(Vector3.UpReadOnly);
    return up_local.normalize();
  }

  getForwardVector(_mesh) {
    let forward_local = _mesh.getDirection(Vector3.LeftHandedForwardReadOnly);
    return forward_local.normalize();
  }

  getRightVector(_mesh) {
    let right_local = _mesh.getDirection(Vector3.RightReadOnly);
    return right_local.normalize();
  }

  boatWake() {
    let attachedMeshNode = new TransformNode(
      "attachedMeshNode",
      GlobalManager.scene
    );
    let attachedMesh = MeshBuilder.CreateBox(
      "attachedMeshBoatWake",
      { size: 0.01 },
      GlobalManager.scene
    );
    attachedMeshNode.position = new Vector3(0, -2, -3, 5);
    attachedMeshNode.rotation = new Vector3(0, Math.PI, 0);
    attachedMesh.parent = attachedMeshNode;
    attachedMeshNode.parent = this.mesh;

    this.boatWakeParticle = new ParticleSystem(
      "boatWake",
      1000,
      GlobalManager.scene
    );
    this.boatWakeParticle.particleTexture = new Texture(
      boatWake,
      GlobalManager.scene
    );
    this.boatWakeParticle.emitter = attachedMesh;
    this.boatWakeParticle.color1 = new Color4(0.7, 0.7, 0.7);
    this.boatWakeParticle.color2 = new Color4(0.3, 0.3, 0.3);
    this.boatWakeParticle.colorDead = new Color4(0, 0, 0, 0);
    this.boatWakeParticle.minSize = 0;
    this.boatWakeParticle.maxSize = 0.3;
    this.boatWakeParticle.minLifeTime = 1;
    this.boatWakeParticle.maxLifeTime = 4;
    this.boatWakeParticle.emitRate = 450;
    this.boatWakeParticle.createPointEmitter(
      new Vector3(-15, -5, -10),
      new Vector3(15, -5, -25)
    );
    this.boatWakeParticle.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    this.boatWakeParticle.gravity = new Vector3(0, -9.81, 0);
    this.boatWakeParticle.minEmitPower = 0.5;
    this.boatWakeParticle.maxEmitPower = 1.0;
    this.boatWakeParticle.updateSpeed = 0.03;
    this.boatWakeParticle.direction1 = new Vector3(-6, 0, -5); // Direction de départ
    this.boatWakeParticle.direction2 = new Vector3(6, 0, -10); // Direction de fin

    this.boatWakeParticle.start();
  }
}

export default Player;
