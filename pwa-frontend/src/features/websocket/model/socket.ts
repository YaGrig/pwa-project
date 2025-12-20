import { io } from "socket.io-client";

export const socket = io("http://localhost:8080/notification", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
