import { describe, it, expect } from 'vitest';
import { parseHandle } from '../src/services/mastodonApi';

describe('parseHandle', () => {
  it('parses a standard handle', () => {
    expect(parseHandle('user@mastodon.social')).toEqual({
      username: 'user',
      instance: 'mastodon.social',
    });
  });

  it('strips leading @ sign', () => {
    expect(parseHandle('@user@mastodon.social')).toEqual({
      username: 'user',
      instance: 'mastodon.social',
    });
  });

  it('lowercases the instance', () => {
    const result = parseHandle('user@Mastodon.Social');
    expect(result.instance).toBe('mastodon.social');
  });

  it('returns null for missing @ separator', () => {
    expect(parseHandle('user')).toBeNull();
  });

  it('returns null for empty username', () => {
    expect(parseHandle('@mastodon.social')).toBeNull();
  });

  it('returns null for empty instance', () => {
    expect(parseHandle('user@')).toBeNull();
  });

  // SSRF: IPv4
  it('rejects IPv4 addresses', () => {
    expect(() => parseHandle('user@192.168.1.1')).toThrow(
      'IP addresses are not allowed'
    );
  });

  it('rejects IPv4 with port', () => {
    expect(() => parseHandle('user@10.0.0.1:8080')).toThrow(
      'IP addresses are not allowed'
    );
  });

  // SSRF: IPv6
  it('rejects IPv6 addresses', () => {
    expect(() => parseHandle('user@::1')).toThrow(
      'IPv6 addresses are not allowed'
    );
  });

  // SSRF: localhost and private hosts
  it('rejects localhost', () => {
    expect(() => parseHandle('user@localhost')).toThrow(
      'Localhost is not allowed'
    );
  });

  it('rejects 127.0.0.1', () => {
    expect(() => parseHandle('user@127.0.0.1')).toThrow();
  });

  it('rejects 0.0.0.0', () => {
    expect(() => parseHandle('user@0.0.0.0')).toThrow();
  });

  // SSRF: domain format
  it('rejects domains without a dot', () => {
    expect(() => parseHandle('user@intranet')).toThrow(
      'Invalid domain format'
    );
  });

  it('rejects domains starting with a dot', () => {
    expect(() => parseHandle('user@.evil.com')).toThrow(
      'Invalid domain format'
    );
  });

  // SSRF: domain length
  it('rejects excessively long domains', () => {
    const longDomain = 'a'.repeat(250) + '.com';
    expect(() => parseHandle(`user@${longDomain}`)).toThrow(
      'Domain name too long'
    );
  });

  // SSRF: port restriction
  it('allows port 443', () => {
    expect(parseHandle('user@mastodon.social:443')).toEqual({
      username: 'user',
      instance: 'mastodon.social:443',
    });
  });

  it('rejects non-standard ports', () => {
    expect(() => parseHandle('user@mastodon.social:8080')).toThrow(
      'Non-standard ports are not allowed'
    );
  });

  // SSRF: character validation
  it('rejects special characters in domain', () => {
    expect(() => parseHandle('user@evil<script>.com')).toThrow(
      'Invalid characters in domain'
    );
  });

  it('allows hyphens in domain', () => {
    expect(parseHandle('user@my-instance.social')).toEqual({
      username: 'user',
      instance: 'my-instance.social',
    });
  });
});
