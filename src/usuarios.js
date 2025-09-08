let usuarios = [
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
    equipos: ["Laptop Dell", "Proyector Epson", "Mouse Logitech", "Osciloscopio"],
  },
];

// Exportar funciones para acceder y modificar


export const getUsers = () => usuarios;
export const addUser = (nuevoUsuario) => usuarios.push(nuevoUsuario);

