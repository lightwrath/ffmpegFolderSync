import { describe, it, expect } from "bun:test";
import Queue from "./Queue";

describe("Queue", () => {
    it('should be able to add to the queue', () => {
        const queue = new Queue();
        queue.add("/home/user/source/first.mkv", "/home/user/target/first.mkv");
        queue.add("/home/user/source/second.mkv", "/home/user/target/second.mkv");
        expect(queue.length()).toEqual(2);
    });

    it('should return an error when attempting to add a duplicate entry', () => {
        const queue = new Queue();
        queue.add("/home/user/source/first.mkv", "/home/user/target/first.mkv");
        queue.add("/home/user/source/second.mkv", "/home/user/target/second.mkv");
        expect(queue.length()).toEqual(2);
        try {
            queue.add("/home/user/source/second.mkv", "/home/user/target/second.mkv");
        } catch (error) {
           expect(error).toBeInstanceOf(Error);
        }
    });

    it('should be able determine if an item is queued or not', () => {
        const queue = new Queue();
        queue.add("/home/user/source/first.mkv", "/home/user/target/first.mkv");
        expect(queue.isPresent("/home/user/source/second.mkv", "/home/user/target/second.mkv")).toBe(false);
        queue.add("/home/user/source/second.mkv", "/home/user/target/second.mkv");
        expect(queue.isPresent("/home/user/source/second.mkv", "/home/user/target/second.mkv")).toBe(true);
    });

    it('should be able to empty the queue', () => {
        const queue = new Queue();
        queue.add("/home/user/source/first.mkv", "/home/user/target/first.mkv");
        queue.add("/home/user/source/second.mkv", "/home/user/target/second.mkv");
        queue.empty()
        expect(queue.length()).toEqual(0);
    });

    it('should be able to get the next item or handle the next item, with it being marked from the queue after', () => {
        const queue = new Queue();
        queue.add("/home/user/source/first.mkv", "/home/user/target/first.mkv");
        queue.add("/home/user/source/second.mkv", "/home/user/target/second.mkv");
        const firstFile = queue.setDone(queue.next().id)
        expect(firstFile.source).toEqual("/home/user/source/first.mkv");
        expect(queue.length()).toEqual(2);
        const secondFile = queue.next();
        expect(secondFile.source).toEqual("/home/user/source/second.mkv");
        expect(queue.length()).toEqual(2);
    });
})