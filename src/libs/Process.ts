import Log from "./Log.ts";

export default class Process {
    private subprocess: Bun.Subprocess

    constructor(cmd: Array<string>) {
        Log.info("Process started with: " + cmd.join(" "))
        this.subprocess = Bun.spawn({ cmd, stderr: "pipe" })
    }

    public awaitExit() {
        return this.subprocess.exited
    }

    public async hasError() {
        await this.subprocess.exited
        if (this.subprocess.stderr instanceof ReadableStream) {
            const stderr = await Bun.readableStreamToText(this.subprocess.stderr)
            Log.info("Process stderr: " + stderr)
            if (stderr.length > 0) return true
        }
        return false;
    }

    public async getOutput() {
        await this.subprocess.exited
        if (this.subprocess.stdout instanceof ReadableStream) {
            const stdout = Bun.readableStreamToText(this.subprocess.stdout)
            Log.info("Process stdout: " + stdout)
            return stdout;
        }

    }
}