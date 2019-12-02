import * as express from 'express';
import * as https from 'https';
import * as fs from 'fs';
import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { WebSocketServer } from './websocket-server';

const port   = 12345;
const app    = express();
app.use(express.json());
const server = https.createServer({
    cert: fs.readFileSync('/ssl_localhost/localhost.crt'),
    key : fs.readFileSync('/ssl_localhost/localhost.key'),
    passphrase: '12345678'
}, app);

const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
    const idSocket = Date.now();
    wss.handleUpgrade(request, socket, head, (inputSocket) => {
        wss.emit('connection', inputSocket, request, idSocket);
    });
});

wss.on('connection', (ws: WebSocket, request: IncomingMessage, idSocket: string) => {
    WebSocketServer.Add(idSocket, ws);
});

app.get('/', (req, res) => {
    res.json(Date.now());
});

app.post('/send', async (req, res) => {
    const idSocket = req.body.to;
    const data = req.body.data;

    if (!idSocket || !data) {
        res.status(400).json({ message: 'INVALID_REQUEST' });
        return;
    }

    const result = await WebSocketServer.SendTo(idSocket, data);
    if (result.status) {
        res.status(200).json(result);
    } else {
        res.status(400).json(result);
    }
});

server.listen(port, () => {
    console.log(`SERVER STARTED. PORT ${port}`);
});