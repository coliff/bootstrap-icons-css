/** @type {import("prettier").Config} */
export default {
  overrides: [
    {
      files: "*.html",
      options: {
        printWidth: 240,
      },
    },
    {
      files: "*.svg",
      options: {
        printWidth: 4096,
        parser: "html",
      },
    },
  ],
};
