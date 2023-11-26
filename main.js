import { Game } from "./game";

async function main() {
  const game = new Game();
  await game.init();
  game.startNewGame();
}

main().catch((err) => console.error(err));
