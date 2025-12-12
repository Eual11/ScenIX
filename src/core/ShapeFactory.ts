import { EditorObject } from "./EditorObject"
import { Mesh,MeshNormalMaterial,BoxGeometry,SphereGeometry, CylinderGeometry } from "three" 
export function createBox(width = 1, height = 1, depth = 1,position:[number,number,number]=[0,0,0]) {
  const mesh = new Mesh(
    new BoxGeometry(width, height, depth),
    new MeshNormalMaterial()
  )
  mesh.position.set(...position)
  return new EditorObject(mesh, "box", { width, height, depth })
}

export function createSphere(radius = 0.5,position:[number,number,number]=[0,0,0]) {
  const mesh = new Mesh(
    new SphereGeometry(radius, 32, 32),
    new MeshNormalMaterial()
  )
  mesh.position.set(...position)
  return new EditorObject(mesh, "sphere", { radius })
}

export function createCylinder(radius = 0.5,height=1,position:[number,number,number]=[0,0,0]) {
  const mesh = new Mesh(
    new CylinderGeometry(radius,radius,height, 32, 32),
    new MeshNormalMaterial()
  )
  mesh.position.set(...position)
  return new EditorObject(mesh, "cylinder", { radius })
}
