const logFilePath = import.meta.dir + "/log.txt"
console.log("Logging to: ", logFilePath)

export default class Log {
    private static date() {
        return new Date().toISOString()
    }

    private static async out(message: string) {
        try {
            const logs = await Bun.file(logFilePath).text();
            await Bun.write(logFilePath, logs.concat(message));
        } catch (_) {
            await Bun.write(logFilePath, message);
        }
    }

    public static info(message: string): void {
        const errorMeesage = [this.date(), "info", message].join(" - ")
        this.out(errorMeesage)
    }

    public static error(message: string): void {
        const errorMeesage = [this.date(), "error", message].join(" - ")
        this.out(errorMeesage)
    }
}