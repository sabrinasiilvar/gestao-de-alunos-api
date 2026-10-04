import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app.js';

async function login(email, senha) {
  const resposta = await request(app).post('/api/auth/login').send({ email, senha });

  expect(resposta.status, `falha ao logar com "${email}"`).to.equal(200);
  return resposta.body;
}

// Loga como o administrador pré-cadastrado, usando as credenciais do .env.
// Retorna { token, usuario }.
export function loginAdmin() {
  return login(process.env.ADMIN_EMAIL, process.env.ADMIN_SENHA);
}

// Loga como um aluno já cadastrado. Retorna { token, usuario }.
export function loginAluno(email, senha) {
  return login(email, senha);
}
