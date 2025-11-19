# install

```bash
npm install --save-dev mocha chai jsdom jsdom-global ts-node @types/mocha @types/chai @types/jsdom

```

die Test Dateien sollen im root.folder/test liegen

#.mocharc.*

```json

{
  "require": [
    "ts-node/register",
    "test/setup.ts"
  ],
  "spec": "test/**/*.spec.ts",
  "extension": ["ts"],
  "recursive": true,
  "timeout": 5000
}

```

