declare module _ {
  export function serialize(obj): string;
  export function trigger(element: Element | Window | Document, name: string, detail?): boolean;
  export function one(element: Element, type: string, listener: EventListener);
  export function observe(element: Element | Window, type: string, handler: EventListener) : EventHandler;

  export function addClass(element: Element, ...names: string[]);
  export function removeClass(element: Element, ...names: string[]);
  export function toggleClass(element: Element, name: string, force?: boolean);

  export function query(selector: string): HTMLElement;
  export function queryAll(selector: string): HTMLElement[];

  export class EventHandler {
    stop();
  }
}