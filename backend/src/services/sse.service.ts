type SseClient = {
  userId: string;
  role: "author" | "admin";
  res: any;
};

const sseClients: SseClient[] = [];

export function addSseClient(client: SseClient) {
  sseClients.push(client);
}

export function removeSseClient(res: any) {
  const index = sseClients.findIndex((client) => client.res === res);
  if (index !== -1) {
    sseClients.splice(index, 1);
  }
}

export function sendSseEventToUser(
  userId: string,
  eventName: string,
  data: any
) {
  sseClients.forEach((client) => {
    if (client.userId === userId) {
      client.res.write(`event: ${eventName}\n`);
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  });
}

export function sendSseEventToRole(
  role: "author" | "admin",
  eventName: string,
  data: any
) {
  sseClients.forEach((client) => {
    if (client.role === role) {
      client.res.write(`event: ${eventName}\n`);
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  });
}
