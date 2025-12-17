import { Elysia } from "elysia";

try {
    const app = new Elysia();
    if (typeof (app as any).ws === 'function') {
        console.log("Elysia has .ws() method!");
    } else {
        console.log("Elysia does NOT have .ws() method.");
    }
} catch (e) {
    console.error(e);
}
