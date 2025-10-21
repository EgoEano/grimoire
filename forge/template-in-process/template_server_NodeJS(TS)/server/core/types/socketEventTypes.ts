import http from 'http';
import https from 'https';
import { Server, Socket } from "socket.io";

import { SystemSocketEvents } from "./socketEvents_System.js";
import { ChatSocketEvents } from "./socketEvents_Messenger.js";

import type { ServerOptions } from "socket.io";
import type { createAdapter } from '@socket.io/redis-adapter';
import type { SystemEventPayloads } from "./socketEvents_System.js";
import type { ChatEventPayloads } from "./socketEvents_Messenger.js";

export const SocketEvents = {
    ...SystemSocketEvents,
    ...ChatSocketEvents
}
// Все payload системы
export type EventPayloads = SystemEventPayloads & ChatEventPayloads;

// Хелперы для типизации socket.emit и socket.on
export type EventNames = keyof EventPayloads;

// Payload для конкретного события
export type EventPayload<T extends EventNames> = EventPayloads[T];

// Универсальный обработчик
export type SocketEventHandler<K extends EventNames> = (
    ctx: { io: Server; socket: Socket },
    payload: EventPayloads[K]
) => void;

export type SocketEventHandlerMap = {
    [K in EventNames]?: SocketEventHandler<K>;
};

export interface SocketServerInitProps {
    server: http.Server | https.Server;
    options: Partial<ServerOptions>;
    adapter: ReturnType<typeof createAdapter>;
    handlers?: SocketEventHandlerMap | null;
};

export interface RegisterSocketEventHandler<K extends EventNames> {
    io: Server;
    socket: Socket;
    event: K;
    handler: SocketEventHandler<K>;
};