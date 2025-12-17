import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type WebSocketContextType = {
    lastMessage: any;
    isConnected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<any>(null);
    const pingIntervalRef = useRef<any>(null);

    const connect = () => {
        // Dynamic URL determination for Cloudflare Tunnel / Dev
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // If VITE_API_URL is set, use its host, otherwise use window.location.host
        const apiHost = import.meta.env.VITE_API_URL 
            ? new URL(import.meta.env.VITE_API_URL).host 
            : window.location.host;
            
        const wsUrl = `${protocol}//${apiHost}/ws`;

        console.log("Connecting to WebSocket:", wsUrl);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
            
            // Start heartbeat
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send("ping");
                }
            }, 30000); // 30 seconds
        };

        ws.onmessage = (event) => {
            if (event.data === "pong") return; // Ignore pong
            try {
                const data = JSON.parse(event.data);
                console.log("WebSocket message:", data);
                setLastMessage(data);
            } catch (e) {
                console.error("Failed to parse WS message", e);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            setIsConnected(false);
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            
            // Reconnect
            reconnectTimeoutRef.current = setTimeout(() => {
                console.log("Attempting to reconnect...");
                connect();
            }, 3000);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            ws.close();
        };

        wsRef.current = ws;
    };

    useEffect(() => {
        connect();
        return () => {
            if (wsRef.current) wsRef.current.close();
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ isConnected, lastMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}
