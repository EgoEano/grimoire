import { SocketEventBus } from "./socketEventBusFactory.js";
import type { SocketServerInitProps } from "../../types/socketEventTypes";

export class SocketBusSingleton {
    private static instance: SocketEventBus | null = null;

    private constructor() {} // запрет на new извне

    static init(props: SocketServerInitProps): void {
        if (!SocketBusSingleton.instance) {
            SocketBusSingleton.instance = new SocketEventBus(props);
        }
    }

    static getInstance(): SocketEventBus {
        if (!SocketBusSingleton.instance) {
            throw new Error("SocketBusSingleton not initialized — call init(props) first");
        }
        return SocketBusSingleton.instance;
    }
}
