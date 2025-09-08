// ----- Datos de ejemplo (puedes reemplazarlos por datos reales) -----
const seedItems = [
  {
    usuario: { nombre: "Ana López", email: "ana@ejemplo.com", id: "U-0001" },
    equipos: ["Laptop Dell", "Proyector Epson", "Mouse Logitech"],
  },
  {
    usuario: {
      nombre: "Carlos Ruiz",
      email: "carlos@ejemplo.com",
      id: "U-0002",
    },
    equipos: ["Raspberry Pi 4", "Multímetro", "Cables Dupont"],
  },
  {
    usuario: {
      nombre: "María Pérez",
      email: "maria@ejemplo.com",
      id: "U-0003",
    },
    equipos: [],
  },
];
// ----- Utilidades de tiempo -----
class Stopwatch {
  constructor(node, onTick, initialTime) {
    this.node = node;
    this.onTick = onTick;
    this.initialTime = initialTime;
    this.reset();
    this._flag = false;
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
const addItemBtn = document.getElementById("addItemBtn");
const showBtn = document.getElementById("show-dialog");



let items = [];
function render() {
  list.innerHTML = "";
  items.forEach((data, index) => {
    const node = template.content.cloneNode(true);
    const article = node.querySelector(".item");

    // Número de ítem
    node.querySelector(".item-number").textContent = index + 1;

    // Timer
    const timeEl = node.querySelector(".time");
    const sw = new Stopwatch(
      timeEl,
      (elapsed) => (timeEl.textContent = formatHMS(elapsed)),
      2 * 5 * 1000
    );

    const usuarioPanel = node.querySelector('[data-panel="usuario"]');

    // Controles
    node.querySelector(".start").addEventListener("click", () => sw.start());
    node
      .querySelector(".extend")
      .addEventListener("click", () => sw.extender());
    //node.querySelector(".reset").addEventListener("click", () => sw.reset());
    node.querySelector(".show-dialog").addEventListener("click", () => dialog.showModal());
    
    node.querySelector(".exit").addEventListener("click", () => {
      sw.reset();
      usuarioPanel.innerHTML = '<div class="empty">Equipo disponible</div>';
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

    usuarioPanel.innerHTML = renderUsuario(data.usuario);

    // Panel Equipos
    const equiposPanel = node.querySelector('[data-panel="equipos"]');
    equiposPanel.innerHTML = renderEquipos(data.equipos);

    list.appendChild(node);
  });
}

function renderUsuario(u = {}) {
  const { nombre = "—", email = "—", id = "—" } = u;
  return `
<div class="user-grid">
  <div>
  <div class="label">Nombre</div>
  <div class="value">${escapeHtml(nombre)}</div>
  </div>
  <div>
    <div class="label">Email</div>
    <div class="value">${escapeHtml(email)}</div>
  </div>
  <div>
    <div class="label">ID</div>
    <div class="value">${escapeHtml(id)}</div>
  </div>
</div>
`;
}

function renderEquipos(equipos = []) {
  if (!equipos.length) return `<div class="empty">Sin equipos tomados.</div>`;
  const items = equipos.map((e) => `<li>${escapeHtml(e)}</li>`).join("");
  return `<ol class="equipos">${items}</ol>`;
}

// Agregar nuevo ítem de ejemplo
addItemBtn.addEventListener("click", () => {
  const n = items.length + 1;
  items.push({
    usuario: {
      nombre: `Usuario ${n}`,
      email: `usuario${n}@ejemplo.com`,
      id: `U-${String(n).padStart(4, "0")}`,
    },
    equipos: [],
  });
  render();
});

// Utilidad mínima para evitar inyección al mostrar strings
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}


const dialog = document.getElementById("dialog");
const jsCloseBtn = dialog.querySelector("#js-close");

showBtn.addEventListener("click", () => {
  dialog.showModal();
});

jsCloseBtn.addEventListener("click", (e) => {
  e.preventDefault();
  dialog.close();
});

// Inicializar
window.api.getUsers().then((data) => {
  items = data;
  render(); 
});

window.api.onUpdateUser(async () => {
  console.log('Usuarios actualizados desde main (evento)');
  items = await window.api.getUsers();
  render();
})
