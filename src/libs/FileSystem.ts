import { readdir, mkdir } from "node:fs/promises"

export default class FileSystem {
    public static async type(path: string) {
        let error: unknown | null = null
        try {
            await readdir(path)
            return "directory"
        } catch (e) {
            error = e
        }
        const file = Bun.file(path)
        if (await file.exists()) {
            return "file"
        }
        console.error(error)
        return "unknown"
    }

    public static async ensureFolder(path: string) {
        try {
            await readdir(path)
        } catch (e) {
            await mkdir(path, { recursive: true })
        }
    }

    public static async ensureFile(path: string) {
        const file = Bun.file(path)
        return await file.exists();
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

    public static async delete(path: string) {
        const file = Bun.file(path)
        await file.delete()
    }

    public static async resolveLocationToFileList(source: string, target: string) {
        const pathType = await FileSystem.type(source)
        if (pathType === "directory") {
            const files = await FileSystem.lsFilesRecursive(source)
            return files.map(file => {
                return {
                    source: file,
                    target: FileSystem.pathSourceToTarget(source, target, file)
                }
            })
        } else if (pathType === "file") {
            return [{ source, target }]
        } else {
            throw new Error(`Given source path ${source} or the target path could not be resolved ${target}`)
        }
    }
}
