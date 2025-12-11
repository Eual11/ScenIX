import './style.css'

import { SceneManager } from './core/SceneManager'
import { Editor } from './core/Editor'
import { createBox, createCylinder, createSphere } from './core/ShapeFactory';
const sceneManager = new SceneManager()
const editor = new Editor(sceneManager)

editor.add(createBox());
editor.add(createSphere());
editor.add(createCylinder());


function animate() {
  requestAnimationFrame(animate)
  sceneManager.render()
}
animate()


