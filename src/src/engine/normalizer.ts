import type {
  RawSignal,
  NormalizedSignal,
  SignalIndicators,
} from '../types';

export function normalizeSignal(raw: RawSignal): NormalizedSignal {
  const indicators: SignalIndicators = {};

  switch (raw.source) {
    case 'email':
      indicators.emailSender = raw.sender;
      indicators.user = raw.recipient;
      indicators.domain = raw.domain;
      break;
    case 'url':
      indicators.url = raw.url;
      indicators.domain = raw.domain;
      if (raw.ip) indicators.ip = raw.ip;
      if (raw.user) indicators.user = raw.user;
      if (raw.device) indicators.device = raw.device;
      break;
    case 'auth':
      indicators.user = raw.user;
      indicators.ip = raw.ip;
      if (raw.device) indicators.device = raw.device;
      break;
    case 'endpoint':
      indicators.device = raw.device;
      if (raw.user) indicators.user = raw.user;
      break;
    case 'threat-intel':
      if (raw.ip) indicators.ip = raw.ip;
      if (raw.domain) indicators.domain = raw.domain;
      if (raw.hash) indicators.hash = raw.hash;
      break;
  }

  return {
    id: raw.id,
    timestamp: raw.timestamp,
    source: raw.source,
    severity: raw.severity,
    title: raw.title,
    description: raw.description,
    indicators,
    raw,
  };
}

export function normalizeAll(raws: RawSignal[]): NormalizedSignal[] {
  return raws.map(normalizeSignal);
}
