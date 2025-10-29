import { GET_CLIENT, UPDATE_CLIENT, GET_TENANT_BY_CURRENT_CLIENT } from '../../pages/profile/queries';

describe('Profile GraphQL Queries', () => {
  describe('GET_CLIENT', () => {
    it('should have correct query structure', () => {
      expect(GET_CLIENT).toBeDefined();
      expect(GET_CLIENT.loc?.source.body).toContain('query GetClient');
      expect(GET_CLIENT.loc?.source.body).toContain('$id: ID!');
      expect(GET_CLIENT.loc?.source.body).toContain('client(id: $id)');
    });

    it('should query all required client fields', () => {
      const queryBody = GET_CLIENT.loc?.source.body || '';
      expect(queryBody).toContain('fName');
      expect(queryBody).toContain('lName');
      expect(queryBody).toContain('email');
      expect(queryBody).toContain('phoneNumber');
      expect(queryBody).toContain('businessName');
      expect(queryBody).toContain('paymentReceivingDetails');
    });

    it('should query nested payment details', () => {
      const queryBody = GET_CLIENT.loc?.source.body || '';
      expect(queryBody).toContain('bankAccount');
      expect(queryBody).toContain('cryptoWallets');
      expect(queryBody).toContain('stripeConnect');
    });
  });

  describe('UPDATE_CLIENT', () => {
    it('should have correct mutation structure', () => {
      expect(UPDATE_CLIENT).toBeDefined();
      expect(UPDATE_CLIENT.loc?.source.body).toContain('mutation UpdateClient');
      expect(UPDATE_CLIENT.loc?.source.body).toContain('$id: ID!');
      expect(UPDATE_CLIENT.loc?.source.body).toContain('$input: UpdateClientInput!');
      expect(UPDATE_CLIENT.loc?.source.body).toContain('updateClient');
    });

    it('should return updated client fields', () => {
      const mutationBody = UPDATE_CLIENT.loc?.source.body || '';
      expect(mutationBody).toContain('fName');
      expect(mutationBody).toContain('lName');
      expect(mutationBody).toContain('email');
      expect(mutationBody).toContain('paymentReceivingDetails');
    });
  });

  describe('GET_TENANT_BY_CURRENT_CLIENT', () => {
    it('should have correct query structure', () => {
      expect(GET_TENANT_BY_CURRENT_CLIENT).toBeDefined();
      expect(GET_TENANT_BY_CURRENT_CLIENT.loc?.source.body).toContain('query TenantByCurrentClient');
      expect(GET_TENANT_BY_CURRENT_CLIENT.loc?.source.body).toContain('tenantByCurrentClient');
    });

    it('should query tenant configuration fields', () => {
      const queryBody = GET_TENANT_BY_CURRENT_CLIENT.loc?.source.body || '';
      expect(queryBody).toContain('apiKeys');
      expect(queryBody).toContain('branding');
      expect(queryBody).toContain('emailConfig');
      expect(queryBody).toContain('smsConfig');
    });
  });
});
