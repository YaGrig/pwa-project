import { Logger } from '@nestjs/common'
import * as websockets from '@nestjs/websockets'
import { Socket, Server } from 'socket.io'

@websockets.WebSocketGateway(8080, {
  namespace: 'notification',
  transports: ['polling', 'websocket'],
  cors: { origin: '*', credentials: true },
})
export class NotificationGateway
  implements websockets.OnGatewayInit, websockets.OnGatewayConnection
{
  @websockets.WebSocketServer()
  server: Server

  private readonly logger = new Logger(NotificationGateway.name)
  private connectedClients: Map<string, Socket> = new Map()

  afterInit() {
    console.log('WebSocket Gateway инициализирован')
  }

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client)
    console.log(`Client connected: ${client.id}`)
  }

  @websockets.SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): websockets.WsResponse<string> {
    console.log(client, payload)
    return { event: 'response', data: 'Hello World!' }
  }
}
