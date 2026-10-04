// Carrega as variáveis de ambiente antes de qualquer teste importar a aplicação.
// Usa o .env.test quando existir; caso contrário, o .env.
const { existsSync } = require('node:fs');
const dotenv = require('dotenv');

const arquivo = existsSync('.env.test') ? '.env.test' : '.env';
dotenv.config({ path: arquivo, quiet: true });
