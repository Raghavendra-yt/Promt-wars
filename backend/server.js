import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { startSimulation, loadStadiumState, handleAdminAction } from './simulation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.get('/api/stadium', (req, res) => {
  res.json(loadStadiumState());
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
  
  socket.on('adminAction', (action) => {
    console.log('Action received from admin:', action);
    handleAdminAction(action.type, action.payload);
  });
});

// Serve frontend dist
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all routes to index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the continuous simulation loop passing io to emit updates
startSimulation(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`SmartStadium Backend running on port ${PORT}`);
});
