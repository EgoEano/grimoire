import type { Socket } from "socket.io";

export enum SystemSocketEvents {
    // Соединение и статус
    CONNECT = "connect",         // стандартное событие socket.io при подключении
    DISCONNECT = "disconnect",   // при отключении
    ERROR = "error",             // общая ошибка сокета
  
    // Авторизация
    AUTH_REQUIRED = "auth:required", // сервер запрашивает авторизацию
    AUTH_SUCCESS = "auth:success",   // клиент успешно авторизован
    AUTH_FAILED = "auth:failed",     // ошибка авторизации (например, токен невалиден)
  
    // Служебные уведомления
    PING = "ping",   // проверка соединения
    PONG = "pong",   // ответ на проверку
    SERVER_MESSAGE = "server:message", // универсальное сообщение от сервера (системные уведомления)
  
    // Общие "триггеры"
    ENTITY_UPDATED = "entity:updated", // изменение какой-либо сущности (глобальный пуш)
    ENTITY_DELETED = "entity:deleted", // удаление
}

export interface SystemEventPayloads {
    [SystemSocketEvents.CONNECT]: void; // socket.io сам передаёт данные
    [SystemSocketEvents.DISCONNECT]: { reason: string };

    [SystemSocketEvents.ERROR]: { code: number; message: string };

    [SystemSocketEvents.AUTH_REQUIRED]: void;
    [SystemSocketEvents.AUTH_SUCCESS]: { userId: string; token: string };
    [SystemSocketEvents.AUTH_FAILED]: { reason: string };

    [SystemSocketEvents.PING]: { timestamp: number };
    [SystemSocketEvents.PONG]: { timestamp: number };

    [SystemSocketEvents.SERVER_MESSAGE]: {
        type: "info" | "warning" | "error";
        text: string;
    };

    [SystemSocketEvents.ENTITY_UPDATED]: {
        entity: string; // например, "chat" или "user"
        id: string;
        changes: Record<string, unknown>;
    };

    [SystemSocketEvents.ENTITY_DELETED]: {
        entity: string;
        id: string;
    };
}

  