// src/shared/services/logger.ts

export class Logger {
  static info(message: string, context?: any) {
    const timestamp = new Date().toISOString();
    // In production SaaS, this logs to telemetry APIs like Datadog/Sentry
    const ctxString = context ? ` | Context: ${JSON.stringify(context)}` : "";
    console.info(`[INFO] [${timestamp}] ${message}${ctxString}`);
  }

  static warn(message: string, context?: any) {
    const timestamp = new Date().toISOString();
    const ctxString = context ? ` | Context: ${JSON.stringify(context)}` : "";
    console.warn(`[WARN] [${timestamp}] ${message}${ctxString}`);
  }

  static error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    const errString = error
      ? ` | Error: ${error.message || String(error)}${error.stack ? `\nStack: ${error.stack}` : ""}`
      : "";
    console.error(`[ERROR] [${timestamp}] ${message}${errString}`);
  }

  static metric(name: string, value: number, tags?: Record<string, string>) {
    const timestamp = new Date().toISOString();
    const tagsString = tags ? ` | Tags: ${JSON.stringify(tags)}` : "";
    // Performance and API timing telemetry log
    console.log(`[METRIC] [${timestamp}] ${name}: ${value}ms${tagsString}`);
  }
}
export default Logger;
