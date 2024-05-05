/**
 * Author: @fadedimon
 * Repo: https://github.com/fadedimon/typed-event-emitter
 */
type SubscriptionItem = {
    cb(arg: unknown): unknown,
    once: boolean,
  };
  
  type Subscriber<T extends {}> = {
    on<TName extends keyof T>(name: TName, cb: (arg: T[TName]) => unknown): void,
  };
  
  type SubscriberOnce<T extends {}> = {
    once<TName extends keyof T>(name: TName, cb: (arg: T[TName]) => unknown): void,
  };
  
  type UnSubscriber<T extends {}> = {
    off(): void,
    off<TName extends keyof T>(name: TName): void,
    off<TName extends keyof T>(name: TName, cb: (arg: T[TName]) => unknown): void,
  };
  
  type Emitter<T extends {}> = {
    emit<TName extends keyof T>(name: TName, arg: T[TName]): void,
  };
  
  /**
   * Provides an amazing experience of event handling by utilising incredible benefits of types.
   * It requires event-to-callback-argument map as first generic attribute and makes sure that
   * all methods are used correctly.
   *
   * Example of usage:
   * ```
   * type EventsMap {
   *   'event-name': 'callback-value'
   * }
   * const emitter = new TypedEventEmitter<EventsMap>();
   * emitter.on('event-name', (arg) => console.assert(arg === 'callback-value'));
   * emitter.emit('event-name', 'callback-value');
   * ```
   */
  export class TypedEventEmitter<T extends {}>
    implements Subscriber<T>, SubscriberOnce<T>, UnSubscriber<T>, Emitter<T>
  {
    private eventHandlersMap = new Map<keyof T, Set<SubscriptionItem>>();
  
    /**
     * Subscribe to the event
     * @param name Event's name
     * @param cb Callback
     */
    on<TName extends keyof T>(name: TName, cb: (arg: T[TName]) => unknown): void {
      this.subscribe(name, cb);
    }
  
    /**
     * Subscribe to the event once
     * @param name Event's name
     * @param cb Callback
     */
    once<TName extends keyof T>(name: TName, cb: (arg: T[TName]) => unknown): void {
      this.subscribe(name, cb, { once: true });
    }
  
    /**
     * Emit the event
     * @param name Event's name
     * @param arg Event's argument
     */
    emit<TName extends keyof T>(name: TName, arg: T[TName]): void {
      const handlers = this.eventHandlersMap.get(name);
      handlers?.forEach(item => {
        item.cb(arg);
        if (item.once) {
          handlers.delete(item);
        }
      });
    }
  
    /**
     * Unsubscribe from all events
     */
    off(): void;
    /**
     * Unsubscribe from all events with given name
     * @param name Event's name
     */
    off<TName extends keyof T>(name: TName): void;
    /**
     * Unsubscribe given callback
     * @param name Event's name
     * @param cb Callback function
     */
    off<TName extends keyof T>(name: TName, cb: (arg: T[TName]) => unknown): void;
    off<TName extends keyof T>(name?: TName, cb?: (arg: T[TName]) => unknown): void {
      if (typeof name === 'undefined') {
        this.eventHandlersMap.forEach(list => list.clear());
        this.eventHandlersMap.clear();
        return;
      }
  
      if (typeof cb === 'undefined') {
        this.eventHandlersMap.delete(name);
        return;
      }
  
      const handlers = this.eventHandlersMap.get(name);
      handlers?.forEach(item => {
        if (item.cb === cb) {
          handlers.delete(item);
        }
      });
    }
  
    private subscribe<TName extends keyof T>(
      name: TName,
      cb: (arg: T[TName]) => unknown,
      params: { once?: boolean } = {},
    ): void {
      let handlers = this.eventHandlersMap.get(name);
  
      if (!handlers) {
        handlers = new Set();
        this.eventHandlersMap.set(name, handlers);
      }
  
      handlers.add({ cb, once: params.once || false });
    }
  }
  