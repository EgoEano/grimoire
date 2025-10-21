export enum ChatSocketEvents {
    // Чаты
    CHAT_CREATED = "chat:created",       // создан новый чат
    CHAT_UPDATED = "chat:updated",       // обновлены данные чата (название, участники)
    CHAT_DELETED = "chat:deleted",       // чат удалён
    CHAT_MEMBER_ADDED = "chat:memberAdded", // добавлен участник
    CHAT_MEMBER_REMOVED = "chat:memberRemoved", // удалён участник
  
    // Сообщения
    MESSAGE_SENT = "message:sent",       // новое сообщение отправлено
    MESSAGE_DELIVERED = "message:delivered", // доставлено клиенту
    MESSAGE_READ = "message:read",       // помечено как прочитанное
    MESSAGE_EDITED = "message:edited",   // сообщение изменено
    MESSAGE_DELETED = "message:deleted", // сообщение удалено
  
    // Реакции и действия
    MESSAGE_REACTION = "message:reaction", // добавлена реакция на сообщение
  
    // Транзакционные события (например, для загрузки пачки сообщений)
    MESSAGES_SYNC = "messages:sync",     // синхронизация истории сообщений
}

export interface ChatEventPayloads {
    // --- Чаты ---
    [ChatSocketEvents.CHAT_CREATED]: {
        chatId: string;
        title: string;
        members: string[];
    };

    [ChatSocketEvents.CHAT_UPDATED]: {
        chatId: string;
        changes: {
        title?: string;
        members?: string[];
        };
    };

    [ChatSocketEvents.CHAT_DELETED]: {
        chatId: string;
    };

    [ChatSocketEvents.CHAT_MEMBER_ADDED]: {
        chatId: string;
        userId: string;
    };

    [ChatSocketEvents.CHAT_MEMBER_REMOVED]: {
        chatId: string;
        userId: string;
    };

    // --- Сообщения ---
    [ChatSocketEvents.MESSAGE_SENT]: {
        chatId: string;
        messageId: string;
        senderId: string;
        text: string;
        timestamp: number;
    };

    [ChatSocketEvents.MESSAGE_DELIVERED]: {
        chatId: string;
        messageId: string;
        userId: string;
        deliveredAt: number;
    };

    [ChatSocketEvents.MESSAGE_READ]: {
        chatId: string;
        messageId: string;
        userId: string;
        readAt: number;
    };

    [ChatSocketEvents.MESSAGE_EDITED]: {
        chatId: string;
        messageId: string;
        newText: string;
        editedAt: number;
    };

    [ChatSocketEvents.MESSAGE_DELETED]: {
        chatId: string;
        messageId: string;
        deletedAt: number;
    };

    [ChatSocketEvents.MESSAGE_REACTION]: {
        chatId: string;
        messageId: string;
        userId: string;
        reaction: string; // например, "👍", "❤️", "😂"
    };

    // --- Синхронизация ---
    [ChatSocketEvents.MESSAGES_SYNC]: {
        chatId: string;
        messages: {
        messageId: string;
        senderId: string;
        text: string;
        timestamp: number;
        }[];
    };
}

  