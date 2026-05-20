import "@testing-library/jest-dom/vitest";

// jsdom doesn't ship ResizeObserver; cmdk + Radix popover use it.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

// jsdom lacks scrollIntoView; cmdk calls it when navigating options.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

// jsdom doesn't implement PointerEvent; Radix popover triggers depend on it.
if (typeof window !== "undefined") {
  type PointerCapable = Element & {
    hasPointerCapture?: (id: number) => boolean;
    releasePointerCapture?: (id: number) => void;
    setPointerCapture?: (id: number) => void;
  };
  const proto = Element.prototype as PointerCapable;
  if (!proto.hasPointerCapture) proto.hasPointerCapture = () => false;
  if (!proto.releasePointerCapture) proto.releasePointerCapture = () => {};
  if (!proto.setPointerCapture) proto.setPointerCapture = () => {};
}
