


const btnConn = document.getElementById('conn-btn')
const formConfig = document.querySelector('form')
const inputUrl = document.getElementById('input-url')
const inputKey = document.getElementById('input-key')

btnConn.addEventListener("click", async () =>{
    const info = new FormData(formConfig);
    const url = info.get('input-url');
    const key = info.get('input-key');
    
    if(!url || !key){
        alert("Ingresa los datos");
        return;
    }
            
    const { ok, data, message } = await window.db.testconn(url, key);
    if(ok){
        console.log(data);
        
    }else {
        alert(message);        
    }

})