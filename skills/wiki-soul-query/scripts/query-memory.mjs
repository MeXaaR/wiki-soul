// WIKI_SOUL_MANAGED_SKILL_ASSET_V1 skill=wiki-soul-query

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { domainToASCII } from 'node:url';

const DEFAULT_LIMIT = 20;
const MAX_FRONTMATTER_BYTES = 64 * 1024;
const READ_CHUNK_BYTES = 4096;
const FIELD_WEIGHTS = {
  tags: 10,
  description: 5,
  default: 1,
};
const COVERAGE_BONUS = 3;
const RESERVED_FILES = new Set(['index.md', 'log.md']);
const PROJECT_ID_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?-[a-f0-9]{8}$/u;
const TRUST_RANK = {
  unverified: 0,
  'machine-confirmed': 1,
  'human-reviewed': 2,
};
const STATUS_RANK = {
  deprecated: 0,
  draft: 1,
  stable: 2,
};

function normalize(value) {
  return String(value)
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/\s+/gu, ' ')
    .trim();
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function sha256Prefix(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex').slice(0, 8);
}

function slugify(value) {
  const slug = String(value)
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
    .slice(0, 48)
    .replace(/-+$/gu, '');
  return slug || 'project';
}

function projectIdFromCanonical(canonical, prefixSource = canonical) {
  return `${slugify(prefixSource)}-${sha256Prefix(canonical)}`;
}

function stripAsciiWhitespace(value) {
  return String(value).replace(/^[\u0009-\u000d\u0020]+|[\u0009-\u000d\u0020]+$/gu, '');
}

function normalizeRemotePath(rawPath) {
  const segments = [];

  for (const rawSegment of rawPath.split('/')) {
    if (!rawSegment) {
      continue;
    }

    let decoded;
    try {
      decoded = decodeURIComponent(rawSegment);
    } catch {
      return null;
    }

    if (
      decoded === '..'
      || decoded.includes('/')
      || decoded.includes('\\')
      || /[\u0000-\u001f\u007f]/u.test(decoded)
    ) {
      return null;
    }
    if (decoded === '.') {
      continue;
    }

    segments.push(decoded.normalize('NFC'));
  }

  if (segments.length === 0) {
    return null;
  }

  segments[segments.length - 1] = segments[segments.length - 1].replace(/\.git$/iu, '');
  if (!segments[segments.length - 1]) {
    return null;
  }

  return segments.join('/');
}

function normalizeHost(hostname) {
  const unwrapped = hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname;
  const ascii = unwrapped.includes(':') ? unwrapped : domainToASCII(unwrapped);
  if (!ascii) {
    return null;
  }
  const normalized = ascii.toLowerCase().replace(/\.$/u, '');
  return normalized.includes(':') ? `[${normalized}]` : normalized;
}

function canonicalizeRemote(input) {
  const remote = stripAsciiWhitespace(input);
  if (!remote) {
    return null;
  }

  let hostname;
  let port = '';
  let rawPath;
  let protocol = '';

  if (/^[a-z][a-z0-9+.-]*:\/\//iu.test(remote)) {
    let parsed;
    try {
      parsed = new URL(remote);
    } catch {
      return null;
    }

    protocol = parsed.protocol.toLowerCase();
    if (!['http:', 'https:', 'ssh:', 'git:'].includes(protocol)) {
      return null;
    }

    hostname = parsed.hostname;
    port = parsed.port;
    rawPath = parsed.pathname;
  } else {
    const scpMatch = remote.match(/^(?:[^@/:\s]+@)?(\[[^\]]+\]|[^/:\s]+):(.+)$/u);
    if (!scpMatch) {
      return null;
    }
    hostname = scpMatch[1];
    rawPath = scpMatch[2].split(/[?#]/u, 1)[0];
  }

  const host = normalizeHost(hostname);
  const repositoryPath = normalizeRemotePath(rawPath);
  if (!host || !repositoryPath) {
    return null;
  }

  const defaultPorts = {
    'http:': '80',
    'https:': '443',
    'ssh:': '22',
    'git:': '9418',
  };
  const canonicalPort = port && port !== defaultPorts[protocol] ? `:${port}` : '';
  return `${host}${canonicalPort}/${repositoryPath}`;
}

function runGit(args, cwd) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    timeout: 3000,
    windowsHide: true,
  });
  if (result.error || result.status !== 0) {
    return null;
  }
  return result.stdout.trim();
}

function detectProjectRoot(candidateRoot) {
  const requested = path.resolve(candidateRoot || process.cwd());
  let realRequested;
  try {
    realRequested = fs.realpathSync(requested);
  } catch {
    throw new Error('project_root_not_found');
  }

  if (candidateRoot) {
    return realRequested;
  }

  const gitRoot = runGit(['rev-parse', '--show-toplevel'], realRequested);
  if (!gitRoot) {
    return realRequested;
  }

  try {
    return fs.realpathSync(gitRoot);
  } catch {
    return realRequested;
  }
}

function remoteCandidates(projectRoot) {
  const output = runGit(['remote'], projectRoot);
  if (!output) {
    return [];
  }

  const names = [...new Set(output.split(/\r?\n/u).map((value) => value.trim()).filter(Boolean))];
  const ordered = [
    ...names.filter((name) => name === 'origin'),
    ...names.filter((name) => name === 'upstream'),
    ...names.filter((name) => name !== 'origin' && name !== 'upstream').sort(),
  ];

  return ordered.flatMap((name) => {
    const fetchSpec = runGit(['config', '--get-all', `remote.${name}.fetch`], projectRoot);
    const remoteUrl = fetchSpec ? runGit(['remote', 'get-url', name], projectRoot) : null;
    return remoteUrl ? [remoteUrl] : [];
  });
}

function canonicalLocalPath(projectRoot) {
  let canonical = fs.realpathSync(projectRoot).normalize('NFC').split(path.sep).join('/');
  canonical = canonical.replace(/\/+$/u, '');
  if (process.platform === 'win32') {
    canonical = canonical.toLowerCase();
  }
  return canonical;
}

function deriveProjectId(projectRootOption) {
  const projectRoot = detectProjectRoot(projectRootOption);

  for (const remote of remoteCandidates(projectRoot)) {
    const canonical = canonicalizeRemote(remote);
    if (canonical) {
      return projectIdFromCanonical(canonical);
    }
  }

  const canonical = canonicalLocalPath(projectRoot);
  return projectIdFromCanonical(canonical, path.basename(projectRoot));
}

