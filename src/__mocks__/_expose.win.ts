(global as any).__BB = {};

export default function expose<T extends any>(key: string, thing: T) {
  (global as any).__BB[key] = thing;
}
