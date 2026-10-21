// Server-Sent Events (SSE) Manager for Real-Time Notifications
const sseClients = new Map(); // userId string -> Set of HTTP response objects

const sseHandler = (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  const userId = req.user._id.toString();
  if (!sseClients.has(userId)) {
    sseClients.set(userId, new Set());
  }
  sseClients.get(userId).add(res);

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

  // Keep-alive heartbeat every 20 seconds
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 20000);

  req.on("close", () => {
    clearInterval(heartbeat);
    if (sseClients.has(userId)) {
      sseClients.get(userId).delete(res);
      if (sseClients.get(userId).size === 0) {
        sseClients.delete(userId);
      }
    }
  });
};

const sendNotificationToUser = (userId, notificationData) => {
  if (!userId) return;
  const userIdStr = userId.toString();
  if (sseClients.has(userIdStr)) {
    const clients = sseClients.get(userIdStr);
    for (const client of clients) {
      try {
        client.write(`data: ${JSON.stringify(notificationData)}\n\n`);
      } catch (err) {
        console.error("Error writing to SSE client:", err.message);
      }
    }
  }
};

module.exports = {
  sseHandler,
  sendNotificationToUser,
};
