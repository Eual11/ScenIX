const key="ui.theme";
const root=()=>document.documentElement;
export function setTheme(theme){
  const t=theme==="dark"?"dark":"light";
  root().setAttribute("data-theme",t);
  try{localStorage.setItem(key,t)}catch(e){}
  return t;
}
export function getTheme(){
  const t=root().getAttribute("data-theme");
  return t==="dark"?"dark":"light";
}
export function toggleTheme(){
  return setTheme(getTheme()==="dark"?"light":"dark");
}
export function initTheme(){
  let stored=null;
  try{stored=localStorage.getItem(key)}catch(e){}
  if(stored==="dark"||stored==="light") return setTheme(stored);
  const prefers=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;
  return setTheme(prefers?"dark":"light");
}