function validateProjectId(projectId) {
  if (!PROJECT_ID_PATTERN.test(projectId)) {
    throw new Error('invalid_project_id');
  }
  return projectId;
}

function findFrontmatterBounds(buffer, eof = false) {
  const firstNewline = buffer.indexOf(0x0a);
  if (firstNewline === -1) {
    return eof ? null : undefined;
  }

  const firstLineEnd = firstNewline > 0 && buffer[firstNewline - 1] === 0x0d
    ? firstNewline - 1
    : firstNewline;
  if (!buffer.subarray(0, firstLineEnd).equals(Buffer.from('---'))) {
    return null;
  }

  let lineStart = firstNewline + 1;
  while (lineStart <= buffer.length) {
    const nextNewline = buffer.indexOf(0x0a, lineStart);
    if (nextNewline === -1 && !eof) {
      return undefined;
    }

    const rawEnd = nextNewline === -1 ? buffer.length : nextNewline;
    const lineEnd = rawEnd > lineStart && buffer[rawEnd - 1] === 0x0d ? rawEnd - 1 : rawEnd;
    if (buffer.subarray(lineStart, lineEnd).equals(Buffer.from('---'))) {
      return {
        start: firstNewline + 1,
        end: lineStart,
      };
    }

    if (nextNewline === -1) {
      return null;
    }
    lineStart = nextNewline + 1;
  }

  return null;
}

function readFrontmatter(filePath) {
  const descriptor = fs.openSync(filePath, 'r');
  let collected = Buffer.alloc(0);
  let position = 0;

  try {
    while (collected.length <= MAX_FRONTMATTER_BYTES) {
      const chunk = Buffer.allocUnsafe(READ_CHUNK_BYTES);
      const bytesRead = fs.readSync(descriptor, chunk, 0, chunk.length, position);
      const eof = bytesRead === 0;

      if (!eof) {
        position += bytesRead;
        collected = Buffer.concat([collected, chunk.subarray(0, bytesRead)]);
      }

      const bounds = findFrontmatterBounds(collected, eof);
      if (bounds === null) {
        return null;
      }
      if (bounds) {
        const decoder = new TextDecoder('utf-8', { fatal: true });
        return decoder.decode(collected.subarray(bounds.start, bounds.end));
      }
      if (eof) {
        return null;
      }
    }
  } catch {
    return null;
  } finally {
    fs.closeSync(descriptor);
  }

  return null;
}

function unquote(value) {
  const trimmed = String(value).trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/gu, "'");
  }
  return trimmed;
}

function splitFrontmatterFields(frontmatter) {
  const fields = [];
  const looseLines = [];
  let current = null;

  function flush() {
    if (!current) {
      return;
    }
    fields.push(current);
    current = null;
  }

  for (const line of frontmatter.split(/\r?\n/u)) {
    const match = line.match(/^(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_.-]+))\s*:\s*(.*)$/u);
    if (match) {
      flush();
      current = {
        key: match[1] || match[2] || match[3],
        lines: [match[4]],
      };
      continue;
    }

    if (current) {
      current.lines.push(line);
    } else if (line.trim() && !line.trim().startsWith('#')) {
      looseLines.push(line);
    }
  }
  flush();

  if (looseLines.length > 0) {
    fields.push({ key: '$frontmatter', lines: looseLines });
  }

  return fields;
}

function compactFieldValue(lines) {
  const values = [...lines];
  if (/^[>|][+-]?\d*$/u.test(values[0]?.trim() || '')) {
    values.shift();
  }

  return values
    .map((line) => unquote(line.trim().replace(/^-\s+/u, '')))
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function parseInlineList(value) {
  const trimmed = value.trim();
  if (!trimmed.startsWith('[')) {
    return null;
  }

  const closing = trimmed.lastIndexOf(']');
  if (closing === -1) {
    return null;
  }

  const input = trimmed.slice(1, closing);
  const items = [];
  let current = '';
  let quote = null;
  let escaped = false;

  for (const character of input) {
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }
    if (character === '\\' && quote === '"') {
      current += character;
      escaped = true;
      continue;
    }
    if (quote) {
      current += character;
      if (character === quote) {
        quote = null;
      }
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      current += character;
      continue;
    }
    if (character === ',') {
      if (current.trim()) {
        items.push(unquote(current));
      }
      current = '';
      continue;
    }
    current += character;
  }

  if (current.trim()) {
    items.push(unquote(current));
  }
  return items.map((item) => String(item).trim()).filter(Boolean);
}

function parseTags(field) {
  const inline = parseInlineList(field.lines[0] || '');
  if (inline) {
    return inline;
  }

  const blockItems = field.lines
    .slice(field.lines[0]?.trim() ? 0 : 1)
    .map((line) => line.match(/^\s*-\s+(.+?)\s*$/u))
    .filter(Boolean)
    .map((match) => unquote(match[1]));
  if (blockItems.length > 0) {
    return blockItems;
  }

  const scalar = compactFieldValue(field.lines);
  return scalar ? [scalar] : [];
}

function firstField(fields, name) {
  return fields.find((field) => field.key.toLowerCase() === name);
}

function stripYamlComment(value) {
  let quote = null;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === '\\' && quote === '"') {
      escaped = true;
      continue;
    }
    if (quote) {
      if (character === quote) {
        if (quote === "'" && value[index + 1] === "'") {
          index += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '#' && (index === 0 || /\s/u.test(value[index - 1]))) {
      return value.slice(0, index);
    }
  }

  return value;
}

