import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const shouldConnect = () => {
  console.log(localStorage.getItem("token"), "wow");
  return localStorage.getItem("token") && navigator.onLine && !document.hidden;
};

if (shouldConnect()) {
  socket = io("http://localhost:8080/notification", {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
}

export default socket;
