import type { Object3D, Scene } from "three";
import type { EditorCommand } from "./Command";

export class AddObjectCommand implements EditorCommand{
  constructor(private scene:Scene, private obj:Object3D) {}

  execute() {
    this.scene.add(this.obj)
  }
  undo() {
    this.scene.remove(this.obj)
  }

}

export class RemoveObjectCommand implements EditorCommand {
    constructor(private scene:Scene, private obj:Object3D) {}
    execute() {
      this.scene.remove(this.obj)
    }
    undo() {
      this.scene.add(this.obj)
    }
}
