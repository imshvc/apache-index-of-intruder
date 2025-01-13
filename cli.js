/*
 * Copyright (c) 2025 Nurudin Imsirovic
 *
 * See LICENSE
 */

import { parseArgs } from 'node:util';
import { URL } from 'url';
import { JSDOM } from 'jsdom';
import request from 'sync-request';
import * as fs from 'node:fs';
import 'http';

// parse args with a built-in
const args = parseArgs({
  options: {
    url: { type: 'string', short: 'u' },
    format: { type: 'string', short: 'f' },
    strip_url: { type: 'boolean', short: 's' },
    output: { type: 'string', short: 'o' },
    help: { type: 'boolean', short: 'h' },
  },
});

// formats we can output
const outputFormats = ['text', 'json'];

function printHelp() {
  console.log('apache-index-of-intruder');
  console.log('Copyright (c) 2025 Nurudin Imsirovic\n');
  console.log('Usage:');
  console.log('  -u,  --url           Specify a valid URL to the "Index of" page.');
  console.log('  -f,  --format        Output formats: json, text (default)');
  console.log('  -s,  --strip-url     Strips the URL from results - leaving only the path');
  console.log('  -o,  --output        Write (override) to a file - useful when special characters in the URL');
  console.log('  -h,  --help          Help with usage\n');
}

// print help
if (args.values.help) {
  printHelp();
  process.exit();
}

// did not specify a URL
if ('url' in args.values === false) {
  printHelp();
  console.error('Error: specify a URL');
  process.exit(1);
}

// validate URL
try {
  new URL(args.values.url);
} catch {
  console.error('Error: Invalid URL - Example of a valid URL: http://example.com/');
  process.exit(1);
}

// handle output format
if ('format' in args.values === false) {
  args.values.format = 'text'; // default value
} else {
  // invalid format
  if (args.values.format.length == 0 || outputFormats.includes(args.values.format?.toLowerCase()) === false) {
    console.error('Error: Output formats can be: json, text (default)');
    process.exit(1);
  }
}

// validate output file
if ('output' in args.values) {
  if (args.values.output.trim().length == 0) {
    console.error('Error: Output file name cannot be satisfied: ' + args.values.output);
    process.exit(1);
  }
}

// file signature taken from page source of the initial URL you pass.
// this signature is then used on all following requests to make sure
// that the intruder is picking at the right pages.
let fileSignature = null;

let urlMap = {}; // used to avoid iterating same URLs twice (infinite loop, etc)
let prefixUrl = args.values.url;

// make sure prefixUrl ends with '/'
if (prefixUrl[prefixUrl.length - 1] !== '/') {
  prefixUrl += '/';
}

// queued URLs for processing
// * URLs ending in '/' are directories.
let urlQueue = [prefixUrl];
let queuedUrl;

// Iterate over the queue
while (queuedUrl = urlQueue.pop()) {
  try {
    let res = request('GET', queuedUrl);
    let body = res.getBody('utf8');

    // empty response
    if (body.length == 0) {
      continue;
    }

    // file signature bad
    if (fileSignature !== null) {
      // invalid signature
      if (body.substring(0, fileSignature.length) !== fileSignature) {
        continue;// move onto next page
      }

      // signature bigger than body length
      if (fileSignature.length > body.length) {
        continue; // move onto next page
      }
    }

    // file signature not set (first request)
    if (fileSignature === null) {
      let doctypeBegin = body.toLowerCase().indexOf('<!doctype');

      // can't set signature - no doctype
      if (doctypeBegin == -1) {
        console.error('Error: The URL has no file signature that we can depend on.');
        process.exit(1);
      }

      let doctypeEnd = body.substring(doctypeBegin).indexOf('>');
      fileSignature = body.substring(doctypeBegin, doctypeEnd + 1);
    }

    let vdom = new JSDOM(body);

    // remove 'Parent Directory' link
    let parentDir = vdom.window.document.querySelector('img[alt="[PARENTDIR]"]');

    if (parentDir !== null) {
      parentDir.parentElement.parentElement.remove();
    }

    let anchors = vdom.window.document.querySelectorAll('a');

    for (let anchor of anchors) {
      let href = anchor.getAttribute('href') ?? '';

      if (href.length == 0) {
        continue;
      }

      // skip 4 links those are "sort by type"
      if (href[0] == '?') {
        continue;
      }

      let typeDir = href[href.length - 1] === '/';
      let compiledUrl = queuedUrl + href;

      if (typeof urlMap[compiledUrl] !== 'undefined') {
        // duplicate
        continue;
      } else {
        // initialize
        urlMap[compiledUrl] = 0;
      }

      if (typeDir) {
        urlQueue.push(compiledUrl);
      }
    }
  } catch (error) {
    console.error('Request Error:', error.message);
    console.error('If the script continued, the list would be incorrect.');
    console.error('Script terminated.');
    process.exit(1);
  }
}

// format data and print to console
let formattedData = '';
urlMap = Object.keys(urlMap);

// strip URL from the list
if (args.values.strip_url) {
  for (let i in urlMap) {
    urlMap[i] = urlMap[i].replace(args.values.url, '');
  }
}

// decide how to format the data
switch (args.values.format) {
  default:
    console.error('Unknown Format: ' + args.values.format);
    process.exit(1);

  case 'text':
    {
      for (let url of urlMap) {
        formattedData += url + "\n";
      }
    }
    break;

  case 'json':
    {
      formattedData = JSON.stringify(urlMap);
    }
    break;
}

// * validated output file at the start
if (args.values.output) {
  // write to a file
  try {
    fs.writeFileSync(args.values.output, formattedData, 'utf8');
    console.log('File written successfully: ' + args.values.output);
  } catch (error) {
    console.error('File write operation failed: ' + args.values.output);
    console.error('Error Message: ' + error?.message);
    process.exit(1);
  }
} else {
  // write to console

  // * you can pipe this output to a file, but I don't
  //   know if unicode characters will be preserved.
  console.log(formattedData);
}

process.exit(0);
