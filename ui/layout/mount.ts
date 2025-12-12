import { initTheme, toggleTheme, getTheme } from "/ui/theme/ThemeProvider.js";

type Emit = (type: string, detail?: any) => void;

type Vec3 = { x: number; y: number; z: number };
type UISelection = {
  id: string | null;
  name: string;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
};

type EditorLike = {
  selectedObject?: any;
  select?: (obj: any) => any;
  setTransformMode?: (mode: "translate" | "rotate" | "scale") => void;
  remove?: (obj: any) => void;
  moveSelected?: (p: [number, number, number]) => void;
  rotateSelected?: (r: [number, number, number]) => void;
  scaleSelected?: (s: [number, number, number]) => void;
  snappingEnabled?: boolean;
  gridSize?: number;
  __ui_select_wrapped?: boolean;
};

type SceneManagerLike = {
  showGrid?: (v: boolean) => void;
  showAxis?: (v: boolean) => void;
};

type MountOptions = {
  root?: HTMLElement | null;
  canvas?: HTMLCanvasElement | null;
  editor?: EditorLike | null;
  sceneManager?: SceneManagerLike | null;
};

type UIInstance = {
  root: HTMLElement;
  editor: EditorLike | null;
  sceneManager: SceneManagerLike | null;
  selection: {
    setSelectedObject: (obj: Partial<UISelection> | null) => void;
    clearSelection: () => void;
    getSelectedObject: () => UISelection | null;
  };
  toggleTheme: () => string;
  toRad: (deg: number) => number;
  toDeg: (rad: number) => number;
  setEditor: (nextEditor: EditorLike | null, nextSceneManager: SceneManagerLike | null) => void;
  syncSelection: () => void;
};

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const toNum = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const clone = <T,>(v: T): T =>
  (globalThis as any).structuredClone ? (globalThis as any).structuredClone(v) : JSON.parse(JSON.stringify(v));
const radToDeg = (r: number) => (r * 180) / Math.PI;
const degToRad = (d: number) => (d * Math.PI) / 180;

async function loadInto(url: string, mount: HTMLElement) {
  const res = await fetch(url, { cache: "no-store" });
  mount.innerHTML = await res.text();
}

function createIcons(root: HTMLElement) {
  const lucide = (window as any).lucide;
  if (!lucide?.createIcons) return;
  lucide.createIcons({ root });
}

function createSelectionAPI(emit: Emit) {
  let selected: UISelection | null = null;
  const normalize = (obj: any): UISelection => {
    const o = obj || {};
    const pos = o.position || {};
    const rot = o.rotation || {};
    const scl = o.scale || {};
    return {
      id: o.id ?? null,
      name: o.name ?? "Object",
      position: { x: toNum(pos.x), y: toNum(pos.y), z: toNum(pos.z) },
      rotation: { x: toNum(rot.x), y: toNum(rot.y), z: toNum(rot.z) },
      scale: { x: toNum(scl.x ?? 1), y: toNum(scl.y ?? 1), z: toNum(scl.z ?? 1) }
    };
  };
  return {
    setSelectedObject(obj: Partial<UISelection> | null) {
      selected = obj ? normalize(obj) : null;
      emit("ui:selection", { object: selected ? clone(selected) : null });
    },
    clearSelection() {
      selected = null;
      emit("ui:selection", { object: null });
    },
    getSelectedObject() {
      return selected;
    }
  };
}

function bindTopbar(root: HTMLElement, emit: Emit) {
  const actions = [...root.querySelectorAll<HTMLElement>("[data-ui-action]")];
  const toggles = [...root.querySelectorAll<HTMLElement>("[data-ui-toggle]")];
  const inputs = [...root.querySelectorAll<HTMLInputElement>("[data-ui-input]")];
  const settingsBtn = root.querySelector<HTMLElement>('[data-action="settings"]');

  const state: Record<string, any> = {
    "view.grid": true,
    "view.axis": false,
    "editor.snapToGrid": true,
    "editor.gridSize": 1
  };

  const sync = () => {
    toggles.forEach((b) => {
      const k = b.getAttribute("data-ui-toggle") || "";
      b.setAttribute("aria-pressed", state[k] ? "true" : "false");
    });
    inputs.forEach((el) => {
      const k = el.getAttribute("data-ui-input") || "";
      if (k === "editor.gridSize") el.value = String(state[k]);
    });
  };

  actions.forEach((b) => b.addEventListener("click", () => emit("ui:action", { id: b.getAttribute("data-ui-action") })));
  toggles.forEach((b) =>
    b.addEventListener("click", () => {
      const k = b.getAttribute("data-ui-toggle") || "";
      state[k] = !state[k];
      sync();
      emit("ui:action", { id: k, value: state[k] });
    })
  );
  inputs.forEach((el) =>
    el.addEventListener("change", () => {
      const k = el.getAttribute("data-ui-input") || "";
      const v = toNum(el.value);
      state[k] = v;
      sync();
      emit("ui:action", { id: k, value: v });
    })
  );

  settingsBtn?.addEventListener("click", () => emit("ui:settings", { open: true }));
  sync();
}