function parseQuotedScalar(value) {
  const input = value.trim();
  const quote = input[0];
  if (quote !== '"' && quote !== "'") {
    return null;
  }

  if (quote === '"') {
    let escaped = false;
    for (let index = 1; index < input.length; index += 1) {
      const character = input[index];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === '\\') {
        escaped = true;
        continue;
      }
      if (character === '"') {
        if (input.slice(index + 1).trim()) {
          return null;
        }
        try {
          return JSON.parse(input.slice(0, index + 1));
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  let parsed = '';
  for (let index = 1; index < input.length; index += 1) {
    if (input[index] !== "'") {
      parsed += input[index];
      continue;
    }
    if (input[index + 1] === "'") {
      parsed += "'";
      index += 1;
      continue;
    }
    return input.slice(index + 1).trim() ? null : parsed;
  }
  return null;
}

function parseYamlScalarValue(value) {
  const input = stripYamlComment(String(value)).trim();
  if (!input || /^[~]$|^null$/iu.test(input)) {
    return null;
  }
  if (input[0] === '"' || input[0] === "'") {
    return parseQuotedScalar(input);
  }
  if (/^[{[>|]/u.test(input)) {
    return null;
  }
  return input;
}

function parseYamlKeyValue(value) {
  const input = stripYamlComment(value).trim();
  if (!input) {
    return null;
  }

  if (input[0] === '"' || input[0] === "'") {
    const quote = input[0];
    let escaped = false;
    let end = -1;
    for (let index = 1; index < input.length; index += 1) {
      const character = input[index];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === '\\' && quote === '"') {
        escaped = true;
        continue;
      }
      if (character === quote) {
        if (quote === "'" && input[index + 1] === "'") {
          index += 1;
        } else {
          end = index;
          break;
        }
      }
    }
    if (end === -1) {
      return null;
    }
    const key = parseQuotedScalar(input.slice(0, end + 1));
    const remainder = input.slice(end + 1).match(/^\s*:\s*([\s\S]*)$/u);
    return typeof key === 'string' && remainder ? { key, rawValue: remainder[1] } : null;
  }

  const match = input.match(/^([A-Za-z0-9_.-]+)\s*:\s*([\s\S]*)$/u);
  return match ? { key: match[1], rawValue: match[2] } : null;
}

function newMappingRecord() {
  return {
    values: new Map(),
    duplicates: new Set(),
  };
}

function addMappingValue(record, key, rawValue) {
  if (key !== 'by' && key !== 'at') {
    return;
  }
  if (record.values.has(key)) {
    record.duplicates.add(key);
    return;
  }
  record.values.set(key, parseYamlScalarValue(rawValue));
}

function splitTopLevel(value) {
  const parts = [];
  const delimiters = [];
  let quote = null;
  let escaped = false;
  let start = 0;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === '\\' && quote === '"') {
      escaped = true;
      continue;
    }
    if (quote) {
      if (character === quote) {
        if (quote === "'" && value[index + 1] === "'") {
          index += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '{' || character === '[') {
      delimiters.push(character);
      continue;
    }
    if (character === '}' || character === ']') {
      const expected = character === '}' ? '{' : '[';
      if (delimiters.pop() !== expected) {
        return null;
      }
      continue;
    }
    if (character === ',' && delimiters.length === 0) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  }

  if (quote || delimiters.length > 0) {
    return null;
  }
  parts.push(value.slice(start));
  return parts;
}

function parseFlowMapping(value) {
  const input = stripYamlComment(value).trim();
  if (!input.startsWith('{') || !input.endsWith('}')) {
    return null;
  }
  const parts = splitTopLevel(input.slice(1, -1));
  if (!parts) {
    return null;
  }

  const record = newMappingRecord();
  for (const part of parts) {
    if (!part.trim()) {
      continue;
    }
    const keyValue = parseYamlKeyValue(part);
    if (!keyValue) {
      return null;
    }
    addMappingValue(record, keyValue.key, keyValue.rawValue);
  }
  return record;
}

function parseFlowMappingList(value) {
  const input = stripYamlComment(value).trim();
  if (!input.startsWith('[') || !input.endsWith(']')) {
    return [];
  }
  const parts = splitTopLevel(input.slice(1, -1));
  if (!parts) {
    return [];
  }
  return parts.map(parseFlowMapping).filter(Boolean);
}

function lineIndent(line) {
  const match = line.match(/^ */u);
  return match ? match[0].length : 0;
}

function parseBlockMapping(lines) {
  const content = lines.filter((line) => stripYamlComment(line).trim());
  if (content.length === 0) {
    return null;
  }
  const baseIndent = Math.min(...content.map(lineIndent));
  const record = newMappingRecord();

  for (const line of content) {
    if (lineIndent(line) !== baseIndent) {
      continue;
    }
    const keyValue = parseYamlKeyValue(line);
    if (!keyValue) {
      return null;
    }
    addMappingValue(record, keyValue.key, keyValue.rawValue);
  }
  return record;
}

function parseBlockMappingList(lines) {
  const content = lines.filter((line) => stripYamlComment(line).trim());
  if (content.length === 0) {
    return [];
  }
  const listIndent = lineIndent(content[0]);
  if (!stripYamlComment(content[0].slice(listIndent)).trim().startsWith('-')) {
    return [];
  }

  const records = [];
  let currentLines = null;
  function flush() {
    if (currentLines) {
      const record = parseBlockMapping(currentLines);
      if (record) {
        records.push(record);
      }
    }
    currentLines = null;
  }

  for (const line of content) {
    const indent = lineIndent(line);
    const trimmed = stripYamlComment(line.slice(indent)).trim();
    const item = indent === listIndent ? trimmed.match(/^-\s*([\s\S]*)$/u) : null;
    if (item) {
      flush();
      const itemValue = item[1].trim();
      if (itemValue.startsWith('{')) {
        const record = parseFlowMapping(itemValue);
        if (record) {
          records.push(record);
        }
      } else if (!itemValue) {
        currentLines = [];
      } else if (parseYamlKeyValue(itemValue)) {
        currentLines = [`${' '.repeat(listIndent + 2)}${itemValue}`];
      }
      continue;
    }
    if (currentLines && indent > listIndent) {
      currentLines.push(line);
    }
  }
  flush();
  return records;
}

function mappingRecords(field, allowList) {
  if (!field) {
    return [];
  }
  const inline = stripYamlComment(field.lines[0] || '').trim();
  if (inline) {
    if (inline.startsWith('{')) {
      const record = parseFlowMapping(inline);
      return record ? [record] : [];
    }
    return allowList && inline.startsWith('[') ? parseFlowMappingList(inline) : [];
  }

  const lines = field.lines.slice(1);
  const firstLine = lines.find((line) => stripYamlComment(line).trim());
  if (!firstLine) {
    return [];
  }
  if (allowList && stripYamlComment(firstLine).trim().startsWith('-')) {
    return parseBlockMappingList(lines);
  }
  const record = parseBlockMapping(lines);
  return record ? [record] : [];
}

function scalarFieldValue(field) {
  return field ? parseYamlScalarValue(field.lines[0] || '') || '' : '';
}

function isoDateValue(value) {
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/u);
  if (!match) {
    return null;
  }

  const timestamp = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const date = new Date(timestamp);
  return (
    date.getUTCFullYear() === Number(match[1])
    && date.getUTCMonth() === Number(match[2]) - 1
    && date.getUTCDate() === Number(match[3])
  ) ? value : null;
}

function isoDateTime(value) {
  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(Z|[+-](\d{2}):(\d{2}))?$/u,
  );
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] || 0);
  const millisecond = Number((match[7] || '').slice(0, 3).padEnd(3, '0'));
  const offsetHour = Number(match[9] || 0);
  const offsetMinute = Number(match[10] || 0);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (
    month < 1
    || month > 12
    || day < 1
    || day > daysInMonth[month - 1]
    || hour > 23
    || minute > 59
    || second > 59
    || offsetHour > 23
    || offsetMinute > 59
  ) {
    return null;
  }

  const instant = new Date(0);
  instant.setUTCFullYear(year, month - 1, day);
  instant.setUTCHours(hour, minute, second, millisecond);
  let timestamp = instant.getTime();
  if (match[8] && match[8] !== 'Z') {
    const direction = match[8][0] === '+' ? 1 : -1;
    timestamp -= direction * ((offsetHour * 60) + offsetMinute) * 60 * 1000;
  }
  return { value, timestamp };
}

