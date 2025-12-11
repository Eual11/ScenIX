import type { EditorCommand } from "./Command";


export class EditorCommandReceiver {
  private undoStack: EditorCommand[] = [];
  private redoStack: EditorCommand[] = [];

  execute(cmd: EditorCommand) {
    cmd.execute()
    this.undoStack.push(cmd)
    //HACK: emptying the redo stack
    this.redoStack = []
  }

  undo() {
    const cmd = this.undoStack.pop()
    if(!cmd) return;
    cmd.undo()
    this.redoStack.push(cmd)
  }

  redo() {
    const cmd = this.redoStack.pop()
    if(!cmd) return;
    cmd.execute()
    this.undoStack.push(cmd)
  }


}
