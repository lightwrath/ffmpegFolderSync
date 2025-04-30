import { describe, it, expect } from "bun:test";
import FileSystem from "./FileSystem.ts";

describe("FileSystem", () => {
    it('should create a target path based on source path and provided target', () => {
        const filePath = "/Vault/Media/legacy/tv/Curb Your Enthusiasm/Season 01/Episode Name S01E01.mkv"
        const source = "/Vault/Media/legacy/tv"
        const target = "/Vault/Media/tv"
        const result = FileSystem.pathSourceToTarget(source, target, filePath)
        expect(result).toBe("/Vault/Media/tv/Curb Your Enthusiasm/Season 01/Episode Name S01E01.mkv");
    });
})
