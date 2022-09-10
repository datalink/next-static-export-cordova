# next-static-export-cordova

Packages a next.js website built using `next export` to be compatible with a Cordova project.

# Overview

This does the following:

1. Renames the `_next/` folder to `next/`, along with all references in source code
2. Copies any source maps created in `next build` but missing from `next export`
3. (future work...)

# Installation

```sh
npm install --save-dev github:datalink/next-static-export-cordova
```

Highly recommended: you should also install `next-static-export-fix-csp-quotes` to handle fixing
your content security policy. See https://github.com/datalink/next-static-export-fix-csp-quotes.


# Usage

In your `package.json`, add it to the end of your build process as follows:

```json
{
  "scripts": {
    "build": "next build && next export && next-static-export-cordova",
  }
}
```

After running this, your `/out` directory can be copied into your cordova project's `/www` directory.
