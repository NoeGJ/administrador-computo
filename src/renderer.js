// ----- Utilidades de tiempo -----
class Stopwatch {
  constructor(node, onTick, initialTime, idTimer) {
    this.node = node;
    this.onTick = onTick;
    this.initialTime = initialTime;
    this.reset();
    this._flag = false;
    this.idTimer = idTimer;
    if (initialTime == 0) {
      this.node.classList.add("time-up");
    }
  }
  start() {
    if (this.running) return;
    this.running = true;
    this._flag = true;
    this._last = performance.now(); //performance.now() + 2 * 60 * 60 * 1000;
    this._raf = requestAnimationFrame(this._loop);
  }
  extender() {
    // Agregar 2 horas al tiempo restante
    this.elapsed += 2 * 60 * 60 * 1000;

    // Si el temporizador está detenido, reiniciarlo
    if (!this.running) {
      this.running = true;
      this._last = performance.now(); // Reiniciar el tiempo base
      this._raf = requestAnimationFrame(this._loop);
      this.node.classList.remove("time-up");
    }

    window.api.addTime(this.elapsed, this.idTimer);

    this._emit();
  }
  reset() {
    this.running = false;
    this.elapsed = this.initialTime; // ms
    this._last = 0;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._loop = this._loop.bind(this);
    this.node.classList.remove("time-up");
    this._emit();
  }
  _loop(ts) {
    if (!this.running) return;

    const dt = ts - this._last;
    this._last = ts;
    this.elapsed -= dt;

    if (this.elapsed <= 0) {
      this.elapsed = 0;
      this.running = false;
      cancelAnimationFrame(this._raf);
      this.node.classList.add("time-up");
      alert(`Ha finalizado el tiempo de ${this.idTimer}`);
      this._emit();
      return;
    }

    this._emit();
    this._raf = requestAnimationFrame(this._loop);
  }
  _emit() {
    if (typeof this.onTick === "function") this.onTick(this.elapsed);
  }
}

let items = [];

function formatHMS(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// ----- Renderizado de ítems -----
const list = document.getElementById("list");
const template = document.getElementById("itemTemplate");
//const addItemBtn = document.getElementById("addItemBtn");
const showBtn = document.getElementById("show-dialog");

let index = 0;

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

  node.querySelector(".item-number").textContent = index + 1;

  // Timer
  const timeEl = node.querySelector(".time");
  const sw = new Stopwatch(
    timeEl,
    (elapsed) => (timeEl.textContent = formatHMS(elapsed)),
    getTiempoRestante(data.finalTime),
    data.id
  );

  const usuarioPanel = node.querySelector('[data-panel="usuario"]');

  // Controles
  node.querySelector(".start").addEventListener("click", () => sw.start());
  node.querySelector(".extend").addEventListener("click", () => sw.extender());
  node
    .querySelector(".show-dialog")
    .addEventListener("click", () => dialog.showModal());
  node.querySelector(".exit").addEventListener("click", () => {
    window.api.finishTime(data.id);
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
    
    window.api.sendReport(data.id, data.equipos.id, info.get("report"));

    dialog.close();
  });

  list.appendChild(node);
  index++;
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

// Agregar nuevo ítem de ejemplo
// addItemBtn.addEventListener("click", () => {
//   const n = items.length + 1;
//   items.push({
//     usuario: {
//       nombre: `Usuario ${n}`,
//       email: `usuario${n}@ejemplo.com`,
//       id: `U-${String(n).padStart(4, "0")}`,
//     },
//     equipos: [],
//   });
//   render();
// });

// Utilidad mínima para evitar inyección al mostrar strings
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

window.api.onUserUpdate(async (event, usuario) => {
  console.log("Usuarios actualizados desde main (evento): ", usuario);
  items = await window.api.getUsers();
  render();
});

document.addEventListener("DOMContentLoaded", async () => {
  const dialog = document.getElementById("dialog");
  const btnCerrar = document.getElementById("js-close");

  btnCerrar.addEventListener("click", () => {
    dialog.close();
  });

  const result = await window.api.fetchUsers();
  items = result.data;

  const { data } = await window.api.fetchReportes();
  console.log(data);
  
  reportes = data;
  renderAll();
  renderReportes();
});

window.api.onUserChanged((payload) => {
  console.log("Nuevo cambio en usuario:", payload);

  // Agrega el nuevo dato sin reiniciar temporizadores
  // Por ejemplo, actualiza una lista local
  actualizarUsuario(payload);
});

window.api.onReporteChanged((payload) => {
  console.log("Nuevo cambio en reporte:", payload); 
  reportes.push(payload);

  if(mensajeVacio.style.display == "block") mensajeVacio.style.display = "none";

  const row = document.createElement("tr");
    row.innerHTML = `
        <td>${payload.id}</td>
        <td>${payload.users.code}</td>
        <td>${payload.equipos.name}</td>
        <td>${payload.description}</td>
        `;
    tbody.appendChild(row);

});

function actualizarUsuario(payload) {
  const { eventType, new: nuevo, old: anterior } = payload;

  if (eventType === "INSERT") {
    items.push(nuevo);
    render(nuevo);
  } else if (eventType === "UPDATE") {
    if (!nuevo.active) {
      items = items.filter((value) => value.code != nuevo.id);
      const article = document.getElementById(`item-${nuevo.id}`);
      article.remove();
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

    // activar el tab clickeado y su contenido
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

reportes = [];
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
  console.log(reportes);
  

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
