import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

/**
 * Socket.io Real-Time Notifications Service
 * Handles real-time updates, notifications, and collaborative features
 */

let io = null;
const userSockets = new Map(); // userId -> Set of socket IDs
const roomSockets = new Map(); // roomId -> Set of socket IDs

export function initializeSockets(server) {
  // Parse multiple CORS origins from environment variable
  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
  
  io = new Server(server, {
    cors: {
      origin: corsOrigins,
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected:`, socket.id);

    // Track user sockets
    if (!userSockets.has(socket.userId)) {
      userSockets.set(socket.userId, new Set());
    }
    userSockets.get(socket.userId).add(socket.id);

    // Broadcast user online status
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      email: socket.userEmail,
      timestamp: new Date().toISOString()
    });

    socket.on('join_case', (data) => {
      const { caseId } = data;
      const roomId = `case_${caseId}`;
      socket.join(roomId);

      if (!roomSockets.has(roomId)) {
        roomSockets.set(roomId, new Set());
      }
      roomSockets.get(roomId).add(socket.id);

      // Notify others
      socket.to(roomId).emit('user_joined_case', {
        userId: socket.userId,
        caseId,
        userEmail: socket.userEmail,
        timestamp: new Date().toISOString()
      });

      console.log(`User ${socket.userId} joined case ${caseId}`);
    });

    socket.on('procedure_status_changed', (data) => {
      const { caseId, procedureId, newStatus, completedAt } = data;
      const roomId = `case_${caseId}`;

      io.to(roomId).emit('procedure_updated', {
        caseId,
        procedureId,
        newStatus,
        completedAt,
        updatedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

      console.log(
        `Procedure ${procedureId} in case ${caseId} updated to ${newStatus}`
      );
    });

    /**
     * Real-time notification broadcast
     */
    socket.on('send_notification', (data) => {
      const { userId, type, message, caseId } = data;
      // Send to specific user if online
      if (userSockets.has(userId)) {
        const userSocketIds = Array.from(userSockets.get(userId));
        io.to(userSocketIds).emit('notification', {
          type,
          message,
          caseId,
          senderId: socket.userId,
          timestamp: new Date().toISOString(),
          read: false
        });
      }
    });

    /**
     * Real-time deadline alert
     */
    socket.on('deadline_alert', (data) => {
      const { caseId, procedureId, title, daysUntil } = data;
      const roomId = `case_${caseId}`;
      io.to(roomId).emit('deadline_upcoming', {
        caseId,
        procedureId,
        title,
        daysUntil,
        urgency: daysUntil < 1 ? 'critical' : daysUntil < 7 ? 'urgent' : 'normal',
        timestamp: new Date().toISOString()
      });
    });

    /**
     * Typing indicator (for collaborative form filling)
     */
    socket.on('start_typing', (data) => {
      const { caseId, field } = data;
      const roomId = `case_${caseId}`;
      socket.to(roomId).emit('user_started_typing', {
        userId: socket.userId,
        field,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('stop_typing', (data) => {
      const { caseId, field } = data;
      const roomId = `case_${caseId}`;

      socket.to(roomId).emit('user_stopped_typing', {
        userId: socket.userId,
        field
      });
    });

    /**
     * Collaborative document upload notification
     */
    socket.on('document_uploaded', (data) => {
      const { caseId, documentName, documentType } = data;
      const roomId = `case_${caseId}`;
      socket.to(roomId).emit('document_updated', {
        caseId,
        documentName,
        documentType,
        uploadedBy: socket.userId,
        uploadedByEmail: socket.userEmail,
        timestamp: new Date().toISOString()
      });
    });

    /**
     * Experience shared notification
     */
    socket.on('experience_shared', (data) => {
      const { procedureId, experienceId } = data;
      const roomId = `procedure_${procedureId}`;
      socket.to(roomId).emit('experience_updated', {
        procedureId,
        experienceId,
        sharedBy: socket.userId,
        timestamp: new Date().toISOString()
      });
    });

    /**
     * Get online users in case
     */
    socket.on('get_online_users', (data) => {
      const { caseId } = data;
      const roomId = `case_${caseId}`;
      const room = io.sockets.adapter.rooms.get(roomId);
      const clients = room ? Array.from(room) : [];

      socket.emit('online_users', {
        userIds: clients.map(id => io.sockets.sockets.get(id)?.userId).filter(Boolean)
      });
    });

    /**
     * Leave case room
     */
    socket.on('leave_case', (data) => {
      const { caseId } = data;
      const roomId = `case_${caseId}`;
      socket.leave(roomId);

      const roomSet = roomSockets.get(roomId);
      if (roomSet) {
        roomSet.delete(socket.id);
        if (roomSet.size === 0) {
          roomSockets.delete(roomId);
        }
      }

      socket.to(roomId).emit('user_left_case', {
        userId: socket.userId,
        caseId,
        timestamp: new Date().toISOString()
      });
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', () => {
      const userSocketSet = userSockets.get(socket.userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          userSockets.delete(socket.userId);
          
          // Broadcast user offline status
          io.emit('user_offline', {
            userId: socket.userId,
            timestamp: new Date().toISOString()
          });
        }
      }

      console.log(`User ${socket.userId} disconnected:`, socket.id);
    });

    // Connection error handler
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
}

/**
 * Send server-side notification to user
 */
export function sendNotificationToUser(userId, notification) {
  if (io && userSockets.has(userId)) {
    const userSocketIds = Array.from(userSockets.get(userId));
    io.to(userSocketIds).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Broadcast notification to all users in a case
 */
export function broadcastToCaseUsers(caseId, eventType, data) {
  if (io) {
    io.to(`case_${caseId}`).emit(eventType, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Get online users for a case
 */
export function getOnlineUsersInCase(caseId) {
  if (!io) return [];
  
  const roomId = `case_${caseId}`;
  const room = io.sockets.adapter.rooms.get(roomId);
  if (!room) return [];

  const users = [];
  for (const socketId of room) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      users.push({
        userId: socket.userId,
        email: socket.userEmail,
        socketId
      });
    }
  }
  return users;
}

export { io };
