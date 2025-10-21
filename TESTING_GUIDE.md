# Testing Guide

This guide provides comprehensive instructions for testing the Smart Library Booking System.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Accessibility Testing](#accessibility-testing)
9. [Browser Compatibility Testing](#browser-compatibility-testing)
10. [Mobile Testing](#mobile-testing)
11. [Continuous Integration](#continuous-integration)
12. [Test Reporting](#test-reporting)

## Testing Overview

The Smart Library Booking System employs a comprehensive testing strategy that includes:

- Unit tests for individual functions and components
- Integration tests for API endpoints and database interactions
- End-to-end tests for user flows
- Performance tests for scalability
- Security tests for vulnerability assessment
- Accessibility tests for inclusive design
- Cross-browser compatibility tests
- Mobile responsiveness tests

## Test Environment Setup

### Prerequisites

1. Node.js (v14 or higher)
2. MySQL (v8 or higher)
3. Git

### Setup Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/sml-library-booking.git
   cd sml-library-booking
   ```

2. Install dependencies:
   ```bash
   npm install
   cd client
   npm install
   cd ..
   ```

3. Create test database:
   ```sql
   CREATE DATABASE sml_library_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. Configure test environment variables:
   ```bash
   cp .env.example .env.test
   ```
   
   Edit `.env.test` with test database credentials:
   ```env
   NODE_ENV=test
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=sml_library_test
   JWT_SECRET=test_secret_key_min_32_characters_long
   ```

## Unit Testing

### Backend Unit Tests

Backend unit tests focus on testing individual functions and business logic.

#### Running Backend Tests

```bash
# Run all backend tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- test/authController.test.js
```

#### Test Structure

Backend tests are organized in the `test/` directory:
```
test/
├── controllers/
│   ├── authController.test.js
│   ├── userController.test.js
│   └── adminController.test.js
├── models/
│   ├── userModel.test.js
│   └── bookingModel.test.js
├── services/
│   ├── authService.test.js
│   └── paymentService.test.js
└── utils/
    └── helpers.test.js
```

#### Example Test

```javascript
// test/controllers/authController.test.js
const request = require('supertest');
const app = require('../../server');
const db = require('../../server/config/database');

describe('Auth Controller', () => {
  beforeEach(async () => {
    // Clear test database
    await db.execute('DELETE FROM users');
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        mobile: '1234567890',
        password: 'password123',
        dob: '1990-01-01',
        gender: 'Male'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
    });
  });
});
```

### Frontend Unit Tests

Frontend unit tests focus on testing individual React components and utility functions.

#### Running Frontend Tests

```bash
cd client

# Run all frontend tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/components/Button.test.js
```

#### Test Structure

Frontend tests are colocated with components:
```
client/src/
├── components/
│   ├── Button/
│   │   ├── Button.js
│   │   ├── Button.module.css
│   │   └── Button.test.js
│   └── Card/
│       ├── Card.js
│       ├── Card.module.css
│       └── Card.test.js
├── pages/
│   ├── Login/
│   │   ├── Login.js
│   │   └── Login.test.js
│   └── Home/
│       ├── Home.js
│       └── Home.test.js
└── utils/
    ├── helpers.js
    └── helpers.test.js
```

#### Example Test

```javascript
// client/src/components/Button/Button.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDisabled();
  });
});
```

## Integration Testing

Integration tests verify that different parts of the system work together correctly.

### API Integration Tests

```bash
# Run integration tests
npm run test:integration
```

#### Example Integration Test

```javascript
// test/integration/auth.test.js
const request = require('supertest');
const app = require('../../server');
const db = require('../../server/config/database');

describe('Auth Integration', () => {
  let testUser;

  beforeAll(async () => {
    // Create test user
    const [result] = await db.execute(
      'INSERT INTO users (name, email, mobile, password, dob, gender) VALUES (?, ?, ?, ?, ?, ?)',
      ['Test User', 'test@example.com', '1234567890', 'hashed_password', '1990-01-01', 'Male']
    );
    testUser = { id: result.insertId, email: 'test@example.com', password: 'password123' };
  });

  afterAll(async () => {
    // Clean up
    await db.execute('DELETE FROM users WHERE email = ?', [testUser.email]);
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate valid user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.token).toBeDefined();
    });
  });
});
```

## End-to-End Testing

End-to-end tests simulate real user scenarios across the entire application.

### Setup

Install Cypress for E2E testing:

```bash
cd client
npm install --save-dev cypress
```

### Running E2E Tests

```bash
cd client

# Open Cypress test runner
npm run cypress:open

# Run tests in headless mode
npm run cypress:run
```

### Test Structure

```
client/cypress/
├── fixtures/
│   └── users.json
├── integration/
│   ├── auth/
│   │   ├── login.spec.js
│   │   └── signup.spec.js
│   ├── booking/
│   │   ├── seat-selection.spec.js
│   │   └── payment.spec.js
│   └── admin/
│       ├── dashboard.spec.js
│       └── user-management.spec.js
├── plugins/
│   └── index.js
├── support/
│   ├── commands.js
│   └── index.js
└── screenshots/ (generated during test runs)
```

### Example E2E Test

```javascript
// client/cypress/integration/auth/login.spec.js
describe('User Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login with valid credentials', () => {
    cy.get('[data-testid="email-input"]').type('user@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome');
  });

  it('should show error for invalid credentials', () => {
    cy.get('[data-testid="email-input"]').type('invalid@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    cy.get('[data-testid="error-message"]').should('be.visible');
  });
});
```

## Performance Testing

Performance tests ensure the application can handle expected load.

### Setup

Install Artillery for load testing:

```bash
npm install -g artillery
```

### Running Performance Tests

```bash
# Run load test
artillery run test/performance/login-test.yml
```

### Example Performance Test

```yaml
# test/performance/login-test.yml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      content-type: "application/json"

scenarios:
  - name: "User Login"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "authToken"
      - get:
          url: "/api/user/profile"
          headers:
            Authorization: "Bearer {{ authToken }}"
```

## Security Testing

Security tests identify vulnerabilities in the application.

### Static Analysis

```bash
# Install security audit tools
npm install -g nsp
npm install -g snyk

# Run security audit
npm audit
nsp check
```

### OWASP Testing

Key areas to test:

1. **Injection**: Test SQL injection in API endpoints
2. **Authentication**: Test weak passwords, session management
3. **XSS**: Test input sanitization in forms
4. **CSRF**: Test cross-site request forgery protection
5. **Security Headers**: Verify proper HTTP headers
6. **File Uploads**: Test malicious file uploads

### Example Security Test

```javascript
// test/security/auth-security.test.js
const request = require('supertest');
const app = require('../../server');

describe('Authentication Security', () => {
  test('should reject SQL injection attempts', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: "admin'--",
        password: "anything"
      })
      .expect(401);

    expect(response.body.success).toBe(false);
  });

  test('should enforce rate limiting', async () => {
    // Make multiple rapid requests
    const requests = Array(10).fill().map(() => 
      request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
    );

    const responses = await Promise.all(requests);
    
    // Check that some requests were rate limited
    const rateLimited = responses.some(res => res.status === 429);
    expect(rateLimited).toBe(true);
  });
});
```

## Accessibility Testing

Accessibility tests ensure the application is usable by people with disabilities.

### Setup

Install accessibility testing tools:

```bash
npm install --save-dev axe-core
```

### Running Accessibility Tests

```bash
# Run accessibility tests
npm run test:accessibility
```

### Example Accessibility Test

```javascript
// test/accessibility/home-accessibility.test.js
const { exec } = require('child_process');

describe('Home Page Accessibility', () => {
  test('should pass accessibility checks', (done) => {
    exec('npx pa11y http://localhost:3000', (error, stdout) => {
      if (error) {
        console.error('Accessibility issues found:', stdout);
        done.fail('Accessibility issues detected');
      } else {
        done();
      }
    });
  });
});
```

## Browser Compatibility Testing

Test the application across different browsers and versions.

### Supported Browsers

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Testing Strategy

1. Manual testing on supported browsers
2. Automated testing with BrowserStack or Sauce Labs
3. Visual regression testing

### Example Cross-Browser Test

```javascript
// test/browser/homepage.test.js
const puppeteer = require('puppeteer');

describe('Homepage Cross-Browser', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should display correctly in Chrome', async () => {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000');
    
    // Check that key elements are present
    await page.waitForSelector('[data-testid="hero-section"]');
    await page.waitForSelector('[data-testid="plans-section"]');
    
    // Take screenshot for visual comparison
    await page.screenshot({ path: 'test/screenshots/homepage-chrome.png' });
  });
});
```

## Mobile Testing

Test the application on various mobile devices and screen sizes.

### Responsive Design Testing

```bash
# Install responsive testing tools
npm install --save-dev responsive-tester
```

### Viewport Testing

```javascript
// test/mobile/responsive.test.js
const puppeteer = require('puppeteer');

const viewports = [
  { name: 'iPhone 5', width: 320, height: 568 },
  { name: 'iPhone 8', width: 375, height: 667 },
  { name: 'iPhone X', width: 375, height: 812 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 }
];

describe('Responsive Design', () => {
  let browser;

  beforeAll(async () => {
    browser = await puppeteer.launch();
  });

  afterAll(async () => {
    await browser.close();
  });

  viewports.forEach(viewport => {
    test(`should display correctly on ${viewport.name}`, async () => {
      const page = await browser.newPage();
      await page.setViewport({ 
        width: viewport.width, 
        height: viewport.height 
      });
      await page.goto('http://localhost:3000');
      
      // Check that mobile menu appears on small screens
      if (viewport.width < 768) {
        await page.waitForSelector('[data-testid="mobile-menu-button"]');
      }
      
      await page.screenshot({ 
        path: `test/screenshots/homepage-${viewport.name.toLowerCase().replace(' ', '-')}.png` 
      });
      await page.close();
    });
  });
});
```

## Continuous Integration

The project uses GitHub Actions for continuous integration.

### CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install frontend dependencies
      run: cd client && npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run frontend tests
      run: cd client && npm test
    
    - name: Run linting
      run: npm run lint
```

## Test Reporting

Generate comprehensive test reports for analysis.

### Test Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Generate frontend coverage report
cd client && npm run test -- --coverage
```

### Example Coverage Report

The coverage report will be generated in the `coverage/` directory:
```
coverage/
├── lcov-report/
│   ├── index.html
│   └── ...
├── lcov.info
└── ...
```

### Test Results Dashboard

For continuous integration, test results are available in the GitHub Actions dashboard.

## Best Practices

1. **Write tests first** (TDD) when possible
2. **Keep tests independent** and isolated
3. **Use descriptive test names**
4. **Mock external dependencies**
5. **Test edge cases** and error conditions
6. **Maintain test data** in fixtures
7. **Run tests regularly** during development
8. **Monitor test coverage** and aim for >80%
9. **Update tests** when code changes
10. **Document test scenarios**

## Troubleshooting

### Common Issues

1. **Database connection failures**:
   - Check database credentials in `.env.test`
   - Ensure test database exists
   - Verify MySQL is running

2. **Test environment conflicts**:
   - Use separate databases for development and testing
   - Clear test data between runs
   - Use transactions for test isolation

3. **Timeout issues**:
   - Increase Jest timeout for slow tests
   - Optimize database queries
   - Use mock data for complex operations

4. **Missing dependencies**:
   - Run `npm install` in both root and client directories
   - Check for peer dependency warnings

### Debugging Tests

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Run specific test with verbose output
npm test -- --verbose test/authController.test.js
```

This testing guide ensures comprehensive coverage of all aspects of the Smart Library Booking System, helping maintain high quality and reliability.