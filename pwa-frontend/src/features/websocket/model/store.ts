import {
  createEffect,
  createEvent,
  createStore,
  sample,
  scopeBind,
} from "effector";
import { Socket } from "socket.io-client";
import socket from "./socket";

export const socketConnectedEvent = createEvent<Socket>();
export const socketDisconnectedEvent = createEvent();
export const socketErrorEvent = createEvent();
export const socketInitEvent = createEvent();
export const rawMessageReceived = createEvent();
const $lastMessage = createStore("");

export const $isConnected = createStore(false)
  .on(socketConnectedEvent, () => true)
  .on(socketDisconnectedEvent, () => false)
  .reset(socketDisconnectedEvent);

$lastMessage.on(rawMessageReceived, (_, newMessage) => newMessage);

export const $socketError = createStore<Error | null>(null)
  .on(socketErrorEvent, (_, error) => error)
  .reset(socketConnectedEvent, socketDisconnectedEvent);

export const connectWebSocketFx = createEffect(
  (url: string): Promise<WebSocket> => {
    const ws = new WebSocket(url);

    const scopeDisconnected = scopeBind(socketDisconnectedEvent);
    const scopeRawMessageReceived = scopeBind(rawMessageReceived);

    return new Promise((res, rej) => {
      ws.onopen = () => {
        res(ws);
      };

      ws.onmessage = (event) => {
        scopeRawMessageReceived(event.data);
      };

      ws.onclose = () => {
        scopeDisconnected();
      };

      ws.onerror = (err) => {
        scopeDisconnected();
        rej(err);
      };
    });
  }
);

export const $socket = createStore<Socket | {}>({})
  .on(connectWebSocketFx.doneData, (_, ws) => ws)
  .reset(socketDisconnectedEvent);

sample({
  clock: socketInitEvent,
  fn: () => {
    if (!socket) {
      return;
    }

    socket.on("connect", () => {
      // socketConnectedEvent(socket);
    });

    socket.on("registered", (error: Error) => {
      console.log("hehehe");
    });

    socket.on("error", (error: Error) => {
      console.log(error, "hehehe");
    });

    return socket;
  },
});
