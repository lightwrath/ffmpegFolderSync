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
        interface ITableFormat {
            location: string;
            source: string;
            target: string;
            deleteSource: boolean;
        }
        const printQueue: Array<ITableFormat> = this.queue.get().map(entry => {
            const sourceArray = entry.source.split("/")
            const targetArray = entry.target.split("/")
            let locationArray = []
            for (let i = 0; i < sourceArray.length; i++) {
               if (sourceArray[i] === targetArray[i]) {
                   locationArray.push(sourceArray[i])
               } else {
                   break;
               }
            }
            const location = locationArray.join("/")
            return {
                location,
                source: entry.source.replace(location, ""),
                target: entry.target.replace(location, ""),
                deleteSource: entry.deleteSource
            }
        })
        let previousLocation = ""
        printQueue.forEach((printLine, index) => {
            if (printLine.location !== previousLocation) {
                console.log(`${printLine.location}:`)
                previousLocation = printLine.location
            }
            // Limit the length to a total 120
            const printIndex = index.toString().padStart(4, "0") + ":"
            const printSource = printLine.source.substring(0, 49)
            const printTarget = printLine.source.substring(0, 49)
            console.log(printIndex, printSource, "=>", printTarget, "-", printLine.deleteSource)
        })
    }
}
