import { useUnit } from "effector-react";
import {
  $isConnected,
  connectWebSocketFx,
  rawMessageReceived,
  socketConnectedEvent,
  socketDisconnectedEvent,
  socketErrorEvent,
  socketInitEvent,
} from "../../model/store";

export const useSocket = () => {
  const {
    socketConnected,
    socketDisconnected,
    socketError,
    messageReceived,
    WebSocketConnect,
    isConnected,
    socketInit,
  } = useUnit({
    socketConnected: socketConnectedEvent,
    socketDisconnected: socketDisconnectedEvent,
    socketError: socketErrorEvent,
    isConnected: $isConnected,
    WebSocketConnect: connectWebSocketFx,
    messageReceived: rawMessageReceived,
    socketInit: socketInitEvent,
  });

  return {
    socketConnected,
    WebSocketConnect,
    isConnected,
    socketDisconnected,
    socketInit,
    socketError,
    messageReceived,
  };
};
