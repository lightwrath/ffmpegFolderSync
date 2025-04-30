
export default class Queue {
    private list: Array<IEntry> = [];
    
    public get() {
        return structuredClone(this.list)
    }
    
    public isNext() {
        return this.list.length > 0
    }
    
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
    
    public add(source: string, target: string) {
        if (this.isQueued(source, target)) throw new Error("Cannot add duplicate entry")
        this.list.push({ source, target })
    }
    
    public empty() {
        this.list = []
    }
    
    public length() {
        return this.list.length;
    }
}

interface IEntry {
    source: string;
    target: string;
}