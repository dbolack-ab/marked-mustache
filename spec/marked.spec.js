import { runAllMarkedSpecTests } from '@markedjs/testutils';
import mustaches from '../src/index.js';

runAllMarkedSpecTests({ addExtension: (marked) => { marked.use({ extensions: [mustaches] }); }, outputCompletionTables: true });
