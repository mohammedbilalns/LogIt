export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  connectionType: "following" | "blocked";
}
