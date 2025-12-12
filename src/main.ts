import './style.css'

import { SceneManager } from './core/SceneManager'
import { Editor } from './core/Editor'
import { createBox, createCylinder, createSphere } from './core/ShapeFactory'
const sceneManager = new SceneManager()
const editor = new Editor(sceneManager)

const w = window as any
w.editor = editor
w.sceneManager = sceneManager
w.EditorActions = {
  addBox: () => editor.add(createBox()),
  addCylinder: () => editor.add(createCylinder()),
  addSphere: () => editor.add(createSphere()),
  setMode: (mode: "translate" | "rotate" | "scale") => editor.setTransformMode(mode),
  undo: () => editor.commandsReciever.undo(),
  redo: () => editor.commandsReciever.redo(),
  exportJson: () => editor.saveScene(),
  importJson: async (json: string) => {
    await editor.loadScene(json)
  },
  showGrid: (v: boolean) => sceneManager.showGrid(v),
  showAxis: (v: boolean) => sceneManager.showAxis(v),
  setSnapToGrid: (v: boolean) => {
    editor.snappingEnabled = v
  },
  setGridSize: (v: number) => {
    editor.gridSize = Number(v) || 1
  },
  setUndoHistorySize: (v: number)=>{
    editor.commandsReciever.setMaxHistorySize(Number(v)||1)
    
  },
  deleteSelected: () => {
    if (editor.selectedObject) editor.remove(editor.selectedObject)
  },
  moveSelected: (x: number, y: number, z: number) => editor.moveSelected([x, y, z]),
  rotateSelectedDeg: (x: number, y: number, z: number) =>
    editor.rotateSelected([(x * Math.PI) / 180, (y * Math.PI) / 180, (z * Math.PI) / 180]),
  scaleSelected: (x: number, y: number, z: number) => editor.scaleSelected([x, y, z]),
  getState: () => {
    const mode = editor.transform.getMode()
    const grid = sceneManager.gridHelper.visible
    const axis = sceneManager.axesHelper.visible
    const snap = editor.snappingEnabled
    const gridSize = editor.gridSize
    const undoSize = editor.commandsReciever.getMaxHistorySize()
    const sel = editor.selectedObject
    return {
      mode,
      grid,
      axis,
      snap,
      gridSize,
      undoSize,
      selected: sel
        ? {
            id: sel.id,
            name: sel.objectType,
            position: sel.mesh.position.toArray(),
            rotation: [sel.mesh.rotation.x, sel.mesh.rotation.y, sel.mesh.rotation.z],
            scale: sel.mesh.scale.toArray()
          }
        : null
    }
  }

}
//tell windo we are ready
w.dispatchEvent(new Event("editor-ready"))


function animate() {
  requestAnimationFrame(animate)
  sceneManager.render()
}
animate()


