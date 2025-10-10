export let users = [];

export const setUsers = (newUsers) => (users = newUsers);

export const addUser = (nuevoUsuario) => users.push(nuevoUsuario);

export const findUser = (user) => {
  return users.find((item) => item.id === user.id);
};

export const removeUser = (user) =>
  (users = users.filter((item) => item.id !== user.id));

export const replaceDate = (user, value) => {
  const index = users.findIndex((item) => item.id === user.id);
  users[index] = { ...users[index], finalTime: value };
};

export const removeUserById = (id) =>
  (users = users.filter((item) => item.id != id));

export const changeDate = (idTimer) => {
  const index = users.findIndex((item) => item.id === idTimer);

  console.log(index);

  console.log(users[index]);

  let newTime = new Date(users[index].finalTime);
  newTime.setHours(newTime.getHours() + 2);
  return newTime;
};
