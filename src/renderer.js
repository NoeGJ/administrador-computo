import { Stopwatch } from "./components/watch/stopwatch.js";
import { formatHMS } from "./helpers/formatToMs.js"; 

let items = [];
let reportes = [];
let logList = [];

// ----- Renderizado de ítems -----
const list = document.getElementById("list");
const template = document.getElementById("itemTemplate");
const showBtn = document.getElementById("show-dialog");



function renderAll() {
  list.innerHTML = "";

  if (!items) return;
  items.forEach((data) => {
    render(data);
  });
}

function getTiempoRestante(final) {
  const res = new Date(final) - new Date(new Date().toUTCString());
  return res > 0 ? res : 0;
}

function render(data) {
  const node = template.content.cloneNode(true);
  const article = node.querySelector(".item");
  article.id = `item-${data.id}`;


  // Timer
  const timeEl = node.querySelector(".time");
  const sw = new Stopwatch(
    timeEl,
    (elapsed) => (timeEl.textContent = formatHMS(elapsed)),
    getTiempoRestante(data.finalTime),
    data.id,
    data.equipos.id,
    data.code
  );
  sw.start();
  const usuarioPanel = node.querySelector('[data-panel="usuario"]');

  // Controles
  node.querySelector(".extend").addEventListener("click", () => sw.extender());
  node.querySelector(".show-dialog").addEventListener("click", () => dialog.showModal());
  node.querySelector(".exit").addEventListener("click", () => {
    window.api.finishTime(data.id, data.equipos.id);
  });

  // Tabs
  const tabButtons = node.querySelectorAll(".tab");
  const panels = node.querySelectorAll(".tabpanel");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      panels.forEach((p) =>
        p.classList.toggle("active", p.dataset.panel === btn.dataset.tab)
      );
    });
  });

  // Panel Usuario
  const usuario = {
    name: data.name || "Sin nombre",

    career: data.career || "",
    code: data.code || "",
  };
  usuarioPanel.innerHTML = renderUsuario(usuario);

  // Panel Equipos
  const equiposPanel = node.querySelector('[data-panel="equipos"]');

  // Asegura que equipos sea un array (aunque solo haya uno)
  const equiposArray = data.equipos
    ? Array.isArray(data.equipos)
      ? data.equipos
      : [data.equipos]
    : [];

  equiposPanel.innerHTML = renderEquipos(equiposArray);

  const dialog = document.getElementById("dialog");
  const form = document.getElementById("dialog-form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const info = new FormData(form);
    if(info.get("report") == "") return;
    window.api.sendReport(data.id, data.equipos.id, "Reporte de Admin: " + info.get("report"));
    form.reset();

    dialog.close();
  });

  list.appendChild(node);
}

function renderUsuario(usuario) {
  return `
    <div class="usuario-info">
      <p><strong>Nombre: </strong> ${usuario.name || "Desconocido"}</p>
      <p><strong>Carrera: </strong> ${usuario.career || "No disponible"}</p>
      <p><strong>Código: </strong> ${usuario.code || "Sin ID"}</p>
    </div>
  `;
}

function renderEquipos(equipos) {
  if (!equipos || equipos.length === 0) {
    return '<div class="empty">Sin equipos asignados</div>';
  }

  return equipos
    .map(
      (equipo) => `
      <div class="equipo-item">
        <p><strong>Nombre: </strong> ${equipo.name || "Sin nombre"}</p>
        <p><strong>Sistema: </strong> ${equipo.sistema || "Sin estado"}</p>
      </div>
    `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  const dialog = document.getElementById("dialog");
  const btnCerrar = document.getElementById("js-close");

  btnCerrar.addEventListener("click", () => {
    dialog.close();
  });

  const { activeUsers, logs } = await window.api.fetchUsers();
  
  items = activeUsers;

  logList = logs;

  const { data } = await window.api.fetchReportes();

  
  reportes = data;
  renderAll();
  renderReportes();
  renderLogs();
});

window.api.onUserChanged((payload) => {

  actualizarUsuario(payload);
});

window.api.onReporteChanged((payload) => {

  reportes.push(payload);

  if(mensajeVacio.style.display == "block") mensajeVacio.style.display = "none";

  const row = document.createElement("tr");
    row.innerHTML = `
        <td>${payload.id}</td>
        <td>${payload.users.code}</td>
        <td>${payload.equipos.name}</td>
        <td>${payload.description}</td>
        `;
    tbody.prepend(row);

});

