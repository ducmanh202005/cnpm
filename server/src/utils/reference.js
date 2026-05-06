import crypto from 'node:crypto';

export const createReference = (prefix = 'REF') =>
  `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
