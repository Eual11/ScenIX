import './style.css'

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AxesHelper,
  GridHelper,
  BoxGeometry,
  MeshNormalMaterial,
  Mesh,
  Object3D,
} from "three";
import { SceneManager } from './core/SceneManager'
import { Editor } from './core/Editor'
const sceneManager = new SceneManager()
const editor = new Editor(sceneManager)

const geo = new BoxGeometry(1, 1, 1); 
const mat = new MeshNormalMaterial();
editor.add(new Mesh(geo, mat));


function animate() {
  requestAnimationFrame(animate)
  sceneManager.render()
}
animate()


