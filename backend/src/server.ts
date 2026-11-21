import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import authRoutes from './modules/auth/auth.routes';
import batchRoutes from './modules/batches/batch.routes';
import approvalRoutes from './modules/approvals/approval.routes';
import qualityRoutes from './modules/quality/quality.routes';
import stateRoutes from './modules/stateApproval/state.routes';
import certificateRoutes from './modules/certificates/certificate.routes';
import auditRoutes from './modules/audit/audit.routes';
import verificationRoutes from './modules/verification/verification.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import { connectRedis } from './config/redis';

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/certificates', express.static(path.join(process.cwd(), 'certificates')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/state', stateRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), service: 'CertiFlow API' });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('[Socket] Client connected:', socket.id);
  socket.on('join-room', (room: string) => {
    socket.join(room);
    console.log(`[Socket] ${socket.id} joined room: ${room}`);
  });
  socket.on('disconnect', () => {
    console.log('[Socket] Client disconnected:', socket.id);
  });
});

const PORT = parseInt(process.env.PORT || '3001');

async function start(): Promise<void> {
  await connectRedis();
  httpServer.listen(PORT, () => {
    console.log(`\n🚀 CertiFlow API running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);
  });
}

start().catch(console.error);

export { app };
