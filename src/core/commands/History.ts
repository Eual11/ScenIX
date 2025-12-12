import type { EditorCommand } from "./Command";


export class EditorCommandReceiver {
  private undoStack: EditorCommand[] = [];
  private redoStack: EditorCommand[] = [];
  //Max undo history of 20
  private historySize: number = 20

  execute(cmd: EditorCommand) {
    cmd.execute()
    this.undoStack.push(cmd)
    if(this.undoStack.length > this.historySize) {
      this.undoStack.shift()
    }
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
  setMaxHistorySize(val: number) {
    if(val >0) {
      this.historySize = val
      console.log(this.historySize)
    }
  }
  getMaxHistorySize() {
    return this.historySize
  }


}
