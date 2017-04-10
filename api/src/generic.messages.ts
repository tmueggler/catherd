export type MessageType = number;
export type Timestamp = number;

export interface Message {
    readonly type: MessageType;
}