function validActor(value) {
  if (typeof value !== 'string' || /[\s\p{Cc}]/u.test(value)) {
    return false;
  }
  if (value.startsWith('human:')) {
    return value.length > 'human:'.length;
  }
  if (value.startsWith('process:')) {
    return value.length > 'process:'.length;
  }
  const segments = value.split('/');
  return segments.length === 2 && segments.every(Boolean);
}

function validActorDateEvent(record) {
  if (!record || record.duplicates.has('by') || record.duplicates.has('at')) {
    return null;
  }
  const by = record.values.get('by');
  const at = isoDateTime(record.values.get('at'));
  return validActor(by) && at ? { by, at } : null;
}

function scanStructuralYaml(value, delimiters) {
  const input = stripYamlComment(value);
  let quote = null;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === '\\' && quote === '"') {
      escaped = true;
      continue;
    }
    if (quote) {
      if (character === quote) {
        if (quote === "'" && input[index + 1] === "'") {
          index += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '{' || character === '[') {
      delimiters.push(character);
      continue;
    }
    if (character === '}' || character === ']') {
      const expected = character === '}' ? '{' : '[';
      if (delimiters.pop() !== expected) {
        return false;
      }
    }
  }
  return quote === null && !escaped;
}

function validFrontmatterStructure(frontmatter) {
  const delimiters = [];
  let sawTopLevelField = false;
  let topLevelAllowsBlock = false;
  let blockScalarIndent = null;

  for (const line of frontmatter.split(/\r?\n/u)) {
    const leadingWhitespace = line.match(/^[\t ]*/u)?.[0] || '';
    if (leadingWhitespace.includes('\t')) {
      return false;
    }
    const indent = leadingWhitespace.length;
    const uncommented = stripYamlComment(line);
    const trimmed = uncommented.trim();

    if (blockScalarIndent !== null) {
      if (!trimmed || indent > blockScalarIndent) {
        continue;
      }
      blockScalarIndent = null;
    }
    if (!trimmed) {
      continue;
    }

    if (indent === 0) {
      if (delimiters.length > 0) {
        return false;
      }
      const keyValue = parseYamlKeyValue(uncommented);
      if (!keyValue) {
        return false;
      }
      sawTopLevelField = true;
      const rawValue = keyValue.rawValue.trim();
      const blockScalar = /^[>|][+-]?\d*$/u.test(rawValue);
      if (!blockScalar && !scanStructuralYaml(uncommented, delimiters)) {
        return false;
      }
      topLevelAllowsBlock = !rawValue || blockScalar || delimiters.length > 0;
      if (blockScalar) {
        blockScalarIndent = 0;
      }
      continue;
    }

    if (!sawTopLevelField || !topLevelAllowsBlock) {
      return false;
    }
    if (delimiters.length === 0) {
      const listItem = trimmed.match(/^-\s*([\s\S]*)$/u);
      if (!listItem && !parseYamlKeyValue(trimmed)) {
        return false;
      }
      const nestedKeyValue = listItem && listItem[1]
        ? parseYamlKeyValue(listItem[1])
        : parseYamlKeyValue(trimmed);
      if (
        nestedKeyValue
        && /^[>|][+-]?\d*$/u.test(nestedKeyValue.rawValue.trim())
      ) {
        blockScalarIndent = indent;
        continue;
      }
    }
    if (!scanStructuralYaml(uncommented, delimiters)) {
      return false;
    }
  }

  return sawTopLevelField && delimiters.length === 0;
}

