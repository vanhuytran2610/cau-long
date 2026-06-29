export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Suggestion {
  id: string;
  label: string;
  prompt: string;
  category: "read" | "write";
}