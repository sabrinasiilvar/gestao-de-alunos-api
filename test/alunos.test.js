import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { loginAdmin } from './helpers/auth.helper.js';
import { gerarAlunoUnico } from './helpers/aluno.helper.js';
import { carregarFixture } from './helpers/fixtures.helper.js';

const { validos, invalidos, duplicado } = carregarFixture('alunos');

describe('POST /api/admin/alunos', () => {
  let tokenAdmin;

  before(async () => {
    ({ token: tokenAdmin } = await loginAdmin());
  });

  validos.forEach((base) => {
    it(`deve cadastrar o aluno "${base.nome}" como administrador`, async () => {
      const aluno = gerarAlunoUnico(base);

      const resposta = await request(app)
        .post('/api/admin/alunos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(aluno);

      expect(resposta.status).to.equal(201);
      expect(resposta.body).to.include({
        nome: aluno.nome,
        email: aluno.email,
        matricula: aluno.matricula,
        role: 'aluno',
      });
      expect(resposta.body).to.have.property('id');
      expect(resposta.body).to.not.have.property('senha');
    });
  });

  invalidos.forEach(({ descricao, dados, status, erro }) => {
    it(`deve retornar ${status} quando ${descricao}`, async () => {
      const resposta = await request(app)
        .post('/api/admin/alunos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(dados);

      expect(resposta.status).to.equal(status);
      expect(resposta.body.error).to.equal(erro);
    });
  });

  it(`deve retornar ${duplicado.status} ao cadastrar um aluno com e-mail ou matrícula já existentes`, async () => {
    const aluno = gerarAlunoUnico(validos[0]);
    const cadastrar = () =>
      request(app).post('/api/admin/alunos').set('Authorization', `Bearer ${tokenAdmin}`).send(aluno);

    expect((await cadastrar()).status).to.equal(201);
    const resposta = await cadastrar();

    expect(resposta.status).to.equal(duplicado.status);
    expect(resposta.body.error).to.equal(duplicado.erro);
  });
});
