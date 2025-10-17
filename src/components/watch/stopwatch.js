export class Stopwatch {
  constructor(node, onTick, initialTime, idTimer, id_equipo) {
    this.node = node;
    this.onTick = onTick;
    this.initialTime = initialTime;
    this.reset();
    this._flag = false;
    this.idTimer = idTimer;
    this.id_equipo = id_equipo;
    if (initialTime == 0) {
      this.node.classList.add("time-up");
    }
  }
  start() {
    if (this.running) return;
    this.running = true;
    this._flag = true;
    this._last = performance.now();
    this._raf = requestAnimationFrame(this._loop);
  }
  extender() {
    // Agregar 2 horas al tiempo restante
    this.elapsed += 2 * 60 * 60 * 1000;

    if (!this.running) {
      this.running = true;
      this._last = performance.now();
      this._raf = requestAnimationFrame(this._loop);
      this.node.classList.remove("time-up");
    }

    window.api.addTime(this.elapsed, this.idTimer);

    this._emit();
  }
  reset() {
    this.running = false;
    this.elapsed = this.initialTime; 
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
      window.api.finishTime(this.idTimer, this.id_equipo);
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