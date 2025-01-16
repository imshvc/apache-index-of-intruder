# Apache "Index of" Intruder

Recursively list files from an Apache "Index of" page.

## Installation

1. Git clone the repository: `git clone https://github.com/imshvc/apache-index-of-intruder --depth=1`
2. Inside `apache-index-of-intruder` run `npm install`.
3. Then run `apache-index-of-intruder`:

```
apache-index-of-intruder
Copyright (c) 2025 Nurudin Imsirovic

Usage:
  -u,  --url           Specify a valid URL to the "Index of" page.
  -f,  --format        Output formats: json, text (default)
  -s,  --strip-url     Strips the URL from results - leaving only the path
  -o,  --output        Write (override) to a file - useful when special characters in the URL
  -h,  --help          Help with usage

Error: specify a URL
```

---

## Just a demo

I've prepared an example on my website.  
Running the command:

```
apache-index-of-intruder --url https://imshvc.github.io/examples/apache-index-of/
```

You get the output:

```
https://imshvc.github.io/examples/apache-index-of/readme.txt
https://imshvc.github.io/examples/apache-index-of/wp-includes/
https://imshvc.github.io/examples/apache-index-of/wp-includes/Text/
https://imshvc.github.io/examples/apache-index-of/wp-includes/Text/Diff.php
https://imshvc.github.io/examples/apache-index-of/wp-includes/Text/Diff/
https://imshvc.github.io/examples/apache-index-of/wp-includes/Text/Exception.php
https://imshvc.github.io/examples/apache-index-of/wp-includes/Text/Diff/Engine/
https://imshvc.github.io/examples/apache-index-of/wp-includes/Text/Diff/Renderer.php
https://imshvc.github.io/examples/apache-index-of/wp-includes/Text/Diff/Renderer/
https://imshvc.github.io/examples/apache-index-of/wp-includes/Text/Diff/Renderer/inline.php
https://imshvc.github.io/examples/apache-index-of/wp-includes/Text/Diff/Engine/native.php
https://imshvc.github.io/examples/apache-index-of/wp-includes/Text/Diff/Engine/shell.php
https://imshvc.github.io/examples/apache-index-of/wp-includes/Text/Diff/Engine/string.php
https://imshvc.github.io/examples/apache-index-of/wp-includes/Text/Diff/Engine/xdiff.php
```
