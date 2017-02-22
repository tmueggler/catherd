export interface Message {
    type: MessageType;
    from: string;
    to: string;
}

export type MessageType = number;