import { Repl } from './Repl.js';

new Repl().run().catch((err: unknown) => {
	const msg = err instanceof Error ? err.message : String(err);
	console.log(`error: ${msg}`);
});
