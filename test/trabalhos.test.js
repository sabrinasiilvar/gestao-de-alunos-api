import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { loginAdmin, loginAluno } from './helpers/auth.helper.js';
import { cadastrarAluno, gerarAlunoUnico, matricularAluno } from './helpers/aluno.helper.js';
import { carregarFixture } from './helpers/fixtures.helper.js';

const { aluno: alunoBase, disciplinaMatriculada, entregas, entregasInvalidas } =
  carregarFixture('trabalhos');

describe('POST /api/alunos/:alunoId/trabalhos', () => {
  let aluno;
  let alunoId;
  let tokenAluno;

  // Fluxo: admin loga -> cadastra aluno -> matricula na disciplina -> aluno loga.
  before(async () => {
    const { token: tokenAdmin } = await loginAdmin();
    aluno = gerarAlunoUnico(alunoBase);

    ({ id: alunoId } = await cadastrarAluno(tokenAdmin, aluno));
    await matricularAluno(tokenAdmin, disciplinaMatriculada, alunoId);

    ({ token: tokenAluno } = await loginAluno(aluno.email, aluno.senha));
  });

  it('deve logar como o aluno cadastrado e retornar um token com papel aluno', async () => {
    const { token, usuario } = await loginAluno(aluno.email, aluno.senha);

    expect(token).to.be.a('string').and.not.be.empty;
    expect(usuario).to.include({ id: alunoId, email: aluno.email, role: 'aluno' });
  });

  entregas.forEach(({ titulo, descricao }) => {
    it(`deve registrar a entrega do trabalho "${titulo}" como aluno`, async () => {
      const resposta = await request(app)
        .post(`/api/alunos/${alunoId}/trabalhos`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send({ disciplinaId: disciplinaMatriculada, titulo, descricao });

      expect(resposta.status).to.equal(201);
      expect(resposta.body).to.include({
        alunoId,
        disciplinaId: disciplinaMatriculada,
        titulo,
        descricao,
        status: 'entregue',
      });
      expect(resposta.body).to.have.property('id');
      expect(resposta.body).to.have.property('dataEntrega');
    });
  });

  entregasInvalidas.forEach(({ descricao, dados, status, erro }) => {
    it(`deve retornar ${status} quando ${descricao}`, async () => {
      const resposta = await request(app)
        .post(`/api/alunos/${alunoId}/trabalhos`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send(dados);

      expect(resposta.status).to.equal(status);
      expect(resposta.body.error).to.equal(erro);
    });
  });
});
