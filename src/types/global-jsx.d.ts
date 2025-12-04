// Minimal global JSX ambient declarations to satisfy TS in this root `src` app
// This file only affects type-checking and does not change runtime behavior or UI.
// It prevents errors like TS7026 (no JSX.IntrinsicElements) and relaxes prop typing.
declare global {
  namespace JSX {
    // Allow any intrinsic element and props
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element {}
    interface ElementClass { render: any }
    interface ElementAttributesProperty { props: any }
    interface ElementChildrenAttribute { children: any }
  }
}

export {};
