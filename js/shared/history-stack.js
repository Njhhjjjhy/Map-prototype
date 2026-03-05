/**
 * Reusable history stack for back-button navigation.
 * Used by chatbox and panel systems.
 */
export class HistoryStack {
  constructor() {
    this._stack = [];
  }

  push(entry) {
    this._stack.push(entry);
  }

  pop() {
    return this._stack.pop();
  }

  peek() {
    return this._stack[this._stack.length - 1];
  }

  clear() {
    this._stack = [];
  }

  get length() {
    return this._stack.length;
  }

  get isEmpty() {
    return this._stack.length === 0;
  }
}
