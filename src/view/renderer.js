import { supabase } from "../db/connection.js"


const btnConn = document.getElementById('conn-btn')
const formConfig = document.querySelector('form')
const inputUrl = document.getElementById('input-url')
const inputKey = document.getElementById('input-key')

btnConn.addEventListener("click", () =>{
    const info = new FormData(formConfig);
    const url = info.get('input-url');
    const key = info.get('input-key');
    if(!url || !key){
        alert("Ingresa los datos");
        return;
    }

    try {
        const conn = supabase(url, key);
        console.log(conn);
    } catch (error) {
        
    }
})