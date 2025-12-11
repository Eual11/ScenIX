import './style.css'

import {BoxGeometry, PerspectiveCamera, Scene,WebGLRenderer,Mesh, MeshNormalMaterial,GridHelper,AxesHelper} from "three"
import { OrbitControls } from 'three/examples/jsm/Addons.js' 
const CANVAS_ID = "scene"

let canvas:HTMLElement
let scene: Scene
let renderer: WebGLRenderer
let camera:PerspectiveCamera
let controls:OrbitControls
let gridHelper:GridHelper
let axesHelper: AxesHelper


//initalizes the scene 
function init() {
  //Scene setup, renderer, camera
  scene = new Scene()
  camera = new PerspectiveCamera(45,window.innerWidth/window.innerHeight, 0.1,1000)
  camera.position.z = 5
  canvas = document.querySelector(`canvas#${CANVAS_ID}`)!
  renderer = new WebGLRenderer({canvas,antialias:true,alpha:true})
  renderer.setSize(canvas.clientWidth,canvas.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))

  controls = new OrbitControls(camera,canvas)
  controls.update()

  //Helpers

    
  let geo =  new BoxGeometry(2,2,2)
  const material = new MeshNormalMaterial()

  const mesh = new Mesh(geo,material)

  scene.add(mesh)


  
  gridHelper = new GridHelper()
  axesHelper = new AxesHelper(4)
  axesHelper.visible = false
   
  scene.add(gridHelper)
  scene.add(axesHelper)
  scene.add(axesHelper)
    
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene,camera)
}

init()
animate()







