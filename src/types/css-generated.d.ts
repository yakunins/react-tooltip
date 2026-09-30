// Types for the files emitted by css-to-js.js. No imports, so the wildcard
// declaration stays global.
declare module '*.css.generated.js' {
  const css: {
    src: string;
    hash: string;
    content: string;
  };
  export default css;
}
