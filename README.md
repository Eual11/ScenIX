#  ScenIX
3D editor UI

## How to Run

```bash
npm install
npm run dev
```
or check the deployed version [ScneIX](https://scen-ix.vercel.app/)
## Features Complete

### Scene Setup
- [x] Add Perspective Camera
- [x] OrbitControls 
- [x] GridHelper and AxisHelper
- [X] Improve Orbit Controls
- [X] Improve GridHelper, AxisHelper

### Add Objects
- [x] Add box
- [x] Add Sphere
- [x] Add Cylinder
- [X] Add Placing logic

### Object Selection
- [x] Object selection using raycasting
- [x] visual cue by attaching transform controls

### Basic Transformations
- [x] Allow user to:
- [x] Move the selected object along X, Y, or Z axes (with arrow buttons or sliders).
- [x] Optionally rotate or scale the object.
- [x] Show current position (X, Y, Z) of the selected object in a simple sidebar or on-screen info box.
### Scene Persistence
- [x] Export the current scene to JSON (including positions of objects and types).
- [x] Import the scene from JSON and recreate it.
- [x] also include editor state


### Bonus
- [x] Add TransformControls for drag-based transformations.
- [x] Snap to grid (e.g., objects can only be placed on integer positions).
- [x] Add Undo/Redo for last action.

## Future Improvements

* Add material selection and dynamically change mesh materials (currently all meshes use a basic material)
* Improve UI composability, possibly with state management
* Enable editing of faces and vertices with selection
* Multi-select objects
