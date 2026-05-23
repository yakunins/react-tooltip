// Ambient declaration for the files emitted by `css-to-js.js`
// (e.g. `tooltip.css.generated.js`). Kept as a global script file so the
// wildcard module declaration stays globally visible.
declare module '*.css.generated.js' {
  const css: {
    src: string;
    hash: string;
    content: string;
  };
  export default css;
}
