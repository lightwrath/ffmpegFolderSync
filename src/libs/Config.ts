import config from "../config.json"

class Config {
   private current: IConfig = config as IConfig
    
    constructor() {
       this.verify()
    }
    
    public get() {
       return structuredClone(this.current)
    }
    
    public verify() {
        if (!this.current.syncLocations) throw new Error("Config: syncLocations array is required")
        this.current.syncLocations.forEach(location => {
            if (!location.name) throw new Error("Config: syncLocations: name string is required")
            if (!location.source) throw new Error("Config: syncLocations: source string is required")
            if (!location.target) throw new Error("Config: syncLocations: target string is required")
        })
    }
}

interface IConfig {
    ffmpegPath?: string;
    syncLocations: Array<ISyncLocation>;
}
interface ISyncLocation {
    name: string;
    source: string;
    target: string;
}

export default new Config()