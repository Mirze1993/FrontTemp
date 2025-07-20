export class ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
  authorName?: string;
}

export class ChatSession {
  id?: string;
  history?: ChatMessage[];
  createDate?: Date;
  userId?: Date;
}

export class AddChatHistoryReq{
  sessionId: string;
  role: string;
  content: string;
  authorName: string;
}
