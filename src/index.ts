import Controller from "./libs/Controller.ts";

async function getStdin() {
    for await (const line of console) {
        if (line) {
            return line
        }
    }
    return ""
}

async function prompt(stdout: string) {
    console.write(stdout)
    return getStdin()
}

async function terminalInterface() {
    const mainCommand = await prompt(
        "Available commands:\n" +
        "load - load from config\n" +
        "queue - queue options\n" +
        "start - start processing\n" +
        "stop - stop processing"
    )
    if (mainCommand === "load") {
        const loadCommand = await prompt("Sync location name: ")
        if (!loadCommand) return console.error("Load command requires a sync location name")
        return Controller.load({ configSyncLocationName: loadCommand });
    }
    if (mainCommand === "queue") {
        const queueCommand = await prompt(
            "Available options:\n" +
            "print - list current queue\n" +
            "add - add conversion to queue\n" +
            "clear - clear queue"
        )
        if (queueCommand === "print") {
            return Controller.printQueue()
        }
        if (queueCommand === "add") {
            const source = await prompt("Source path: ")
            const target = await prompt("Target path: ")
            const deleteSource = await prompt("Delete source file? (y/n): ")
            return Controller.queue.add(source, target, deleteSource === "y")
        }
        if (queueCommand === "position") {
            const from = await prompt("Provide index to move from: ")
            const to = await prompt("Provide index to move to: ")
            return Controller.repositionInQueue(parseInt(from, 10), parseInt(to, 10))
        }
        if (queueCommand === "clear") {
            return Controller.queue.empty()
        }
    }
    if (mainCommand === "start") {
        return Controller.start();
    }
    if (mainCommand === "stop") {
        return Controller.stop()
    }
}

while (true) {
    try {
        await terminalInterface()
    } catch (error) {
        console.error(error)
    }
}