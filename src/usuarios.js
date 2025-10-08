export let usuarios = [];

// Exportar funciones para acceder y modificar


export const getUsers = () => usuarios;
export const addUser = (nuevoUsuario) => usuarios.push(nuevoUsuario);

