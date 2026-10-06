// Types for css-to-js.js output; no imports, so the declaration stays global.
declare module '*.css.generated.js' {
  const css: {
    src: string;
    hash: string;
    content: string;
  };
  export default css;
}
