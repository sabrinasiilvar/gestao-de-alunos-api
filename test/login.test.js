import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { loginAdmin } from './helpers/auth.helper.js';
import { carregarFixture } from './helpers/fixtures.helper.js';

const { falhas } = carregarFixture('login');

describe('POST /api/auth/login', () => {
  it('deve logar como administrador e retornar um token com papel admin', async () => {
    const { token, usuario } = await loginAdmin();

    expect(token).to.be.a('string').and.not.be.empty;
    expect(usuario.email).to.equal(process.env.ADMIN_EMAIL);
    expect(usuario.role).to.equal('admin');
  });

  falhas.forEach(({ descricao, email, senha, status, erro }) => {
    it(`deve retornar ${status} quando ${descricao}`, async () => {
      const resposta = await request(app).post('/api/auth/login').send({ email, senha });

      expect(resposta.status).to.equal(status);
      expect(resposta.body.error).to.equal(erro);
      expect(resposta.body).to.not.have.property('token');
    });
  });
});
