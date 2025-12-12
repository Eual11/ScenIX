import './style.css'

import { SceneManager } from './core/SceneManager'
import { Editor } from './core/Editor'
import { createBox, createCylinder, createSphere } from './core/ShapeFactory';
const sceneManager = new SceneManager()
const editor = new Editor(sceneManager)

editor.add(createBox());
editor.add(createSphere());
editor.add(createCylinder());


let state =  `
{
  "editor_state": {
    "transform_mode": "translate",
    "selectedObjectId": "33f0235a-1f2c-41ec-aaa9-fe0fbdefbc25",
    "snappingEnabled": true,
    "gridSize": 1
  },
  "editor_objects": [
    {
      "id": "16560f53-4e03-4c80-8ed6-4f235b6ef9ae",
      "objectType": "box",
      "params": {
        "width": 1,
        "height": 1,
        "depth": 1
      },
      "position": [
        0,
        1,
        0
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "scale": [
        1,
        1,
        1
      ]
    },
    {
      "id": "d9506b89-f7a0-4e9d-8531-dfaf573c783f",
      "objectType": "sphere",
      "params": {
        "radius": 0.5
      },
      "position": [
        0,
        0,
        0
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "scale": [
        1,
        1,
        1
      ]
    },
    {
      "id": "33f0235a-1f2c-41ec-aaa9-fe0fbdefbc25",
      "objectType": "cylinder",
      "params": {
        "radius": 0.5
      },
      "position": [
        0,
        0,
        2
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "scale": [
        1,
        1,
        1
      ]
    }
  ]
}`

// await editor.loadScene(state)
setTimeout(async()=>{
 console.log(editor.saveScene())
},8000)
function animate() {
  requestAnimationFrame(animate)
  sceneManager.render()
}
animate()