function currentCalendarDate() {
  const now = new Date();
  return [
    String(now.getFullYear()).padStart(4, '0'),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

function okfSignals(fields, today) {
  const statusValue = scalarFieldValue(firstField(fields, 'status'));
  const status = statusValue ? statusValue.toLowerCase() : 'stable';
  const staleAfterValue = scalarFieldValue(firstField(fields, 'stale_after'));
  const staleAfter = isoDateValue(staleAfterValue);
  const stale = Boolean(staleAfter && today >= staleAfter);

  const verifiedEvents = mappingRecords(firstField(fields, 'verified'), true)
    .map(validActorDateEvent)
    .filter(Boolean);
  const trustTier = verifiedEvents.length === 0
    ? 'unverified'
    : verifiedEvents.some((event) => event.by.startsWith('human:'))
      ? 'human-reviewed'
      : 'machine-confirmed';
  verifiedEvents.sort((left, right) => (
    right.at.timestamp - left.at.timestamp
    || (left.at.value < right.at.value ? -1 : left.at.value > right.at.value ? 1 : 0)
  ));
  const lastVerification = verifiedEvents[0]?.at;

  const generatedAt = mappingRecords(firstField(fields, 'generated'), false)
    .map(validActorDateEvent)
    .find(Boolean)?.at;
  const verificationOutdated = Boolean(
    generatedAt
    && lastVerification
    && generatedAt.timestamp > lastVerification.timestamp
  );

  return {
    status,
    stale,
    ...(staleAfterValue ? { staleAfter: staleAfterValue } : {}),
    trustTier,
    ...(lastVerification ? { lastVerifiedAt: lastVerification.value } : {}),
    verificationOutdated,
  };
}

function queryTerms(rawTerms) {
  const seen = new Set();
  const terms = [];

  for (const raw of rawTerms) {
    const cleaned = unquote(raw);
    const normalized = normalize(cleaned);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    terms.push({ original: String(cleaned), normalized });
  }
  return terms;
}

function matchingTerms(value, terms) {
  const values = Array.isArray(value) ? value : [value];
  const normalizedValues = values.map(normalize).filter(Boolean);
  return terms
    .filter((term) => normalizedValues.some((candidate) => candidate.includes(term.normalized)))
    .map((term) => term.original);
}

function resultForDocument({ filePath, memoryRoot, scope, terms, today }) {
  const frontmatter = readFrontmatter(filePath);
  if (frontmatter === null || !validFrontmatterStructure(frontmatter)) {
    return null;
  }

  const fields = splitFrontmatterFields(frontmatter);
  const typeField = firstField(fields, 'type');
  const type = typeField ? compactFieldValue(typeField.lines) : '';
  if (!type) {
    return null;
  }

  const titleField = firstField(fields, 'title');
  const descriptionField = firstField(fields, 'description');
  const tagsField = firstField(fields, 'tags');
  const title = titleField ? compactFieldValue(titleField.lines) : undefined;
  const description = descriptionField ? compactFieldValue(descriptionField.lines) : undefined;
  const tags = tagsField ? parseTags(tagsField) : [];
  const matches = {};
  const matchedFrontmatter = [];
  const coveredTerms = new Set();
  let score = 0;

  for (const field of fields) {
    const normalizedKey = field.key.toLowerCase();
    const fieldValue = normalizedKey === 'tags' ? tags : compactFieldValue(field.lines);
    const fieldMatches = matchingTerms(fieldValue, terms);
    if (fieldMatches.length === 0) {
      continue;
    }

    const weight = FIELD_WEIGHTS[normalizedKey] || FIELD_WEIGHTS.default;
    score += fieldMatches.length * weight;
    for (const term of fieldMatches) {
      coveredTerms.add(normalize(term));
    }

    if (normalizedKey === 'tags' || normalizedKey === 'description') {
      matches[normalizedKey] = fieldMatches;
    } else {
      matchedFrontmatter.push({
        field: field.key,
        terms: fieldMatches,
        value: String(fieldValue).slice(0, 240),
      });
    }
  }

  if (score === 0) {
    return null;
  }

  if (coveredTerms.size > 1) {
    score += (coveredTerms.size - 1) * COVERAGE_BONUS;
  }
  if (matchedFrontmatter.length > 0) {
    matches.frontmatter = matchedFrontmatter;
  }
  const signals = okfSignals(fields, today);

  return {
    path: toPosix(path.relative(memoryRoot, filePath)),
    scope,
    type,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    score,
    matchedTermCount: coveredTerms.size,
    matches,
    ...signals,
  };
}

function findConceptFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }
  const directoryStats = fs.lstatSync(directory);
  if (!directoryStats.isDirectory() || directoryStats.isSymbolicLink()) {
    return [];
  }

  const files = [];
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...findConceptFiles(fullPath));
    } else if (
      entry.isFile()
      && entry.name.toLowerCase().endsWith('.md')
      && !RESERVED_FILES.has(entry.name.toLowerCase())
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

function collectScopes(memoryRoot, projectId, allProjects) {
  const scopes = [{
    directory: path.join(memoryRoot, 'bundles'),
    name: 'global',
    rank: 1,
  }];
  const projectsRoot = path.join(memoryRoot, 'projects');

  if (allProjects) {
    if (fs.existsSync(projectsRoot)) {
      for (const entry of fs.readdirSync(projectsRoot, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.isSymbolicLink()) {
          continue;
        }
        const isCurrent = entry.name === projectId;
        scopes.push({
          directory: path.join(projectsRoot, entry.name),
          name: `project:${entry.name}`,
          rank: isCurrent ? 0 : 2,
        });
      }
    }
  } else {
    scopes.push({
      directory: path.join(projectsRoot, projectId),
      name: `project:${projectId}`,
      rank: 0,
    });
  }

  return scopes;
}

function queryMemory({
  memoryRoot,
  projectId,
  allProjects,
  limit,
  rawTerms,
  today = currentCalendarDate(),
}) {
  const realMemoryRoot = fs.realpathSync(memoryRoot);
  const terms = queryTerms(rawTerms);
  if (terms.length === 0) {
    throw new Error('empty_query');
  }

  const ranked = [];
  let inspected = 0;

  for (const scope of collectScopes(realMemoryRoot, projectId, allProjects)) {
    for (const filePath of findConceptFiles(scope.directory)) {
      inspected += 1;
      const result = resultForDocument({
        filePath,
        memoryRoot: realMemoryRoot,
        scope: scope.name,
        terms,
        today,
      });
      if (result) {
        ranked.push({ ...result, scopeRank: scope.rank });
      }
    }
  }

  ranked.sort((left, right) => (
    right.score - left.score
    || right.matchedTermCount - left.matchedTermCount
    || (STATUS_RANK[right.status] ?? STATUS_RANK.stable) - (STATUS_RANK[left.status] ?? STATUS_RANK.stable)
    || Number(left.stale) - Number(right.stale)
    || Number(left.verificationOutdated) - Number(right.verificationOutdated)
    || TRUST_RANK[right.trustTier] - TRUST_RANK[left.trustTier]
    || left.scopeRank - right.scopeRank
    || (left.path < right.path ? -1 : left.path > right.path ? 1 : 0)
  ));

  const count = ranked.length;
  const results = ranked.slice(0, limit).map(({ scopeRank: _scopeRank, ...result }) => result);
  return {
    query: terms.map((term) => term.original),
    memoryRoot: realMemoryRoot,
    projectId,
    scope: allProjects ? 'global+all-projects' : 'global+current-project',
    inspected,
    count,
    returned: results.length,
    truncated: results.length < count,
    results,
  };
}

function parsePositiveInteger(value, option) {
  if (!/^[1-9]\d*$/u.test(value || '')) {
    throw new Error(`invalid_${option}`);
  }
  return Number.parseInt(value, 10);
}

function parseArguments(argv) {
  const options = {
    memoryRoot: process.env.WIKI_SOUL_MEMORY_ROOT || path.join(os.homedir(), '.agents', 'memory'),
    projectId: null,
    projectRoot: null,
    allProjects: false,
    limit: DEFAULT_LIMIT,
    selfTest: false,
    help: false,
    terms: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--') {
      options.terms.push(...argv.slice(index + 1));
      break;
    }
    if (argument === '--memory-root') {
      options.memoryRoot = argv[++index];
    } else if (argument === '--project-id') {
      options.projectId = argv[++index];
    } else if (argument === '--project-root') {
      options.projectRoot = argv[++index];
    } else if (argument === '--all-projects') {
      options.allProjects = true;
    } else if (argument === '--limit') {
      options.limit = parsePositiveInteger(argv[++index], 'limit');
    } else if (argument === '--all') {
      options.limit = Number.POSITIVE_INFINITY;
    } else if (argument === '--self-test') {
      options.selfTest = true;
    } else if (argument === '--help' || argument === '-h') {
      options.help = true;
    } else if (argument.startsWith('-')) {
      throw new Error('unknown_option');
    } else {
      options.terms.push(argument);
    }
  }

  if (!options.memoryRoot) {
    throw new Error('missing_memory_root');
  }
  return options;
}

