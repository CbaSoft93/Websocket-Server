import * as WebSocket from 'ws';

export class WebSocketServer {
 
    private static SOCKETS = new Map();
    
    static Add(idSocket: string, socket: WebSocket) {
        this.SOCKETS.set(idSocket, socket);

        socket.on('close', () => {
            this.Remove(idSocket);
        });

        socket.send(JSON.stringify({ id: idSocket }));
    }

    static Remove(idSocket: string) {
        this.SOCKETS.delete(idSocket);
    }

    static SendTo(idSocket: string, message: any) {
        type ResultSendTo = { 
            status: boolean,
            message?: string
        };

        return new Promise<ResultSendTo>((resolve) => {
            const socket: WebSocket = this.SOCKETS.get(idSocket);

            if (!socket) {
                resolve({
                    status: false,
                    message: 'NOT_FOUND'
                });
                return;
            }

            if (socket.readyState !== WebSocket.OPEN) {
                this.Remove(idSocket);
                resolve({
                    status: false,
                    message: 'NOT_FOUND'
                });
                return;
            }

            socket.send(JSON.stringify(message), (err) => {
                if (err) {
                    resolve({
                        status: false,
                        message: err.message
                    });
                } else {
                    resolve({
                        status: true
                    });
                }
            });
        });
    }
}