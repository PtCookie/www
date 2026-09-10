// `shiki`'s exports map sends "./onig.wasm" straight at the binary (`./dist/onig.wasm`), so there
// is no declaration for `tsc` to find. Under the Workers build that import resolves to a
// `WebAssembly.Module`; src/lib/highlighter.ts instantiates it by hand for lack of a shiki type
// covering this shape.
declare module "shiki/onig.wasm" {
  const onigWasm: WebAssembly.Module;
  export default onigWasm;
}
