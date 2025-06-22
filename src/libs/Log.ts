const logFile = import.meta.dir + "/log.txt"
console.log("Logging to: ", logFile)

export default class Log {
    private static date() {
        return new Date().toISOString()
    }

    private static async out(message: string) {
        await Bun.write(logFile, message)
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