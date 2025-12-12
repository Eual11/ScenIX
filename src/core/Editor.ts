import { TransformControls, type TransformControlsMode } from "three/examples/jsm/Addons.js";
import type { SceneManager } from "./SceneManager";
import { AddObjectCommand, RemoveObjectCommand, TransformCommand } from "./commands/BasicEditorCommands";
import { EditorCommandReceiver } from "./commands/History";
import { Selector } from "./Selector";
import { EditorObject } from "./EditorObject";
import { createBox, createCylinder, createSphere } from "./ShapeFactory";
import { Vector3 } from "three";


export class Editor {
  selectedObject: EditorObject | null = null
  transform: TransformControls;
  commandsReciever: EditorCommandReceiver = new EditorCommandReceiver()
  selector: Selector
  currentActiveCmd: TransformCommand | null = null
  objects: Map<string, EditorObject> = new Map()
  gridSize: number = 1
  snappingEnabled: boolean = false
  constructor(public sceneManager: SceneManager) {
    this.transform = new TransformControls(sceneManager.camera, sceneManager.renderer.domElement)
    sceneManager.scene.add(this.transform.getHelper())

    this.transform.addEventListener("dragging-changed", e => {
      sceneManager.controls.enabled = !e.value;
    });


    this.selector = new Selector(sceneManager, this)

    this.transform.addEventListener("mouseDown", () => {
      if (!this.selectedObject) return
      this.currentActiveCmd = new TransformCommand(this.selectedObject.mesh)
    })
    this.transform.addEventListener("mouseUp", () => {
      if (!this.selectedObject || !this.currentActiveCmd) {
        return
      }
      if(this.snappingEnabled) {
      this.snapVec3(this.selectedObject.mesh.position)
      this.selectedObject.mesh.updateMatrix()
      }
      this.currentActiveCmd.storeAfter()
      this.commandsReciever.execute(this.currentActiveCmd)
      this.currentActiveCmd = null
    })
  }

  add(obj: EditorObject): void {
    const addObjCmd = new AddObjectCommand(this.sceneManager.scene, obj.mesh)
    this.commandsReciever.execute(addObjCmd)
    this.objects.set(obj.id, obj)
  }
  remove(obj: EditorObject) {
    const removeObjCmd = new RemoveObjectCommand(this.sceneManager.scene, obj.mesh)
    if (obj == this.selectedObject) {
      this.select(null)
    }
    this.commandsReciever.execute(removeObjCmd)
    this.objects.delete(obj.id)

  }
  setTransformMode(mode: TransformControlsMode) {
    this.transform.setMode(mode)
  }
  select(obj: EditorObject | null) {
    this.selectedObject = obj
    this.transform.detach()
    if (obj) this.transform.attach(obj.mesh)

  }


  moveSelected(position: [number, number, number]) {
    if (!this.selectedObject) return;

    const cmd = new TransformCommand(this.selectedObject.mesh);
    cmd.storeBefore();
    this.selectedObject.mesh.position.set(...position);
    if(this.snappingEnabled) {
      this.snapVec3(this.selectedObject.mesh.position)
    }
    this.selectedObject.mesh.updateMatrix()
    cmd.storeAfter();
    this.commandsReciever.execute(cmd);
  }

  rotateSelected(rotation: [number, number, number]) {
    if (!this.selectedObject) return;

    const cmd = new TransformCommand(this.selectedObject.mesh);
    cmd.storeBefore();
    this.selectedObject.mesh.rotation.set(...rotation);
    this.selectedObject.mesh.updateMatrix()
    cmd.storeAfter();
    this.commandsReciever.execute(cmd);
  }

  scaleSelected(scale: [number, number, number]) {
    if (!this.selectedObject) return;

    const cmd = new TransformCommand(this.selectedObject.mesh);
    cmd.storeBefore();
    this.selectedObject.mesh.scale.set(...scale);
    this.selectedObject.mesh.updateMatrix()
    cmd.storeAfter();
    this.commandsReciever.execute(cmd);
  }

  saveScene(): string {
    let editor_objects = []
    for (const [_, obj] of this.objects.entries()) {
      editor_objects.push(obj.serialize())
    }
    const editor_state = {
      transform_mode: this.transform.getMode(),
      selectedObjectId: this.selectedObject ? this.selectedObject.id : null,
      snappingEnabled: this.snappingEnabled,
      gridSize:this.gridSize
      
    }

    return JSON.stringify({ editor_state, editor_objects }, null, 2)
  }

  async loadScene(json: string) {
    const data = JSON.parse(json);
    try {

      this.clearSceneObjects()

      // Recreate objects
      for (const entry of data.editor_objects) {
        let obj: EditorObject | null = null;
        switch (entry.objectType) {
          case "box": {
            obj = createBox()
            break;
          }
          case "sphere": {
            obj = createSphere()
            break;
          }
          case "cylinder": {
            obj = createCylinder()
            break;
          }
        }
        if (!obj) {
          continue
        }

        // Apply transforms
        obj.mesh.position.set(...(entry.position as [number, number, number]));
        obj.mesh.rotation.set(...(entry.rotation as [number, number, number]));
        obj.mesh.scale.set(...(entry.scale) as [number, number, number]);
        obj.mesh.updateMatrix();

        obj.mesh.userData.editorId = entry.id;
        obj.id = entry.id

        this.objects.set(entry.id, obj);
        this.sceneManager.scene.add(obj.mesh);
      }

      if (data.editor_state.selectedObjectId) {
        this.select(this.objects.get(data.editor_state.selectedObjectId) ?? null)
      }

      this.snappingEnabled = data.editor_state.snappingEnabled
      this.gridSize = data.editor_state.gridSize || 1
    } catch (e) {
      console.error("Failed to load state", e)
    }

  }


  clearSceneObjects() {

    for (const [_, obj] of this.objects.entries()) {
      this.sceneManager.scene.remove(obj.mesh)
    }
    this.selectedObject = null


    this.transform.detach();
    this.objects.clear();
  }
  snapVec3(v:Vector3) {
      v.set(
        Math.round(v.x/this.gridSize)*this.gridSize,
        Math.round(v.y/this.gridSize)*this.gridSize,
        Math.round(v.z/this.gridSize)*this.gridSize,
      )
      
  }


}





