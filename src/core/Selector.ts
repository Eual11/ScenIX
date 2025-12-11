import { Raycaster, Vector2 } from "three";
import type { SceneManager } from "./SceneManager";
import type { Editor } from "./Editor";

export class Selector {
  raycaster: Raycaster = new Raycaster()
  mouseVec: Vector2 = new Vector2()

  constructor(sceneManager: SceneManager, editor: Editor) {

    window.addEventListener("pointerdown", e => {
      if (editor.transform.dragging) return; // skip selection if gizmo dragging
      this.mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouseVec, sceneManager.camera)
      const hit_objs = this.raycaster.intersectObjects(sceneManager.scene.children, false)

      const hit_selectable = hit_objs.filter((hit) => editor.selectable_objs.includes(hit.object))
      const first = hit_selectable.length ? hit_selectable[0] : null

      if (first) {
        editor.select(first.object)
      } else {
        editor.select(null)
      }


    })

  }
}
