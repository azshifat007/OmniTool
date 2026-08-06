import { dump, load } from 'js-yaml';

export function jsonToYaml(input) {
  const parsed = JSON.parse(input);
  return dump(parsed, { indent: 2 });
}

export function yamlToJson(input) {
  const parsed = load(input);
  return JSON.stringify(parsed, null, 2);
}

export function encodeBase64(input) {
  return btoa(input);
}

export function decodeBase64(input) {
  return atob(input);
}

export function encodeURL(input) {
  return encodeURIComponent(input);
}

export function decodeURL(input) {
  return decodeURIComponent(input);
}

export const converterFns = {
  'json-to-yaml': { fn: jsonToYaml, inputLabel: 'JSON', outputLabel: 'YAML' },
  'yaml-to-json': { fn: yamlToJson, inputLabel: 'YAML', outputLabel: 'JSON' },
  'encode-base64': { fn: encodeBase64, inputLabel: 'Text', outputLabel: 'Base64' },
  'decode-base64': { fn: decodeBase64, inputLabel: 'Base64', outputLabel: 'Text' },
  'encode-url': { fn: encodeURL, inputLabel: 'Text', outputLabel: 'Encoded URL' },
  'decode-url': { fn: decodeURL, inputLabel: 'Encoded URL', outputLabel: 'Text' },
};
