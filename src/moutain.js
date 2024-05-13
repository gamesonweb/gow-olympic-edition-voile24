import {
  Quaternion,
  SceneLoader,
  TransformNode,
  Vector3,
  Color3,
} from "@babylonjs/core";
import { GlobalManager } from "./globalmanager";


import mountainMeshUrl from "../assets/models/buoySolo.glb";
import { Mesh, MeshBuilder } from "babylonjs";

class Mountain {
  mesh;
  spawnPoint;
  constructor(spawnPoint) {
    this.spawnPoint = spawnPoint;
  }

  async init() {

    const result = await SceneLoader.ImportMeshAsync(
      "",
      "",
      mountainMeshUrl,
      GlobalManager.scene
    );

    this.mesh = result.meshes[0];
    this.mesh.name = "mountain";
    this.mesh.rotationQuaternion = Quaternion.Identity();
    this.mesh.position = this.spawnPoint;
    this.mesh.scaling = new Vector3(0.1, 0.1, 0.1);

    for (let childMesh of result.meshes) {
      childMesh.checkCollisions = true; // Assurez-vous que les collisions sont vérifiées pour chaque sous-maillage
      if (childMesh.getTotalVertices() > 0) {
        childMesh.receiveShadows = true;
        GlobalManager.addShadowCaster(childMesh);
      }
    }

    this.mesh.ellipsoid = new Vector3(2, 2, 2);
    const ellipsoidOffset = 0.0;
    this.mesh.ellipsoidOffset = new Vector3(0, ellipsoidOffset, 0);
  }
}

export default Mountain;
