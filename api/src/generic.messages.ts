export interface Message {
    readonly type: MessageType;
    readonly from: string;
    readonly to: string;
}

export type MessageType = number;