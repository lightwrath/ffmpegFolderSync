import Log from "./Log.ts";

export default class Process {
    private subprocess: Bun.Subprocess

    constructor(cmd: Array<string>) {
        Log.info("Process started with: " + cmd.join(" "))
        this.subprocess = Bun.spawn({ cmd, stderr: "pipe" })
        this.logStdout().catch((err) => Log.error(err)).finally(() => Log.info("Process stdout closed"))
        this.logStderr().catch((err) => Log.error(err)).finally(() => Log.info("Process stderr closed"))
    }

    private async logStdout() {
        if (!this.subprocess.stdout || typeof this.subprocess.stdout == "number" ) return Log.error("No stdout stream for process")
        for await (const stdout of this.subprocess.stdout) {
            Log.info(new TextDecoder().decode(stdout));
        }
    }

    private async logStderr() {
        if (!this.subprocess.stderr || typeof this.subprocess.stderr == "number" ) return Log.error("No stderr stream for process")
        for await (const stderr of this.subprocess.stderr) {
            Log.info(new TextDecoder().decode(stderr));
        }
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