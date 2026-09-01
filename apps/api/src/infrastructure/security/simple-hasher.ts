import { createHash } from 'crypto';
import { IPasswordHasher } from '../../core/application/ports/password-hasher.port';

export class SimplePasswordHasher implements IPasswordHasher {
  async hash(plainText: string): Promise<string> {
    const salt = 'alaska_local_salt_v1';
    return createHash('sha256').update(`${plainText}:${salt}`).digest('hex');
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    const computed = await this.hash(plainText);
    return computed === hash;
  }
}