function writeConcept(filePath, frontmatter, body = '') {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `---\n${frontmatter}\n---\n${body}`, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`self_test_failed:${message}`);
  }
}

function runSelfTest() {
  const vectorOne = canonicalizeRemote('git@github.com:GoogleCloudPlatform/knowledge-catalog.git');
  const vectorTwo = canonicalizeRemote('https://github.com/GoogleCloudPlatform/knowledge-catalog/');
  assert(vectorOne === 'github.com/GoogleCloudPlatform/knowledge-catalog', 'remote_vector_one');
  assert(vectorTwo === vectorOne, 'equivalent_remote_vector');
  assert(projectIdFromCanonical(vectorOne) === 'github-com-googlecloudplatform-knowledge-catalog-27f6731e', 'remote_id_one');

  const resumeOne = canonicalizeRemote('https://gitlab.example.com/Team/R%C3%A9sum%C3%A9.git');
  const resumeTwo = canonicalizeRemote('ssh://git@gitlab.example.com/Team/Résumé');
  assert(resumeOne === 'gitlab.example.com/Team/Résumé', 'remote_vector_two');
  assert(resumeTwo === resumeOne, 'equivalent_unicode_remote');
  assert(projectIdFromCanonical(resumeOne) === 'gitlab-example-com-team-resume-95f3ccd5', 'remote_id_two');
  assert(
    projectIdFromCanonical('c:/users/alice/work/my project', 'my project') === 'my-project-d3480979',
    'windows_fallback_vector',
  );

  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wiki-soul-query-'));
  const memoryRoot = path.join(temporaryRoot, 'memory');
  const currentProjectId = 'current-project-1234abcd';
  const otherProjectId = 'other-project-8765dcba';

  try {
    const parsedOptions = parseArguments([
      '--project-id',
      currentProjectId,
      '--all-projects',
      '--limit',
      '7',
      '"signature webhook"',
    ]);
    assert(
      parsedOptions.projectId === currentProjectId
      && parsedOptions.allProjects
      && parsedOptions.limit === 7
      && queryTerms(parsedOptions.terms)[0].original === 'signature webhook',
      'cli_options_and_quoted_phrase',
    );

    fs.mkdirSync(path.join(memoryRoot, 'bundles'), { recursive: true });
    fs.writeFileSync(path.join(memoryRoot, 'bundles', 'index.md'), '# Ignored body query-only\n', 'utf8');
    writeConcept(
      path.join(memoryRoot, 'bundles', 'stripe', 'webhooks.md'),
      [
        'type: Playbook',
        'title: Stripe webhook validation',
        'description: "Validate a signature webhook before processing an event."',
        'tags: [Stripe, paiements]',
        'audience: équipe Finance',
      ].join('\n'),
      'body-only-secret-term',
    );
    writeConcept(
      path.join(memoryRoot, 'projects', currentProjectId, 'resume.md'),
      [
        'type: Preference',
        'title: Résumé du projet',
        'description: Conserver les décisions locales.',
        'tags:',
        '  - mémoire',
        '  - projet',
      ].join('\n'),
      'stripe should not match this body',
    );
    writeConcept(
      path.join(memoryRoot, 'projects', otherProjectId, 'other.md'),
      [
        'type: Reference',
        'title: Autre client',
        'description: Contexte inter-projets.',
        'tags: [transverse]',
      ].join('\n'),
    );

    const invalidBodyPath = path.join(memoryRoot, 'bundles', 'stripe', 'invalid-body.md');
    const header = Buffer.from('---\ntype: Note\ndescription: Métadonnée valide\ntags: [résumé]\n---\n', 'utf8');
    fs.writeFileSync(invalidBodyPath, Buffer.concat([header, Buffer.from([0xff, 0xfe])]));
    fs.writeFileSync(
      path.join(memoryRoot, 'bundles', 'stripe', 'invalid-frontmatter.md'),
      '---\ntype: Note\ndescription: invalid-frontmatter-term\n',
      'utf8',
    );
    writeConcept(
      path.join(memoryRoot, 'projects', currentProjectId, 'z-deterministic.md'),
      'type: Note\ntitle: deterministic-order-term',
    );
    writeConcept(
      path.join(memoryRoot, 'projects', currentProjectId, 'a-deterministic.md'),
      'type: Note\ntitle: deterministic-order-term',
    );
    writeConcept(
      path.join(memoryRoot, 'bundles', 'okf', 'human-current.md'),
      [
        'type: Reference',
        'description: okf-signal-order',
        'generated:',
        '  by: wiki-soul/0.2',
        '  at: 2026-06-20T09:00:00Z',
        'verified: { by: human:reviewer, at: 2026-06-25T09:00:00Z }',
        'stale_after: 2099-01-01',
      ].join('\n'),
    );
    writeConcept(
      path.join(memoryRoot, 'bundles', 'okf', 'machine-list.md'),
      [
        'type: Reference',
        'description: okf-signal-order',
        'status: stable',
        'generated: { by: wiki-soul/0.2, at: 2026-06-20T09:00:00Z }',
        'verified:',
        '  - { by: process:nightly, at: 2026-06-23T02:00:00Z }',
        '  - by: verifier/model-v1',
        '    at: 2026-06-24T03:00:00Z',
        'stale_after: 2099-01-01',
      ].join('\n'),
    );
    writeConcept(
      path.join(memoryRoot, 'bundles', 'okf', 'unverified.md'),
      [
        'type: Reference',
        'description: okf-signal-order',
        'stale_after: 2099-01-01',
      ].join('\n'),
    );
    writeConcept(
      path.join(memoryRoot, 'bundles', 'okf', 'human-outdated.md'),
      [
        'type: Reference',
        'description: okf-signal-order',
        'status: stable',
        'generated: { by: wiki-soul/0.2, at: 2026-07-02T09:00:00Z }',
        'verified: { by: human:reviewer, at: 2026-07-01T09:00:00Z }',
        'stale_after: 2099-01-01',
      ].join('\n'),
    );
    writeConcept(
      path.join(memoryRoot, 'bundles', 'okf', 'stale.md'),
      [
        'type: Reference',
        'description: okf-signal-order',
        'status: stable',
        'verified: { by: human:reviewer, at: 2026-06-25T09:00:00Z }',
        'stale_after: 2026-07-25',
      ].join('\n'),
    );
    writeConcept(
      path.join(memoryRoot, 'bundles', 'okf', 'deprecated.md'),
      [
        'type: Reference',
        'description: okf-signal-order',
        'status: deprecated',
        'verified: { by: human:reviewer, at: 2026-06-25T09:00:00Z }',
        'stale_after: 2099-01-01',
      ].join('\n'),
    );
    writeConcept(
      path.join(memoryRoot, 'bundles', 'okf', 'nested-source.md'),
      [
        'type: Reference',
        'description: Provenance fixture',
        'sources:',
        '  - id: nested-source',
        '    resource: https://example.test/nested-source-needle',
        '    title: Nested source needle',
        '    author: human:source-owner',
      ].join('\n'),
    );
    writeConcept(
      path.join(memoryRoot, 'bundles', 'okf-parser', 'quoted-keys.md'),
      [
        'type: Reference',
        'description: okf-parser-events',
        'generated: { "by": wiki-soul/0.2, \'at\': 2026-07-02T09:00:00Z }',
        'verified:',
        '  - "by": human:quoted-reviewer',
        "    'at': '2026-07-03T09:00:00Z'",
      ].join('\n'),
    );
    writeConcept(
      path.join(memoryRoot, 'bundles', 'okf-parser', 'missing-pairs.md'),
      [
        'type: Reference',
        'description: okf-parser-events',
        'verified:',
        '  - by: human:orphan-actor',
        '  - at: 2026-07-04T09:00:00Z',
      ].join('\n'),
    );
    writeConcept(
      path.join(memoryRoot, 'bundles', 'okf-parser', 'malformed-events.md'),
      [
        'type: Reference',
        'description: okf-parser-events',
        'verified:',
        '  - { by: human:bad-date, at: not-a-date }',
        '  - { by: "", at: 2026-07-04T09:00:00Z }',
      ].join('\n'),
    );
    writeConcept(
      path.join(memoryRoot, 'bundles', 'okf-parser', 'spoof-string.md'),
      [
        'type: Reference',
        'description: okf-parser-events',
        'verified:',
        '  - note: "spoof by: human:fake at: 2099-01-01T00:00:00Z"',
      ].join('\n'),
    );
    writeConcept(
      path.join(memoryRoot, 'bundles', 'okf-parser', 'invalid-calendar.md'),
      [
        'type: Reference',
        'description: okf-parser-events',
        'verified: { by: human:impossible-date, at: 2026-02-30T09:00:00Z }',
      ].join('\n'),
    );
    writeConcept(
      path.join(memoryRoot, 'bundles', 'okf-parser', 'generated-missing-by.md'),
      [
        'type: Reference',
        'description: okf-parser-events',
        'generated: { at: 2026-07-05T09:00:00Z }',
        'verified: { by: process:valid-check, at: 2026-07-04T09:00:00Z }',
      ].join('\n'),
    );
    writeConcept(
      path.join(memoryRoot, 'bundles', 'okf-parser', 'actor-convention.md'),
      [
        'type: Reference',
        'description: okf-parser-events',
        'verified:',
        '  - { by: process:valid-check, at: 2026-07-04T09:00:00Z }',
        '  - { by: garbage, at: 2026-07-05T09:00:00Z }',
      ].join('\n'),
    );
    writeConcept(
      path.join(memoryRoot, 'bundles', 'okf-parser', 'invalid-structure.md'),
      [
        'type: Reference',
        'description: [',
        'marker: invalid-structure-term',
      ].join('\n'),
    );

    const stripe = queryMemory({
      memoryRoot,
      projectId: currentProjectId,
      allProjects: false,
      limit: DEFAULT_LIMIT,
      rawTerms: ['stripe', 'signature webhook'],
    });
    assert(stripe.count === 1, 'ranked_count');
    assert(stripe.results[0].score === 19, 'weights_and_coverage');
    assert(stripe.results[0].path === 'bundles/stripe/webhooks.md', 'ranked_path');

    const bodyOnly = queryMemory({
      memoryRoot,
      projectId: currentProjectId,
      allProjects: false,
      limit: DEFAULT_LIMIT,
      rawTerms: ['body-only-secret-term'],
    });
    assert(bodyOnly.count === 0, 'body_not_searched');

    const accent = queryMemory({
      memoryRoot,
      projectId: currentProjectId,
      allProjects: false,
      limit: 1,
      rawTerms: ['resume'],
    });
    assert(accent.count === 2 && accent.returned === 1 && accent.truncated, 'accent_and_limit');

    const defaultScope = queryMemory({
      memoryRoot,
      projectId: currentProjectId,
      allProjects: false,
      limit: DEFAULT_LIMIT,
      rawTerms: ['inter-projets'],
    });
    assert(defaultScope.count === 0, 'default_project_scope');

    const allScope = queryMemory({
      memoryRoot,
      projectId: currentProjectId,
      allProjects: true,
      limit: DEFAULT_LIMIT,
      rawTerms: ['inter-projets'],
    });
    assert(allScope.count === 1 && allScope.results[0].scope === `project:${otherProjectId}`, 'all_project_scope');

    const unknownField = queryMemory({
      memoryRoot,
      projectId: currentProjectId,
      allProjects: false,
      limit: DEFAULT_LIMIT,
      rawTerms: ['finance'],
    });
    assert(unknownField.results[0].matches.frontmatter[0].field === 'audience', 'unknown_field_match');

    const invalidFrontmatter = queryMemory({
      memoryRoot,
      projectId: currentProjectId,
      allProjects: false,
      limit: DEFAULT_LIMIT,
      rawTerms: ['invalid-frontmatter-term'],
    });
    assert(invalidFrontmatter.count === 0, 'invalid_frontmatter');

    const deterministicLimit = queryMemory({
      memoryRoot,
      projectId: currentProjectId,
      allProjects: false,
      limit: 1,
      rawTerms: ['deterministic-order-term'],
    });
    assert(
      deterministicLimit.count === 2
      && deterministicLimit.results[0].path.endsWith('/a-deterministic.md'),
      'deterministic_limit',
    );

    const okfSignalsResult = queryMemory({
      memoryRoot,
      projectId: currentProjectId,
      allProjects: false,
      limit: DEFAULT_LIMIT,
      rawTerms: ['okf-signal-order'],
      today: '2026-07-25',
    });
    const okfByName = Object.fromEntries(
      okfSignalsResult.results.map((result) => [path.basename(result.path), result]),
    );
    assert(
      okfByName['human-current.md'].trustTier === 'human-reviewed'
      && okfByName['human-current.md'].lastVerifiedAt === '2026-06-25T09:00:00Z',
      'verified_mapping_and_human_tier',
    );
    assert(
      okfByName['machine-list.md'].trustTier === 'machine-confirmed'
      && okfByName['machine-list.md'].lastVerifiedAt === '2026-06-24T03:00:00Z',
      'verified_list_machine_tier_and_latest',
    );
    assert(
      okfByName['human-current.md'].stale === false
      && okfByName['stale.md'].stale === true,
      'stale_after_fresh_and_stale',
    );
    assert(
      okfByName['human-outdated.md'].verificationOutdated === true
      && okfByName['human-current.md'].verificationOutdated === false,
      'generated_newer_than_verification',
    );
    assert(
      okfByName['human-current.md'].status === 'stable'
      && okfByName['deprecated.md'].status === 'deprecated',
      'status_default_and_deprecated',
    );
    assert(
      okfSignalsResult.results.map((result) => path.basename(result.path)).join(',') === [
        'human-current.md',
        'machine-list.md',
        'unverified.md',
        'human-outdated.md',
        'stale.md',
        'deprecated.md',
      ].join(','),
      'okf_signal_order',
    );

    const nestedSource = queryMemory({
      memoryRoot,
      projectId: currentProjectId,
      allProjects: false,
      limit: DEFAULT_LIMIT,
      rawTerms: ['nested-source-needle'],
    });
    assert(
      nestedSource.count === 1
      && nestedSource.results[0].matches.frontmatter[0].field === 'sources',
      'nested_sources_searchable',
    );

    const parserEvents = queryMemory({
      memoryRoot,
      projectId: currentProjectId,
      allProjects: false,
      limit: DEFAULT_LIMIT,
      rawTerms: ['okf-parser-events'],
    });
    const parserByName = Object.fromEntries(
      parserEvents.results.map((result) => [path.basename(result.path), result]),
    );
    assert(
      parserByName['quoted-keys.md'].trustTier === 'human-reviewed'
      && parserByName['quoted-keys.md'].lastVerifiedAt === '2026-07-03T09:00:00Z',
      'quoted_internal_keys',
    );
    assert(
      parserByName['missing-pairs.md'].trustTier === 'unverified'
      && !('lastVerifiedAt' in parserByName['missing-pairs.md']),
      'verification_fields_must_share_event',
    );
    assert(
      parserByName['malformed-events.md'].trustTier === 'unverified'
      && !('lastVerifiedAt' in parserByName['malformed-events.md']),
      'malformed_or_empty_verification_ignored',
    );
    assert(
      parserByName['spoof-string.md'].trustTier === 'unverified'
      && !('lastVerifiedAt' in parserByName['spoof-string.md']),
      'mapping_text_does_not_spoof_event',
    );
    assert(
      parserByName['invalid-calendar.md'].trustTier === 'unverified'
      && !('lastVerifiedAt' in parserByName['invalid-calendar.md']),
      'invalid_calendar_datetime',
    );
    assert(
      parserByName['generated-missing-by.md'].trustTier === 'machine-confirmed'
      && parserByName['generated-missing-by.md'].verificationOutdated === false,
      'generated_requires_actor_and_datetime',
    );
    assert(
      parserByName['actor-convention.md'].trustTier === 'machine-confirmed'
      && parserByName['actor-convention.md'].lastVerifiedAt === '2026-07-04T09:00:00Z',
      'actor_convention_rejects_garbage',
    );

    const invalidStructure = queryMemory({
      memoryRoot,
      projectId: currentProjectId,
      allProjects: false,
      limit: DEFAULT_LIMIT,
      rawTerms: ['invalid-structure-term'],
    });
    assert(invalidStructure.count === 0, 'invalid_frontmatter_structure');

    const symlinkPath = path.join(memoryRoot, 'bundles', 'escape');
    try {
      fs.symlinkSync(temporaryRoot, symlinkPath, 'dir');
      const symlinkQuery = queryMemory({
        memoryRoot,
        projectId: currentProjectId,
        allProjects: false,
        limit: DEFAULT_LIMIT,
        rawTerms: ['query-only'],
      });
      assert(symlinkQuery.count === 0, 'symlink_exclusion');
    } catch (error) {
      if (!['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) {
        throw error;
      }
    }
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }

  return { ok: true, tests: 34 };
}

function helpText() {
  return [
    'Usage: query-memory.mjs [options] <term...>',
    '',
    'Options:',
    '  --memory-root <path>  Wiki Soul memory root',
    '  --project-id <id>     Resolved Wiki Soul project ID',
    '  --project-root <path> Derive identity from this project root',
    '  --all-projects        Include every project bundle',
    '  --limit <count>       Maximum results (default: 20)',
    '  --all                 Return all matches',
    '  --self-test           Run isolated built-in tests',
    '  --help                Show this help',
  ].join('\n');
}

function errorPayload(error) {
  return {
    error: error instanceof Error ? error.message : 'unknown_error',
    results: [],
  };
}

function main() {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
      process.stdout.write(`${helpText()}\n`);
      return;
    }
    if (options.selfTest) {
      process.stdout.write(`${JSON.stringify(runSelfTest(), null, 2)}\n`);
      return;
    }

    const memoryRoot = path.resolve(options.memoryRoot);
    if (!fs.existsSync(memoryRoot) || !fs.statSync(memoryRoot).isDirectory()) {
      throw new Error('memory_root_not_found');
    }
    const projectId = validateProjectId(options.projectId || deriveProjectId(options.projectRoot));
    const output = queryMemory({
      memoryRoot,
      projectId,
      allProjects: options.allProjects,
      limit: options.limit,
      rawTerms: options.terms,
    });
    process.stdout.write(`${JSON.stringify(output)}\n`);
  } catch (error) {
    process.stderr.write(`${JSON.stringify(errorPayload(error))}\n`);
    process.exitCode = 1;
  }
}

main();
