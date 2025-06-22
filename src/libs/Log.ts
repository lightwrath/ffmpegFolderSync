export default class Log {
    private static date() {
        return new Date().toISOString()
    }

    private static async out(message: string) {
        await Bun.write("log", message)
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