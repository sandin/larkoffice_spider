export const DB_CONFIG = {
  url: 'mongodb://localhost:27017',
  db_name: 'lark_office',
  collection_name: 'docx',
};

export const BROWSER_CONFIG = {
  headless: false,
  executablePath:
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  devtools: true,
  slowMo: 250, // slow down by 250ms
};
