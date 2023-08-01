# Contributing to LootPot

Thank you for your interest in contributing to LootPot! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

- Use the [GitHub issue tracker](https://github.com/GalaXy-Xy/lootpot/issues)
- Include a clear description of the bug
- Provide steps to reproduce the issue
- Include your environment details (OS, browser, etc.)

### Suggesting Features

- Open a new issue with the "enhancement" label
- Describe the feature and its benefits
- Consider implementation complexity and impact

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Add tests** for new functionality
5. **Ensure all tests pass**: `npm test`
6. **Commit your changes**: Use conventional commit format
7. **Push to your branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

## 📝 Code Style Guidelines

### Smart Contracts (Solidity)

- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/v0.8.17/style-guide.html)
- Use meaningful variable and function names
- Add comprehensive NatSpec documentation
- Include events for important state changes
- Write tests for all new functionality

### Frontend (TypeScript/React)

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add PropTypes or TypeScript interfaces

### General

- Write clear, descriptive commit messages
- Keep functions small and focused
- Add comments for complex logic
- Follow existing code patterns

## 🧪 Testing Requirements

### Smart Contracts

- All new functions must have tests
- Test both success and failure cases
- Include edge case testing
- Maintain >90% test coverage

### Frontend Components

- Test component rendering
- Test user interactions
- Test error states
- Test accessibility features

## 🔒 Security Considerations

- Never commit private keys or sensitive data
- Follow security best practices
- Consider potential attack vectors
- Review smart contract security patterns

## 📚 Documentation

- Update README.md for new features
- Add inline code comments
- Update API documentation if applicable
- Include usage examples

## 🚀 Development Setup

1. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/lootpot.git
   cd lootpot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp env.example .env.local
   # Fill in your configuration
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New functionality is tested
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] No sensitive data in code

### PR Description

- Clear description of changes
- Link to related issues
- Screenshots for UI changes
- Testing instructions

## 🏷️ Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority: high`: High priority issues

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Wiki**: For detailed documentation

## 🎯 Areas for Contribution

### High Priority
- Chainlink VRF integration
- Mobile responsiveness improvements
- Performance optimizations
- Security audits

### Medium Priority
- Additional pool types
- Social features
- Analytics dashboard
- Multi-language support

### Low Priority
- UI/UX improvements
- Documentation updates
- Test coverage improvements
- Code refactoring

## 🙏 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor hall of fame
- GitHub contributors list

## 📄 License

By contributing to LootPot, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to LootPot! 🎉
