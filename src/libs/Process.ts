import Log from "./Log.ts";

export default class Process {
    private subprocess: Bun.Subprocess
    private stdoutCache: string = ""
    private stderrCache: string = ""

    constructor(cmd: Array<string>) {
        Log.info("Process started with: " + cmd.join(" "))
        this.subprocess = Bun.spawn({ cmd, stderr: "pipe" })
        this.logStdout().catch((err) => Log.error(err)).finally(() => Log.info("Process stdout closed"))
        this.logStderr().catch((err) => Log.error(err)).finally(() => Log.info("Process stderr closed"))
    }

    private async logStdout() {
        if (!this.subprocess.stdout || typeof this.subprocess.stdout == "number" ) return Log.error("No stdout stream for process")
        for await (const stdout of this.subprocess.stdout) {
            const text = new TextDecoder().decode(stdout);
            this.stdoutCache += text
            Log.info(text);
        }
    }

    private async logStderr() {
        if (!this.subprocess.stderr || typeof this.subprocess.stderr == "number" ) return Log.error("No stderr stream for process")
        for await (const stderr of this.subprocess.stderr) {
            const text = new TextDecoder().decode(stderr);
            this.stderrCache += text
            Log.info(text);
        }
    }

    public awaitExit() {
        return this.subprocess.exited
    }

    public async hasError() {
        await this.subprocess.exited
        Log.info("Process stderr: " + this.stderrCache)
        return this.stderrCache.length > 0;
    }

    public async getOutput() {
        await this.subprocess.exited
        Log.info("Process stdout: " + this.stdoutCache)
        return this.stdoutCache
    }
}