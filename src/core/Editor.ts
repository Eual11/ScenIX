import { TransformControls, type TransformControlsMode } from "three/examples/jsm/Addons.js"; 
import type { SceneManager } from "./SceneManager";
import { AddObjectCommand,RemoveObjectCommand, TransformCommand } from "./commands/BasicEditorCommands"; 
import { EditorCommandReceiver } from "./commands/History";
import { Selector } from "./Selector";
import type { EditorObject } from "./EditorObject";


export class Editor {
  selectedObject: EditorObject|null= null
  transform: TransformControls;
  commandsReciever: EditorCommandReceiver = new EditorCommandReceiver()
  selector:Selector
  currentActiveCmd:TransformCommand|null = null
  objects:Map<string,EditorObject> = new Map()
  //TODO: Selection to handle selection
  constructor(public sceneManager:SceneManager) {
    this.transform = new TransformControls(sceneManager.camera,sceneManager.renderer.domElement)
    sceneManager.scene.add(this.transform.getHelper())
   
    this.transform.addEventListener("dragging-changed", e => {
        sceneManager.controls.enabled = !e.value;
    });

    
    this.selector = new Selector(sceneManager, this)

    this.transform.addEventListener("mouseDown",()=>{
     if(!this.selectedObject)  return
     this.currentActiveCmd = new TransformCommand(this.selectedObject.mesh)
    })
    this.transform.addEventListener("mouseUp",()=>{
      if(!this.selectedObject || !this.currentActiveCmd) {
        return
      }
      this.currentActiveCmd.storeAfter()
      this.commandsReciever.execute(this.currentActiveCmd)
      this.currentActiveCmd = null
    })
  }

  add(obj:EditorObject):void {
    const addObjCmd = new AddObjectCommand(this.sceneManager.scene, obj.mesh)
    this.commandsReciever.execute(addObjCmd)
    this.objects.set(obj.id, obj)
  }
  remove(obj:EditorObject){
    const removeObjCmd = new RemoveObjectCommand(this.sceneManager.scene,obj.mesh)
    if(obj == this.selectedObject) {
      this.select(null)
    }
    this.commandsReciever.execute(removeObjCmd)
    this.objects.delete(obj.id)
    
  }
  setTransformMode(mode:TransformControlsMode) {
    this.transform.setMode(mode)
  }
  select(obj:EditorObject|null) {
    this.selectedObject = obj
    this.transform.detach()
    if(obj) this.transform.attach(obj.mesh)
  }

  
}