function bindSidebar(root: HTMLElement, emit: Emit) {
  const buttons = [...root.querySelectorAll<HTMLElement>("[data-tool]")];
  buttons.forEach((b) => b.addEventListener("click", () => emit("ui:tool", { tool: b.getAttribute("data-tool") })));
}

function bindInspector(root: HTMLElement, api: ReturnType<typeof createSelectionAPI>, emit: Emit) {
  const card = root.querySelector<HTMLElement>("[data-ui-inspector]")!;
  const nameEl = root.querySelector<HTMLElement>("[data-field='name']")!;
  const delBtn = root.querySelector<HTMLElement>("[data-action='delete']");
  const rows = [...root.querySelectorAll<HTMLElement>("[data-bind]")];

  const setVisible = (on: boolean) => {
    (card as any).hidden = !on;
  };

  const updateUI = () => {
    const o = api.getSelectedObject();
    setVisible(!!o);
    if (!o) return;
    nameEl.textContent = String(o.name ?? "Selected");
    rows.forEach((row) => {
      const bind = row.getAttribute("data-bind") as keyof UISelection;
      const axis = row.getAttribute("data-axis") as keyof Vec3;
      const range = row.querySelector<HTMLInputElement>('input[type="range"]')!;
      const number = row.querySelector<HTMLInputElement>('input[type="number"]')!;
      const value = toNum((o as any)?.[bind]?.[axis]);
      range.value = String(value);
      number.value = String(value);
    });
  };

  const commit = (bind: string, axis: string, value: number) => {
    const o = api.getSelectedObject();
    if (!o) return;
    (o as any)[bind] = { ...((o as any)[bind] || {}), [axis]: value };
    emit("ui:transform", { object: clone(o), path: `${bind}.${axis}`, value });
  };

  rows.forEach((row) => {
    const bind = row.getAttribute("data-bind") || "";
    const axis = row.getAttribute("data-axis") || "";
    const range = row.querySelector<HTMLInputElement>('input[type="range"]')!;
    const number = row.querySelector<HTMLInputElement>('input[type="number"]')!;

    const apply = (raw: any) => {
      const v = clamp(toNum(raw), toNum(range.min), toNum(range.max));
      range.value = String(v);
      number.value = String(v);
      commit(bind, axis, v);
    };

    range.addEventListener("input", (e) => apply((e.target as HTMLInputElement).value));
    number.addEventListener("change", (e) => apply((e.target as HTMLInputElement).value));
  });

  delBtn?.addEventListener("click", () => emit("ui:deleteSelected", { object: api.getSelectedObject() }));

  return { updateUI };
}

function bindSettings(settingsEl: HTMLElement, emit: Emit) {
  const btn = settingsEl.querySelector<HTMLElement>("[data-theme-toggle]")!;
  const label = settingsEl.querySelector<HTMLElement>("[data-theme-label]")!;
  const sync = () => (label.textContent = getTheme() === "dark" ? "Dark" : "Light");
  sync();
  btn.addEventListener("click", () => {
    toggleTheme();
    sync();
    emit("ui:theme", { theme: getTheme() });
  });
}

function createShell(root: HTMLElement) {
  root.innerHTML = `
    <div class="ui-shell">
      <div class="ui-topbar-slot" id="ui-topbar"></div>
      <div class="ui-sidebar-slot" id="ui-sidebar"></div>
      <div class="ui-viewport">
        <div class="ui-viewport-surface" id="ui-viewport"></div>
      </div>
    </div>
    <div class="ui-settings-pop ui-panel" id="ui-settings" data-open="false" role="dialog" aria-label="Settings">
      <div class="ui-settings-row">
        <div class="ui-settings-title">Theme</div>
        <button class="ui-settings-btn" type="button" data-theme-toggle="true">
          <span data-theme-label="true">Light</span>
        </button>
      </div>
    </div>
    <div id="ui-inspector-slot"></div>
  `;
}

