import express from 'express';

import users from './routes/user-route.js';

const server = express();


server.use(express.json());
server.use('/api',users);


server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});