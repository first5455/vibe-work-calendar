import { Elysia } from "elysia";

// Simple in-memory store for connected clients (using a Set of ws instances)
// In a real generic service, we might not have direct access to the 'app' instance easily 
// if we want to separate concerns strictly, but for this scale, we can export a singleton 
// or just use a global event emitter pattern. 
// For Elysia, the websocket.publish method is the cleanest way if we have the app instance or topic.

// We will use a simple Event Emitter or just a static class that Index.ts can subscribe to, 
// OR simpler: explicit method to "set" the server instance or publish method.

type PublishFn = (topic: string, data: any) => void;

export class WebSocketService {
    private static publishFn: PublishFn | null = null;

    static setPublish(fn: PublishFn) {
        this.publishFn = fn;
    }

    static broadcast(event: string, payload: any) {
        if (this.publishFn) {
            // We broadcast to a general 'updates' topic that all clients subscribe to
            this.publishFn('updates', { event, data: payload });
        }
    }
}
