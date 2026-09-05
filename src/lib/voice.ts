const CORRECT_LINES = ['Nice one!', 'Exactly!', 'Great ear!', 'Perfect!'];
const WRONG_LINES = ['Almost!', 'Good try - look again.', "You'll get it next time."];

let lastLine: string | null = null;

function pick(pool: string[]): string {
  let line = pool[Math.floor(Math.random() * pool.length)];
  while (pool.length > 1 && line === lastLine) {
    line = pool[Math.floor(Math.random() * pool.length)];
  }
  lastLine = line;
  return line;
}

export function correctLine(): string {
  return pick(CORRECT_LINES);
}

export function wrongLine(): string {
  return pick(WRONG_LINES);
}