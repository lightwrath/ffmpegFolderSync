import { appendFile } from "node:fs/promises"
const logFilePath = import.meta.dir + "/log.txt"
console.log("Logging to: ", logFilePath)

export default class Log {
    private static date() {
        return new Date().toISOString()
    }

    private static async out(message: string) {
        try {
            await appendFile(logFilePath, message)
        } catch (_) {
            await Bun.write(logFilePath, message);
        }
    }

    public static info(message: string): void {
        const errorMeesage = [this.date(), "info", message].join(" - ") + "\n\r"
        this.out(errorMeesage)
    }

    public static error(message: string): void {
        const errorMeesage = [this.date(), "error", message].join(" - ") + "\n\r"
        this.out(errorMeesage)
    }
}