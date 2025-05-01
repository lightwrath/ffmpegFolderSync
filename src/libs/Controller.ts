import FileSystem from "./FileSystem.ts";
import Queue from "./Queue.ts";
import Conversion from "./Conversion.ts";
import Config from "./Config.ts";

export default class Controller {
    public static queue = new Queue();
    public static failureList = new Queue();
    public static processingQueue = false

    public static async load(syncLocation: string) {
        const loadSettings = Config.get().syncLocations.find(location => location.name === syncLocation);
        if (!loadSettings) throw new Error("Is not a valid sync location!");
        const { source, target, deleteSource } = loadSettings;
        const pathType = await FileSystem.type(source)
        if (pathType === "directory") {
            const files = await FileSystem.lsFilesRecursive(source)
            files.forEach(file => {
                this.queue.add(file, FileSystem.pathSourceToTarget(source, target, file), deleteSource)
            });
        } else if (pathType === "file") {
            this.queue.add(source, target);
        } else {
            console.error("Can't add to queue", source, target);
        }
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

    public static printQueue() {
        console.table(this.queue.get())
    }
}
