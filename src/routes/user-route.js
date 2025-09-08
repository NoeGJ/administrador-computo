import { Router } from "express";
import { getStudent } from "../controllers/user-controller.js";

const router = Router();

router.post('/', getStudent);

// router.get('/test', (req, res) => {
//     console.log('Test route works');
//     res.send('Test route works');    
//     }
// )

export default router;