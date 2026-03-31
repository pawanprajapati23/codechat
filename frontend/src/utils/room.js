export class Room {
  constructor(code, uid, name, callback) {
    this.code = code;
    this.uid = uid;
    this._n = name;
    this.ch = new BroadcastChannel(`chat-${code}`);
    this.ch.onmessage = (e) => callback(e.data);
  }

  emit(type, payload = {}) {
    const message = {
      type,
      from: this.uid,
      fromName: this._n,
      ...payload,
      ts: Date.now(),
    };
    this.ch.postMessage(message);
    return message;
  }
}

export const registry = {};

export function generateCode() {
  const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMN";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function generateColor() {
  const colors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function generateUID() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
