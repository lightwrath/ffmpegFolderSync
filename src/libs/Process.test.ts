import { describe, it, expect } from "bun:test";
import Process from "./Process.ts"; 

describe("Process", () => {
    it('should be able to run a process', async () => {
       const process = new Process(["echo", "hello"])
        expect(await process.getOutput()).toBe("hello\n")
    });
    
    it('should be able to detect if the process returned an error', async () => {
        const successProcess = new Process(["ls"])
        expect(await successProcess.hasError()).toBeFalse()
        const errorProcess = new Process(["ls", "err"])
        expect(await errorProcess.hasError()).toBeTrue()
    });

    it('should not allow spaces within command segments', () => {
        try {
            new Process(["echo hello"])
            expect(true).toBeFalse()
        } catch (err) {
            expect(err).toBeInstanceOf(Error);
        }
    });
})
