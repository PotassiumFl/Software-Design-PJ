import { Repl } from './Repl.js';

new Repl().run().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
