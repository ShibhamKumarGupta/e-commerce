import bcrypt from 'bcryptjs';

export class EncryptionHelper {
  static async hashPassword(password: string, saltRounds: number = 10): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async generateSalt(rounds: number = 10): Promise<string> {
    return bcrypt.genSalt(rounds);
  }
}
