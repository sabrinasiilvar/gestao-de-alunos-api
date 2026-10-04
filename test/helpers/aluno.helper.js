import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app.js';

// E-mail e matrícula são únicos no banco: acrescenta um sufixo aos dados do JSON
// para que os testes possam rodar várias vezes contra o mesmo banco.
export function gerarAlunoUnico(base) {
  const sufixo = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const [usuario, dominio] = base.email.split('@');
  return {
    ...base,
    email: `${usuario}.${sufixo}@${dominio}`,
    matricula: `${base.matricula}-${sufixo}`,
  };
}

export async function cadastrarAluno(tokenAdmin, aluno) {
  const resposta = await request(app)
    .post('/api/admin/alunos')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send(aluno);

  expect(resposta.status, 'falha ao cadastrar aluno').to.equal(201);
  return resposta.body;
}

export async function matricularAluno(tokenAdmin, disciplinaId, alunoId) {
  const resposta = await request(app)
    .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ alunoId });

  expect(resposta.status, 'falha ao matricular aluno').to.equal(201);
  return resposta.body;
}
