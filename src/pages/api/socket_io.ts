
// src/pages/api/socket_io.ts
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer, Socket } from 'socket.io';

interface SocketWithUserData extends Socket {
  data: {
    appUserId?: string;
    isAdmin?: boolean;
  };
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
}

export const config = { api: { bodyParser: false } };

const userSocketMap = new Map<string, string>(); // <appUserId, socketId>
const socketUserMap = new Map<string, string>(); // <socketId, appUserId>
const callPageReadyUsers = new Set<string>(); // Set of appUserIds currently on the /call page
const livePageSockets = new Set<string>(); // Set of socket IDs for viewers on /live page
const ADMIN_SOCKETS = new Set<string>();
let generalStreamBroadcaster: { socketId: string, title: string, subtitle:string, isLoggedInOnly: boolean } | null = null;

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log('Socket.IO: Server already running.');
  } else {
    console.log('Socket.IO: Initializing new IOServer instance.');
    const io = new IOServer(res.socket.server, {
      path: '/api/socket_io',
      addTrailingSlash: false,
      cors: { origin: "*", methods: ["GET", "POST"] }
    });
    res.socket.server.io = io;

    const notifyAdminsOfUserStatus = (userId: string) => {
        const isConnected = userSocketMap.has(userId);
        const isReadyOnCallPage = callPageReadyUsers.has(userId);
        ADMIN_SOCKETS.forEach(adminSocketId => {
            io.to(adminSocketId).emit('server:user-status-update', { userId, isConnected, isReadyOnCallPage });
        });
    };

    io.on('connection', (socket: SocketWithUserData) => {
      console.log(`[Socket Connected] ID: ${socket.id}`);

      socket.on('disconnect', () => {
        const disconnectedUserId = socketUserMap.get(socket.id);
        console.log(`[Socket Disconnected] ID: ${socket.id}, UserID: ${disconnectedUserId}`);
        
        livePageSockets.delete(socket.id);

        if (generalStreamBroadcaster?.socketId === socket.id) {
          console.log(`[Stream Ended] Broadcaster ${socket.id} disconnected.`);
          generalStreamBroadcaster = null;
          io.emit('server:general-stream-ended');
        }

        if (disconnectedUserId) {
          if (userSocketMap.get(disconnectedUserId) === socket.id) {
            userSocketMap.delete(disconnectedUserId);
          }
          callPageReadyUsers.delete(disconnectedUserId);
          notifyAdminsOfUserStatus(disconnectedUserId);
        }
        
        socketUserMap.delete(socket.id);
        ADMIN_SOCKETS.delete(socket.id);
      });
      
      socket.on('identify', ({ userId, isAdmin }) => {
          const previousUserId = socketUserMap.get(socket.id);
          if (previousUserId && previousUserId !== userId) {
             if (userSocketMap.get(previousUserId) === socket.id) {
                 userSocketMap.delete(previousUserId);
                 callPageReadyUsers.delete(previousUserId);
                 notifyAdminsOfUserStatus(previousUserId);
             }
          }
        
          if (userId) {
            socket.data.appUserId = userId;
            socket.data.isAdmin = isAdmin;
            userSocketMap.set(userId, socket.id);
            socketUserMap.set(socket.id, userId);
            if (isAdmin) {
              ADMIN_SOCKETS.add(socket.id);
            }
            notifyAdminsOfUserStatus(userId);
          } else { 
            if (previousUserId) {
              socketUserMap.delete(socket.id);
              delete socket.data.appUserId;
              delete socket.data.isAdmin;
            }
          }
      });

      // --- Private Call Events ---
      socket.on('admin:check-user-status', (data: { targetUserId: string }) => {
        if (!socket.data.isAdmin) return;
        notifyAdminsOfUserStatus(data.targetUserId);
      });
      socket.on('user:im-on-call-page', () => {
          if(!socket.data.appUserId) return;
          callPageReadyUsers.add(socket.data.appUserId);
          notifyAdminsOfUserStatus(socket.data.appUserId);
      });
      socket.on('user:left-call-page', () => {
          if(!socket.data.appUserId) return;
          callPageReadyUsers.delete(socket.data.appUserId);
          notifyAdminsOfUserStatus(socket.data.appUserId);
      });
      socket.on('admin:initiate-private-call-request', ({ targetUserId, adminName }) => {
        if (!socket.data.isAdmin) return;
        const targetSocketId = userSocketMap.get(targetUserId);
        if (targetSocketId && callPageReadyUsers.has(targetUserId)) {
          io.to(targetSocketId).emit('server:private-call-invite', { adminSocketId: socket.id, adminName });
        }
      });
      socket.on('user:accepts-private-call', ({ adminSocketId }) => {
         if (!socket.data.appUserId) return;
         io.to(adminSocketId).emit('server:user-accepted-call', { userSocketId: socket.id, userAppUserId: socket.data.appUserId });
      });

      // --- General Stream Events ---
      socket.on('viewer:im-on-live-page', () => {
        livePageSockets.add(socket.id);
        if (generalStreamBroadcaster) {
          // A stream is already active, tell the broadcaster to connect this new viewer
          io.to(generalStreamBroadcaster.socketId).emit('server:new-viewer-request', { viewerSocketId: socket.id });
        }
      });

      socket.on('viewer:left-live-page', () => {
        livePageSockets.delete(socket.id);
      });

      socket.on('admin:start-general-stream', (data) => {
        if (!socket.data.isAdmin) return;
        generalStreamBroadcaster = { socketId: socket.id, ...data };
        io.emit('server:general-stream-info', { 
            title: generalStreamBroadcaster.title,
            subtitle: generalStreamBroadcaster.subtitle,
        });
        // Connect all viewers who are *already* on the page
        livePageSockets.forEach(viewerSocketId => {
            if (viewerSocketId !== socket.id) { // Don't send request to self
                io.to(generalStreamBroadcaster!.socketId).emit('server:new-viewer-request', { viewerSocketId });
            }
        });
      });

      socket.on('admin:end-general-stream', () => {
        if (generalStreamBroadcaster?.socketId === socket.id) {
          generalStreamBroadcaster = null;
          io.emit('server:general-stream-ended');
        }
      });

      // --- WebRTC Signaling Events ---
      socket.on('broadcaster:offer-to-viewer', (data) => {
          io.to(data.viewerSocketId).emit('server:offer-from-broadcaster', { offer: data.offer, broadcasterSocketId: socket.id });
      });
      
      socket.on('viewer:answer-to-broadcaster', (data) => {
          io.to(data.broadcasterSocketId).emit('server:answer-from-viewer', { viewerSocketId: socket.id, answer: data.answer });
      });

      socket.on('private-sdp-offer', ({ targetSocketId, offer }) => {
        io.to(targetSocketId).emit('server:sdp-offer-received', { senderSocketId: socket.id, offer });
      });
      
      socket.on('private-sdp-answer', ({ targetSocketId, answer }) => {
        io.to(targetSocketId).emit('server:sdp-answer-received', { senderSocketId: socket.id, answer });
      });
      
      socket.on('webrtc:ice-candidate', ({ targetSocketId, candidate }) => {
        io.to(targetSocketId).emit('webrtc:ice-candidate-received', { candidate, senderSocketId: socket.id });
      });

      socket.on('webrtc:end-call', ({ targetSocketId }) => {
        io.to(targetSocketId).emit('webrtc:call-ended-by-peer');
      });
    });
  }
  res.end();
};

export default SocketHandler;
