import { BrowserWindow } from "electron";
import { getData } from "../api/getDataS.js"
import { addUser } from "../usuarios.js";


export const getStudent = async (req, res) => {
    const { code } = req.body;
    try {
        const data = await getData(code);    
        
        if(!data.ok) return res.status(400).json({ok: false, mesage: data.message.toString() });
        

        addUser();

        BrowserWindow.getAllWindows().forEach((win) => {
             win.webContents.send('updatedUser');
        })


        res.status(201).json({
            ok: true,
            data: data,

        });
        
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: "No se pudo acceder a la API"
        });
    }    
}
