import { skip } from 'node:test';
import request from 'supertest';

describe("Atualização de Usuário", () => {
    
    beforeAll(() => {
        // antes de todos testes
    });

    afterAll(() => {
        // após todos testes
    });

    beforeEach(() => {
        // antes de cada teste
    });

    afterEach(() => {
        // depois de cada teste
    });

    it("deve retornar erro se o nome não for informado", () => {
        // Implementação da lógica do teste
        let x = 2;
    
        // asserções
        expect(x).toBe(2);
    });
    
    it.skip("deve retornar correto se os parâmetros estiverem corretos", () => {
        // Implementação da lógica do teste
        let x = 4;
    
        // asserções
        expect(null).toBeNull();
    });


});


describe.only("Lista de usuarios", () => {

    it("deve retornar todos  usurios cadastrados", () => {
        // Implementação da lógica do teste
        const users = ['joao', 'pedro', 'maria'];
    
        // asserções
        expect(users).toContainEqual<string>('pedr');
    });
 
});
