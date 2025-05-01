import Process from "./Process.ts";
import Config from "./Config.ts";

export default class Conversion {
    private sourceFile: string;
    private targetFile: string;

    constructor(sourceFile: string, targetFile: string) {
        this.sourceFile = sourceFile;
        this.targetFile = targetFile;
    }

    private getFfmpeg() {
        if (Config.get().ffmpegPath) return`${Config.get().ffmpegPath}/ffmpeg`
        return "ffmpeg"
    }

    public async execute() {
        const commandSegments: Array<string> = [];

        commandSegments.push(this.getFfmpeg())
        commandSegments.push("-i")
        commandSegments.push(this.sourceFile)

        commandSegments.push("-c:v");
        commandSegments.push("libsvtav1");

        commandSegments.push("-c:a")
        commandSegments.push("copy")

        commandSegments.push("-c:s")
        commandSegments.push("copy")

        commandSegments.push("-map")
        commandSegments.push("0")

        commandSegments.push("-pix_fmt")
        commandSegments.push("yuv444p101e")

        commandSegments.push("-preset")
        commandSegments.push("4")

        commandSegments.push("-crf")
        commandSegments.push("16")

        commandSegments.push(this.targetFile)

        const process = new Process(commandSegments);
        return process.awaitExit()
    }

    public async isValid() {
        const process = new Process([this.getFfmpeg(), "-v", "error", "-i", this.sourceFile, "-f", "null", "-"]);
        const errorResult = await process.hasError()
        return !errorResult;
    }
}