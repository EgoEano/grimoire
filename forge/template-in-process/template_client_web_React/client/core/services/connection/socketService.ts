import { io, Socket } from "socket.io-client";
import Config from "react-native-config";

class SocketService {
    private static instance: Socket;
  
    static getInstance(): Socket {  
        const API_SERVER_URL = Config.API_SERVER_URL;
        const API_SERVER_PORT = Config.API_SERVER_PORT;

        if (!API_SERVER_URL || !API_SERVER_PORT) throw new Error("env API_SERVER data is not setted");
        const serverUrl = `${API_SERVER_URL}${API_SERVER_PORT ? `:${API_SERVER_PORT}` : ''}`;

        if (!SocketService.instance) {
        SocketService.instance = io(serverUrl, {
            transports: ["websocket"],
            withCredentials: true,
        });
        }
        return SocketService.instance;
    }
}

export default SocketService;
