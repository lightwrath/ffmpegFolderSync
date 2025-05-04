import FileSystem from "./FileSystem.ts";
import Queue from "./Queue.ts";
import Conversion from "./Conversion.ts";
import Config from "./Config.ts";

export default class Controller {
    public static queue = new Queue();
    public static failureList = new Queue();
    public static processingQueue = false

    public static async load(loadParams: ILoadParams) {
        const loadSettings = Config.syncLocationQuery({ name: loadParams.configSyncLocationName });
        const { source, target, deleteSource } = loadSettings;
        const fileList = await FileSystem.resolveLocationToFileList(source, target);
        fileList.forEach(file => this.queue.add(file.source, file.target, deleteSource))
        this.printQueue()
    }

    public static async start() {
        this.processingQueue = true
        while (this.processingQueue) {
            const next = this.queue.getNext()
            const conversion = new Conversion(next.source, next.target)
            try {
                if (!(await conversion.isValid())) throw new Error("Source file seems to be invalid.")
                const targetFolder = next.target.split("/")
                targetFolder.pop()
                await FileSystem.ensureFolder(targetFolder.join("/"))
                await conversion.execute()
                if (next.deleteSource) await FileSystem.delete(next.source)
                this.queue.handleNext()
            } catch (error) {
                console.log(error)
                this.failureList.add(this.queue.getNext().source, this.queue.handleNext().target)
            }
        }
    }

    public static stop() {
        this.processingQueue = false
    }

    public static repositionInQueue(fromIndex: number, toIndex: number) {
        this.queue.reposition(fromIndex, toIndex)
    }

    public static printQueue() {
        this.queue.toHumanReadable().forEach(line => console.log(line))
    }
}

interface ILoadParams {
    configSyncLocationName: string;
    source?: string;
    target?: string;
    deleteSource?: boolean;
}