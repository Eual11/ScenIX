import { Raycaster, Vector2 } from "three";
import type { SceneManager } from "./SceneManager";
import type { Editor } from "./Editor";

export class Selector {
  raycaster: Raycaster = new Raycaster()
  mouseVec: Vector2 = new Vector2()

  constructor(sceneManager: SceneManager, editor: Editor) {

    window.addEventListener("pointerdown", e => {
      const el = e.target as HTMLElement | null
      if(el && el.tagName !="CANVAS") return
      if (editor.transform.dragging) return
      const dom = sceneManager.renderer.domElement
      const rect = dom.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      this.mouseVec.x = x * 2 - 1;
      this.mouseVec.y = -(y * 2 - 1);
      this.raycaster.setFromCamera(this.mouseVec, sceneManager.camera)
      const hit_objs = this.raycaster.intersectObjects(sceneManager.scene.children, false)

      const hit_selectable = hit_objs.filter((h)=>h.object.userData.editorId!==undefined)
      const first = hit_selectable.length ? hit_selectable[0] : null

      if (first) {
        editor.select(editor.objects.get(first.object.userData.editorId)??null)
      } else {
        editor.select(null)
      }


    })

  }
}
