import { readdir } from "node:fs/promises"

export default class FileSystem {
    public static async type(path: string) {
        console.log(path);
        try {
            await readdir(path)
            return "directory"
        } catch (e) {
            console.error(e)
        }
        const file = Bun.file(path)
        if (await file.exists()) {
            return "file"
        }
        return "unknown"
    }

    public static async ls(path: string) {
        if (await this.type(path) !== "directory") throw new Error("path must be a directory")
        return readdir(path)
    }

    public static async lsFilesRecursive(path: string) {
        let files: Array<string> = []
        if (await this.type(path) === "directory") {
            for (const subLevel of await this.ls(path)) {
                files = [...files, ...(await this.lsFilesRecursive(`${path}/${subLevel}`))]
            }
        }
        if (await this.type(path) === "file") {
            return [path]
        }
        return files
    }

    public static pathSourceToTarget(source: string, target: string, filePath: string) {
        return filePath.replace(source, target);
    }
}
