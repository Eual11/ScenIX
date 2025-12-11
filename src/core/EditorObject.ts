import type { Object3D } from "three"

type EditorObjectType = "box" | "sphere" | "cylinder"
export class EditorObject {
  id: string;
  mesh: Object3D;
  objectType: EditorObjectType
  //Additioanl parameters if i need them
  params: any

  constructor(mesh: Object3D, obj_type: EditorObjectType, params: any) {
    this.id = crypto.randomUUID()
    this.mesh = mesh
    this.mesh.userData.editorId = this.id
    this.objectType = obj_type
    this.params = params
  }

  serialize() {

    return {
      id: this.id,
      type: this.objectType,
      params: this.params,
      position: this.mesh.position.toArray(),
      rotation: [
        this.mesh.rotation.x,
        this.mesh.rotation.y,
        this.mesh.rotation.z
      ],
      scale: this.mesh.scale.toArray()
    }
  }
}
