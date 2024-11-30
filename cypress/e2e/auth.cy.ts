describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=login-button]').click();

    cy.url().should('include', '/dashboard');
    cy.get('[data-testid=user-menu]').should('be.visible');
  });

  it('should show error message with invalid credentials', () => {
    cy.get('[data-testid=email-input]').type('invalid@example.com');
    cy.get('[data-testid=password-input]').type('wrongpassword');
    cy.get('[data-testid=login-button]').click();

    cy.get('[data-testid=error-message]')
      .should('be.visible')
      .and('contain', 'Invalid credentials');
  });

  it('should validate required fields', () => {
    cy.get('[data-testid=login-button]').click();

    cy.get('[data-testid=email-error]')
      .should('be.visible')
      .and('contain', 'Email is required');
    
    cy.get('[data-testid=password-error]')
      .should('be.visible')
      .and('contain', 'Password is required');
  });

  it('should redirect to requested page after login', () => {
    cy.visit('/products');
    cy.url().should('include', '/login');
    
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=login-button]').click();

    cy.url().should('include', '/products');
  });

  it('should logout successfully', () => {
    cy.login('test@example.com', 'password123');
    cy.visit('/dashboard');

    cy.get('[data-testid=user-menu]').click();
    cy.get('[data-testid=logout-button]').click();

    cy.url().should('include', '/login');
    cy.get('[data-testid=user-menu]').should('not.exist');
  });
});