function actualizarUsuario(payload) {
  const { eventType, new: nuevo, old: anterior } = payload;

  if(eventType === "INSERT"){
    items.push(nuevo);
    logList.push(nuevo);
    render(nuevo);
    renderLog(nuevo, "insert");
  }

  if (eventType === "UPDATE") {
    const exist = items.some((item) => item?.id === nuevo.id);
    if (nuevo.active && !exist) {      
      items.push(nuevo);
      
      render(nuevo);
    }else if (!nuevo.active && exist) {
      
      const index = logList.findIndex((item) => item.id === nuevo.id);
      logList[index] = { ...logList[index], active: false };
      nuevo.equipos = logList[index].equipos
      renderLog(nuevo, "active");

      items = items.filter((value) => value.id != nuevo.id);
      const article = document.getElementById(`item-${nuevo.id}`);
      article.remove();
    }
    else {
      const index = items.findIndex((value) => value.id === nuevo.id);
      items[index] = { ...items[index], finalTime: nuevo.finalTime };

      logList[index] = { ...logList[index], finalTime: nuevo.finalTime };

      nuevo.equipos = logList[index].equipos
      renderLog(nuevo, "date");
      
      const article = document.getElementById(`item-${nuevo.id}`);
      if(article){
      const timeEl = article.querySelector(".time");
      if(timeEl){
      const sw = new Stopwatch(
        timeEl,
        (elapsed) => (timeEl.textContent = formatHMS(elapsed)),
        getTiempoRestante(nuevo.finalTime),
        nuevo.id,
        nuevo.equipos.id,
        nuevo.code
      );
      sw.start();
      }
    }
    }
  }
  // No tocas los temporizadores activos si no es necesario
}

document.querySelectorAll(".tabs .tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    // desactivar todos los tabs y contenidos
    document
      .querySelectorAll(".tabs .tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));

      tab.classList.add("active");
      const targetId = tab.dataset.tab;
      const targetView = document.getElementById(targetId);
      targetView.classList.add("active");

      if (targetId === "vista1") {
        document.body.style.overflow = "auto";
      } else {
        document.body.style.overflow = "hidden";
      }
  });
});


const tbody = document.querySelector("#tabla-reportes tbody");
const mensajeVacio = document.getElementById("mensaje-vacio");

function renderReportes() {
  tbody.innerHTML = "";

  if (reportes.length === 0) {
    mensajeVacio.style.display = "block";
    return;
  } else {
    mensajeVacio.style.display = "none";
  }
  
  reportes.forEach((rep) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${rep.id}</td>
        <td>${rep.users.code}</td>
        <td>${rep.equipos.name}</td>
        <td>${rep.description}</td>
        `;
    tbody.appendChild(row);
  });
}

const tbodyLogs = document.querySelector("#tabla-logs tbody");
const logsVacios = document.getElementById("logs-vacios");


function renderLogs() {
  tbodyLogs.innerHTML = "";

  isEmptyLogs();
  
  logList.forEach((item) => {
    const row = createRowLog(item);
    tbodyLogs.appendChild(row);
  })
}

function isEmptyLogs(){
  if(logList.length === 0){
    logsVacios.style.display = "block";
    return;
  } else {
    logsVacios.style.display = "none";
  }
}

function createRowLog(item) {
   const row = document.createElement("tr");
   row.id = `equipo-${item.id}`;
    row.innerHTML = `
        <td><span class="dot ${item.active ? "activo" : "inactivo"}"></span></td>
        <td>${item.code} - ${ item.name}</td>
        <td>${item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'} - ${item.finalTime ? new Date(item.finalTime).toLocaleString() : 'N/A'}</td>
        <td>${item.equipos ? item.equipos?.name : 'N/A'}</td>
        `;
    return row;
}

function renderLog(data, action) {
  if(action == "insert"){
    isEmptyLogs();

    const row = createRowLog(data);
    tbodyLogs.prepend(row)

  }
  if(action == "active" || action == "date"){
    const element = document.getElementById(`equipo-${data.id}`);
    if(element) element.remove();    
    const row = createRowLog(data);
    tbodyLogs.prepend(row);
  }

}
