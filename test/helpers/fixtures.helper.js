import { readFileSync } from 'node:fs';

// Lê um arquivo JSON de test/fixtures (dados usados no Data-Driven Testing).
export function carregarFixture(nome) {
  const caminho = new URL(`../fixtures/${nome}.json`, import.meta.url);
  return JSON.parse(readFileSync(caminho, 'utf8'));
}