export async function mountEditorUI(opts: MountOptions = {}): Promise<UIInstance | null> {
  const root = opts.root ?? document.getElementById("ui-root");
  const canvas = opts.canvas ?? document.getElementById("scene");
  const editor = opts.editor ?? null;
  const sceneManager = opts.sceneManager ?? null;
  if (!root) return null;

  initTheme();
  createShell(root);

  const emit: Emit = (type, detail) => root.dispatchEvent(new CustomEvent(type, { detail }));

  const topbarMount = root.querySelector<HTMLElement>("#ui-topbar")!;
  const sidebarMount = root.querySelector<HTMLElement>("#ui-sidebar")!;
  const inspectorMount = root.querySelector<HTMLElement>("#ui-inspector-slot")!;
  const viewport = root.querySelector<HTMLElement>("#ui-viewport")!;

  if (canvas && viewport && canvas.parentElement !== viewport) viewport.appendChild(canvas);

  await Promise.all([
    loadInto("/ui/topbar/Topbar.html", topbarMount),
    loadInto("/ui/sidebar/Sidebar.html", sidebarMount),
    loadInto("/ui/inspector/InspectorCard.html", inspectorMount)
  ]);

  createIcons(root);

  const selection = createSelectionAPI(emit);
  const settings = root.querySelector<HTMLElement>("#ui-settings")!;

  const ui: UIInstance = {
    root,
    editor,
    sceneManager,
    selection,
    toggleTheme,
    toRad: degToRad,
    toDeg: radToDeg,
    setEditor(nextEditor, nextSceneManager) {
      ui.editor = nextEditor || null;
      ui.sceneManager = nextSceneManager || null;
      wrapEditorSelect();
      ui.syncSelection();
    },
    syncSelection() {
      const ed = ui.editor;
      const sel = ed?.selectedObject || null;
      if (!sel) return selection.clearSelection();
      const p = sel.mesh?.position;
      const r = sel.mesh?.rotation;
      const s = sel.mesh?.scale;
      selection.setSelectedObject({
        id: sel.id,
        name: sel.objectType || "Object",
        position: { x: p?.x ?? 0, y: p?.y ?? 0, z: p?.z ?? 0 },
        rotation: { x: radToDeg(r?.x ?? 0), y: radToDeg(r?.y ?? 0), z: radToDeg(r?.z ?? 0) },
        scale: { x: s?.x ?? 1, y: s?.y ?? 1, z: s?.z ?? 1 }
      });
    }
  };

  const wrapEditorSelect = () => {
    const ed = ui.editor;
    if (!ed || ed.__ui_select_wrapped || typeof ed.select !== "function") return;
    const orig = ed.select.bind(ed);
    ed.select = (obj: any) => {
      const r = orig(obj);
      ui.syncSelection();
      return r;
    };
    ed.__ui_select_wrapped = true;
  };

  wrapEditorSelect();
  ui.syncSelection();

  bindTopbar(topbarMount, emit);
  bindSidebar(sidebarMount, emit);

  const inspector = bindInspector(inspectorMount, selection, emit);
  inspector.updateUI();

  bindSettings(settings, emit);

  root.addEventListener("ui:selection", () => inspector.updateUI());

  root.addEventListener("ui:settings", () => {
    const open = settings.getAttribute("data-open") === "true";
    settings.setAttribute("data-open", open ? "false" : "true");
  });

  window.addEventListener("pointerdown", (e) => {
    if (settings.getAttribute("data-open") !== "true") return;
    if (settings.contains(e.target as Node)) return;
    const btn = topbarMount.querySelector('[data-action="settings"]');
    if (btn && btn.contains(e.target as Node)) return;
    settings.setAttribute("data-open", "false");
  });

  root.addEventListener("ui:tool", (e: any) => {
    const tool = e.detail?.tool as string | undefined;
    const ed = ui.editor;
    if (!ed || !tool) return;
    if (tool === "move") ed.setTransformMode?.("translate");
    if (tool === "rotate") ed.setTransformMode?.("rotate");
    if (tool === "scale") ed.setTransformMode?.("scale");
  });

  root.addEventListener("ui:deleteSelected", () => {
    const ed = ui.editor;
    if (!ed?.selectedObject) return;
    ed.remove?.(ed.selectedObject);
  });

  root.addEventListener("ui:transform", (e: any) => {
    const ed = ui.editor;
    const obj = e.detail?.object as UISelection | undefined;
    const path = e.detail?.path as string | undefined;
    if (!ed || !obj || !path) return;
    const group = String(path).split(".")[0];
    if (group === "position") ed.moveSelected?.([obj.position.x, obj.position.y, obj.position.z]);
    if (group === "rotation") ed.rotateSelected?.([degToRad(obj.rotation.x), degToRad(obj.rotation.y), degToRad(obj.rotation.z)]);
    if (group === "scale") ed.scaleSelected?.([obj.scale.x, obj.scale.y, obj.scale.z]);
  });

  root.addEventListener("ui:action", (e: any) => {
    const id = e.detail?.id as string | undefined;
    const value = e.detail?.value as any;
    const ed = ui.editor;
    const sm = ui.sceneManager;
    if (!id) return;
    if (id === "view.grid") sm?.showGrid?.(!!value);
    if (id === "view.axis") sm?.showAxis?.(!!value);
    if (id === "editor.snapToGrid" && ed) ed.snappingEnabled = !!value;
    if (id === "editor.gridSize" && ed) ed.gridSize = Number(value) || 1;
  });

  return ui;
}


