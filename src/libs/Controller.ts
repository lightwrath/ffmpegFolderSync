import FileSystem from "./FileSystem.ts";
import Queue from "./Queue.ts";
import Conversion from "./Conversion.ts";
import Log from "./Log.ts";
import Config from "./Config.ts";

export default class Controller {
    public static queue = new Queue();
    public static processingQueue = false

    public static async load(loadParams: ILoadParams) {
        const loadSettings = Config.syncLocationQuery({ name: loadParams.configSyncLocationName });
        const { source, target, deleteSource } = loadSettings;
        const fileList = await FileSystem.resolveLocationToFileList(source, target);
        fileList.forEach(file => {
            try {
                this.queue.add(file.source, file.target, deleteSource)
            } catch (error) {
                return Log.error("Failed to load " + file.source);
            }
        })
        this.printQueue()
    }

    public static async queueAdd(source: string, target: string, deleteSource = false) {
        const fileList = await FileSystem.resolveLocationToFileList(source, target);
        fileList.forEach(file => this.queue.add(file.source, file.target, deleteSource))
        this.printQueue()
    }

    public static async start() {
        this.processingQueue = true
        while (this.processingQueue) {
            const current = this.queue.next()
            const conversion = new Conversion(current.source, current.target)
            try {
                if (!(await conversion.isValid())) return new Error("Source file seems to be invalid: " + current.source)
                const targetFolder = current.target.split("/")
                targetFolder.pop()
                await FileSystem.ensureFolder(targetFolder.join("/"))
                if (await FileSystem.ensureFile(current.target)) await FileSystem.delete(current.target)
                await conversion.execute()
                if (current.deleteSource) await FileSystem.delete(current.source)
                this.queue.setDone(current.id)
            } catch (error) {
                Log.error("Conversion failed: " + error)
                this.queue.setError(current.id);
            }
        }
    }

    public static stop() {
        this.processingQueue = false
    }

    public static repositionInQueue(fromIndex: number, toIndex: number) {
        this.queue.reposition(fromIndex, toIndex)
    }

    public static printQueue(raw = false) {
        if (raw) {
            return console.log(this.queue.list())
        }
        this.queue.toHumanReadable().forEach(line => console.log(line))
    }
}

interface ILoadParams {
    configSyncLocationName: string;
    source?: string;
    target?: string;
    deleteSource?: boolean;
}