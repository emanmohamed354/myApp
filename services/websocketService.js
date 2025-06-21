// services/websocketService.js
import Config from '../config/config';

export class WebSocketService {
  static instance = null;
  static subscribers = new Map();

  static getInstance() {
    if (!this.instance) {
      this.instance = new WebSocketService();
    }
    return this.instance;
  }

  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
  }

  connect(token) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(`${Config.wsUrl}?token=${token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifySubscribers('connected', { connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
        }
      };

      this.ws.onerror = (error) => {
        this.notifySubscribers('error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.notifySubscribers('connected', { connected: false });
        this.attemptReconnect();
      };
    } catch (error) {
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case 'SENSOR_UPDATE':
        this.notifySubscribers('sensorUpdate', data.payload);
        break;
      case 'ALERT':
        this.notifySubscribers('alert', data.payload);
        break;
      case 'NOTIFICATION':
        this.notifySubscribers('notification', data.payload);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  notifySubscribers(event, data) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
        }
      });
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
    }
  }
}

// hooks/useWebSocket.js
import { useEffect, useCallback } from 'react';
import { WebSocketService } from '../services/websocketService';
import { useAuth } from '../contexts/AuthContext';

export const useWebSocket = () => {
  const { token } = useAuth();
  const ws = WebSocketService.getInstance();

  useEffect(() => {
    if (token) {
      ws.connect(token);
    }

    return () => {
      ws.disconnect();
    };
  }, [token]);

  const subscribe = useCallback((event, callback) => {
    return ws.subscribe(event, callback);
  }, []);

  const send = useCallback((data) => {
    ws.send(data);
  }, []);

  return {
    subscribe,
    send,
  };
};