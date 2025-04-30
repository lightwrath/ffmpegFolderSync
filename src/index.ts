import Controller from "./libs/Controller.ts";

for await (const line of console) {
    const commandSegments = line.split(" ");
    await processCommand(commandSegments);
}

async function processCommand(command: Array<string>) {
    if (command[0] === "load") {
        if (!command[1]) return console.error("Load command requires a sync location name")
        return await Controller.load(command[1]);
    }
    if (command[0] === "print") {
        return Controller.printQueue()
    }
    if (command[0] === "start") {
        return await Controller.start();
    }
    if (command[0] === "stop") {
        return Controller.stop()
    }
}
