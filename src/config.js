import Store from 'electron-store';
const store = new Store();

export const getCredentials = () => {
  return store.get("supabase");
}

export const saveCredentials = ( url, key ) => {
    store.set("supabase", {url, key})
}

export const hasCredentials = () => {
    return store.has("supabase");
}