import Process from "./Process.ts";
import Config from "./Config.ts";

export default class Conversion {
    private sourceFile: string;
    private targetFile: string;
    private videoCodec?: string;
    
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
        
        if (this.videoCodec) commandSegments.push("-c:v " + this.videoCodec);
        else commandSegments.push("-c:v copy");
        
        commandSegments.push("-c:a copy")
        commandSegments.push("-c:s copy")
        commandSegments.push("-map 0")
        commandSegments.push("-pix_fmt yuv444p101e")
        commandSegments.push("-preset 4")
        commandSegments.push("-crf 16")
        
        commandSegments.push(this.targetFile)
        
        const process = new Process(commandSegments);
        return process.awaitExit()
    }
    
    public async validate() {
        const process = new Process([this.getFfmpeg(), "-i", this.sourceFile, this.targetFile]);
        return process.hasError()
    }
}