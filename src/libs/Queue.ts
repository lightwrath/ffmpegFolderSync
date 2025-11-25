
export default class Queue {
    private queue: Array<IEntry> = [];

    public list() {
        return structuredClone(this.queue)
    }

    public next(){
        const nextEntry = this.queue.find(entry => entry.status === "pending")
        if (nextEntry === undefined) throw new Error("Attempting to get next when queue is empty")
        return nextEntry
    }

    public setDone(id: string) {
        const entry = this.queue.find(entry => entry.id === id)
        if (entry === undefined) throw new Error("Attempting to mark an entry as complete that does not exist")
        entry.status = "done"
        return entry
    }

    public setError(id: string) {
        const entry = this.queue.find(entry => entry.id === id)
        if (entry === undefined) throw new Error("Attempting to mark an entry as error that does not exist")
        entry.status = "error"
        return entry
    }

   public isPresent(source: string, target: string) {
       return this.queue.some(entry => entry.source === source && entry.target === target)
   }

    public add(source: string, target: string, deleteSource = false) {
        if (this.isPresent(source, target)) throw new Error("Cannot add duplicate entry")
        this.queue.push({ id: crypto.randomUUID(), source, target, deleteSource, status: "pending" })
    }

    public empty() {
        this.queue = []
    }

    public length() {
        return this.queue.length;
    }

    public reposition(fromIndex: number, toIndex: number) {
        if (fromIndex >= this.queue.length || toIndex >= this.queue.length || fromIndex < 0 || toIndex < 0) throw new Error(
            `Cannot reposition from index ${fromIndex} to index ${toIndex} as the index is out of bounds`
        )
        const entry = this.queue.splice(fromIndex, 1)[0]
        if (entry) this.queue.splice(toIndex, 0, entry)
    }

    public toHumanReadable() {
        interface ITableFormat {
            location: string;
            source: string;
            target: string;
            deleteSource: boolean;
            status: IEntry['status']
        }
        const table: Array<ITableFormat> = this.queue.map(entry => {
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
                deleteSource: entry.deleteSource,
                status: entry.status
            }
        })
        let previousLocation = ""
        const readableList: Array<string> = []
        table.forEach((printLine, index) => {
            if (printLine.location !== previousLocation) {
                readableList.push(`${printLine.location}:`)
                previousLocation = printLine.location
            }
            // Limit the length to a total 120
            const printIndex = index.toString().padStart(4, "0")
            const printSource = printLine.source.substring(0, 49)
            const printTarget = printLine.target.substring(0, 49)
            readableList.push(`${printIndex}: ${printSource} => ${printTarget} - ${printLine.deleteSource} - ${printLine.status}`)
        })
        return readableList;
    }
}

interface IEntry {
    id: string;
    deleteSource: boolean
    source: string;
    target: string;
    status: "pending" | "done" | "error";
}