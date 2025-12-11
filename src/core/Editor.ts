import { Object3D } from "three"
import { TransformControls, type TransformControlsMode } from "three/examples/jsm/Addons.js"; 
import type { SceneManager } from "./SceneManager";
import { AddObjectCommand,RemoveObjectCommand } from "./commands/BasicEditorCommands"; 
import { EditorCommandReceiver } from "./commands/History";
import { Selector } from "./Selector";


export class Editor {
  selectedObject: Object3D|null= null
  transform: TransformControls;
  commandsReciever: EditorCommandReceiver = new EditorCommandReceiver()
  selector:Selector
  selectable_objs:Object3D[] = []
  //TODO: Selection to handle selection

  constructor(public sceneManager:SceneManager) {
    this.transform = new TransformControls(sceneManager.camera,sceneManager.renderer.domElement)
    sceneManager.scene.add(this.transform.getHelper())
   
    this.transform.addEventListener("dragging-changed", e => {
        sceneManager.controls.enabled = !e.value;
    });

    
    this.selector = new Selector(sceneManager, this)
  }

  add(obj:Object3D):void {
    const addObjCmd = new AddObjectCommand(this.sceneManager.scene, obj)
    this.commandsReciever.execute(addObjCmd)
    this.selectable_objs.push(obj)
  }
  remove(obj:Object3D){
    const removeObjCmd = new RemoveObjectCommand(this.sceneManager.scene,obj)
    this.commandsReciever.execute(removeObjCmd)
    this.selectable_objs = this.selectable_objs.filter((o)=>o!=obj)
    
  }
  setTransformMode(mode:TransformControlsMode) {
    this.transform.setMode(mode)
  }
  select(obj:Object3D|null) {
    this.selectedObject = obj
    this.transform.detach()
    if(obj) this.transform.attach(obj)
  }

  
}
