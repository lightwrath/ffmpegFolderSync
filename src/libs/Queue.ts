
export default class Queue {
    private list: Array<IEntry> = [];

    public getNext(){
        const nextItem = this.list[0]
        if (nextItem === undefined) throw new Error("Attempting to get next when queue is empty")
        return nextItem
    }

    public handleNext() {
        const nextItem = this.list.shift()
        if (nextItem === undefined) throw new Error("Attempting to handle next when queue is empty")
        return nextItem
    }

   public isQueued(source: string, target: string) {
       return this.list.some(entry => entry.source === source && entry.target === target)
   }

    public add(source: string, target: string, deleteSource = false) {
        if (this.isQueued(source, target)) throw new Error("Cannot add duplicate entry")
        this.list.push({ source, target, deleteSource})
    }

    public empty() {
        this.list = []
    }

    public length() {
        return this.list.length;
    }

    public reposition(fromIndex: number, toIndex: number) {
        if (fromIndex >= this.list.length || toIndex >= this.list.length || fromIndex < 0 || toIndex < 0) throw new Error(
            `Cannot reposition from index ${fromIndex} to index ${toIndex} as the index is out of bounds`
        )
        const entry = this.list.splice(fromIndex, 1)[0]
        if (entry) this.list.splice(toIndex, 0, entry)
    }

    public toHumanReadable() {
        interface ITableFormat {
            location: string;
            source: string;
            target: string;
            deleteSource: boolean;
        }
        const table: Array<ITableFormat> = this.list.map(entry => {
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
        const readableList: Array<string> = []
        table.forEach((printLine, index) => {
            if (printLine.location !== previousLocation) {
                readableList.push(`${printLine.location}:`)
                previousLocation = printLine.location
            }
            // Limit the length to a total 120
            const printIndex = index.toString().padStart(4, "0")
            const printSource = printLine.source.substring(0, 49)
            const printTarget = printLine.source.substring(0, 49)
            readableList.push(`${printIndex}: ${printSource} => ${printTarget} - ${printLine.deleteSource}`)
        })
        return readableList;
    }
}

interface IEntry {
    deleteSource: boolean
    source: string;
    target: string;
}