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
        "Available commands: load - load from config, queue - queue options, start - start processing, stop - stop processing: "
    )
    if (mainCommand === "load") {
        const loadCommand = await prompt("Sync location name: ")
        if (!loadCommand) return console.error("Load command requires a sync location name")
        return Controller.load({ configSyncLocationName: loadCommand });
    }
    if (mainCommand === "queue") {
        const queueCommand = await prompt(
            "Available options: print - list current queue, add - add conversion to queue, position - reposition conversion in queue, clear - clear queue: "
        )
        if (queueCommand === "print") {
            return Controller.printQueue()
        }
        if (queueCommand === "add") {
            const source = await prompt("Source path: ")
            const target = await prompt("Target path: ")
            const deleteSource = await prompt("Delete source file? (y/n): ")
            return Controller.queueAdd(source, target, deleteSource === "y")
        }
        if (queueCommand === "position") {
            const from = await prompt("Provide index to move from: ")
            const to = await prompt("Provide index to move to: ")
            return Controller.repositionInQueue(parseInt(from, 10), parseInt(to, 10))
        }
        if (queueCommand === "clear") {
            return Controller.queue.empty()
        }
        if (queueCommand === "debug") {
            return console.log(Controller.queue.list())
        }
    }
    if (mainCommand === "start") {
        Controller.start()
            .then(() => console.log("Processing complete"))
            .catch(error => console.error(error))
        return;
    }
    if (mainCommand === "stop") {
        Controller.stop()
        return;
    }
}

while (true) {
    try {
        await terminalInterface()
    } catch (error) {
        console.error(error)
    }
}