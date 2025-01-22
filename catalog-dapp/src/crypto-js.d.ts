declare module "crypto-js" {
  const CryptoJS: {
    SHA256: (message: string | CryptoJS.lib.WordArray) => CryptoJS.lib.WordArray;
    enc: {
      Hex: any;
      Utf8: any;
    };
    lib: {
      WordArray: {
        create: (bytes: ArrayBuffer) => CryptoJS.lib.WordArray;
      };
    };
  };

  export default CryptoJS;
}
