export class ConsoleLogger {
  static formatBrowser(tag, color, msg, args) {
    const style = `color: ${color}; font-weight: bold; background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px;`;
    if (args && args.length > 0) {
      console.log(`%c[${tag}]`, style, msg, ...args);
    } else {
      console.log(`%c[${tag}]`, style, msg);
    }
  }

  static physics(msg, ...args) {
    ConsoleLogger.formatBrowser('PHYSICS', '#3B82F6', msg, args); // Blue
  }

  static audio(msg, ...args) {
    ConsoleLogger.formatBrowser('AUDIO', '#22C55E', msg, args); // Green
  }

  static game(msg, ...args) {
    ConsoleLogger.formatBrowser('GAME', '#EAB308', msg, args); // Yellow
  }

  static error(msg, ...args) {
    ConsoleLogger.formatBrowser('ERROR', '#EF4444', msg, args); // Red
  }

  static data(msg, ...args) {
    ConsoleLogger.formatBrowser('DATA', '#A855F7', msg, args); // Purple
  }
}

export const logger = ConsoleLogger;
