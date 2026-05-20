// Domain value object - represents a parsed Telegram command

export class TelegramCommand {
  readonly command: string;
  readonly args: string;

  private constructor(command: string, args: string) {
    this.command = command;
    this.args = args;
  }

  static parse(text: string | null | undefined): TelegramCommand | null {
    if (!text || !text.startsWith('/')) {
      return null;
    }

    const parts = text.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ').trim();

    return new TelegramCommand(command, args);
  }

  isKnown(): boolean {
    return ['/start', '/help', '/status'].includes(this.command);
  }
}
