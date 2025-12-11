//Applying command degign pattern to enable undo/redo
export interface EditorCommand {
  execute() :void;
  undo(): void;
}
