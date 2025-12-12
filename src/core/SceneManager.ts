//Scene manager to abstract scene and pass around the information
// about the scene tree to editor

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AxesHelper,
  GridHelper,
  Vector2,
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const CANVAS_ID = "scene";

export class SceneManager {
  private canvas: HTMLCanvasElement;
  public renderer: WebGLRenderer;
  public controls: OrbitControls;
  
  public camera: PerspectiveCamera;
  public scene: Scene = new Scene();
  public axesHelper: AxesHelper;
  public gridHelper: GridHelper;

  private _gridEnabled = true;
  private _axisEnabled = false;

  constructor() {
    const canvasElement = document.querySelector<HTMLCanvasElement>(`#${CANVAS_ID}`);
    if (!canvasElement) {
      throw new Error(`Canvas with ID "${CANVAS_ID}" not found in the DOM.`);
    }
    this.canvas = canvasElement;
    
    this.camera = new PerspectiveCamera(
      45,
      this.canvas.clientWidth / this.canvas.clientHeight, // Use canvas size
      1,
      100
    );
    this.camera.position.set(5, 5, 5); // Set camera position for a better view

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true; 

    this.axesHelper = new AxesHelper(4);
    this.axesHelper.visible = this._axisEnabled; 
    this.gridHelper = new GridHelper(100, 100);
    this.gridHelper.visible = this._gridEnabled;

    this.scene.add(this.gridHelper);
    this.scene.add(this.axesHelper);

    window.addEventListener("resize", this.onWindowResize.bind(this))

  }

  private onWindowResize(): void {
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  render(): void {
    this.controls.update(); 
    this.renderer.render(this.scene, this.camera);
  }

  enableControls(value: boolean):void {
    this.controls.enabled = value
  }

  showGrid(value: boolean): void {
    this._gridEnabled = value;
    this.gridHelper.visible = value;
  }
  
  showAxis(value: boolean): void {
    this._axisEnabled = value;
    this.axesHelper.visible = value;
  }
  getCanvasDim(): Vector2 {
    return new Vector2(this.canvas.clientWidth,this.canvas.clientHeight)
  }
}
