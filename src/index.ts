import Controller from "./libs/Controller.ts";

async function getStdin() {
    for await (const line of console) {
        if (line) {
            return line
        }
    }
}

async function terminalInterface() {
    const mainCommand = await getStdin()
    if (mainCommand === "load") {
        console.write("Sync location name: ")
        const loadCommand = await getStdin()
        if (!loadCommand) return console.error("Load command requires a sync location name")
        return Controller.load({ configSyncLocationName: loadCommand });
    }
    if (mainCommand === "print") {
        return Controller.printQueue()
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