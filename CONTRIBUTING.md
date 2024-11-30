# Guide de Contribution

## 🌟 Comment contribuer

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Convention de Code

### Général

- Utiliser TypeScript pour tout nouveau code
- Maintenir une couverture de tests > 80%
- Suivre les principes SOLID
- Documenter les fonctions et classes complexes

### Style de Code

```typescript
// Bon exemple
interface User {
  id: string;
  email: string;
  fullName: string;
}

class UserService {
  private readonly users: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }
}
```

### Commits

- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Exemple: `feat(auth): add OAuth2 support`

### Documentation

- Documenter les nouvelles fonctionnalités
- Mettre à jour le README si nécessaire
- Ajouter des commentaires pour le code complexe

## 🧪 Tests

### Tests Requis

- Tests unitaires pour les services
- Tests d'intégration pour les API
- Tests E2E pour les flux critiques
- Tests de performance pour les endpoints

### Exemple de Test

```typescript
describe('UserService', () => {
  it('should find user by id', async () => {
    const user = await userService.findById('123');
    expect(user).toBeDefined();
    expect(user.id).toBe('123');
  });
});
```

## 🚀 Process de Review

1. Auto-review du code
2. Tests automatisés passent
3. Review par un pair
4. Review finale par un mainteneur
5. Merge si approuvé

## ⚠️ À éviter

- Code non testé
- Secrets dans le code
- Suppression de tests existants
- Breaking changes sans discussion
- Code dupliqué

## 📚 Resources

- [TypeScript Guidelines](https://www.typescriptlang.org/docs/handbook/declaration-files/do-and-dont.html)
- [React Best Practices](https://reactjs.org/docs/thinking-in-react.html)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
