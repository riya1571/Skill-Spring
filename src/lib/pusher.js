import PusherClient from "pusher-js";

// Using a singleton for the client to avoid multiple connections in development
let pusherClientInstance = null;

export const getPusherClient = () => {
  if (typeof window === "undefined") {
    return null;
  }
  
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
  }
  
  return pusherClientInstance;
};
