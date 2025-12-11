import { Matrix4, type Object3D, type Scene } from "three";
import type { EditorCommand } from "./Command";

export class AddObjectCommand implements EditorCommand {
  constructor(private scene: Scene, private obj: Object3D) { }

  execute() {
    this.scene.add(this.obj)
  }
  undo() {
    this.scene.remove(this.obj)
  }

}

export class RemoveObjectCommand implements EditorCommand {
  constructor(private scene: Scene, private obj: Object3D) { }
  execute() {
    this.scene.remove(this.obj)
  }
  undo() {
    this.scene.add(this.obj)
  }
}
export class TransformCommand implements EditorCommand {
  object: Object3D
  before: Matrix4
  after: Matrix4

  constructor(obj: Object3D) {
    this.object = obj
    this.before = new Matrix4().copy(obj.matrix)
    this.after = new Matrix4()
  }

  applyMatrix(mat: Matrix4) {
    this.object.matrix.copy(mat);
    this.object.matrix.decompose(
      this.object.position,
      this.object.quaternion,
      this.object.scale
    );
  }
  storeAfter() {
    this.after.copy(this.object.matrix)
  }
  storeBefore() {
    this.before.copy(this.object.matrix)
  }

  execute() {
    this.applyMatrix(this.after)
  }
  undo() {
    this.applyMatrix(this.before)
  }
}
