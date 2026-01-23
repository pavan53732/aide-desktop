// Simple testing utilities for AIDE
export interface TestResult {
  passed: boolean;
  message: string;
  error?: Error;
}

export class TestSuite {
  private tests: Array<{ name: string; test: () => Promise<TestResult> | TestResult }> = [];
  private passed = 0;
  private failed = 0;

  addTest(name: string, test: () => Promise<TestResult> | TestResult) {
    this.tests.push({ name, test });
  }

  async run(): Promise<{ passed: number; failed: number; results: TestResult[] }> {
    console.log('🧪 Running AIDE Test Suite...\n');
    
    const results: TestResult[] = [];
    
    for (const { name, test } of this.tests) {
      try {
        console.log(`Running: ${name}...`);
        const result = await test();
        results.push(result);
        
        if (result.passed) {
          this.passed++;
          console.log(`✅ ${name}`);
        } else {
          this.failed++;
          console.log(`❌ ${name}: ${result.message}`);
        }
      } catch (error) {
        this.failed++;
        const result: TestResult = {
          passed: false,
          message: `Test failed with error: ${error instanceof Error ? error.message : String(error)}`,
          error: error instanceof Error ? error : new Error(String(error)),
        };
        results.push(result);
        console.log(`❌ ${name}: ${result.message}`);
      }
    }
    
    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    
    return {
      passed: this.passed,
      failed: this.failed,
      results,
    };
  }
}

// Mock data generators
export const createMockFile = (name: string, isDir = false, size?: number) => ({
  id: crypto.randomUUID(),
  name,
  path: `/${name}`,
  isDir,
  size: size || Math.floor(Math.random() * 10000),
  children: isDir ? [] : undefined,
});

export const createMockWorkspace = (name: string) => ({
  id: crypto.randomUUID(),
  name,
  path: `/${name}`,
  createdAt: Date.now(),
  lastModified: Date.now(),
});

export const createMockMessage = (content: string, role: 'user' | 'assistant' = 'user') => ({
  id: crypto.randomUUID(),
  role,
  content,
  type: 'text' as const,
  createdAt: Date.now(),
});

// Common test patterns
export const testFileOperations = (suite: TestSuite) => {
  suite.addTest('File creation', () => {
    const file = createMockFile('test.txt');
    return {
      passed: file.name === 'test.txt' && !file.isDir,
      message: 'File should be created with correct properties',
    };
  });

  suite.addTest('Directory creation', () => {
    const dir = createMockFile('test-dir', true);
    return {
      passed: dir.name === 'test-dir' && dir.isDir && Array.isArray(dir.children),
      message: 'Directory should be created with children array',
    };
  });
};

export const testAIIntegration = (suite: TestSuite) => {
  suite.addTest('Message creation', () => {
    const message = createMockMessage('Hello AI');
    return {
      passed: message.content === 'Hello AI' && message.role === 'user',
      message: 'Message should be created with correct content and role',
    };
  });

  suite.addTest('Assistant message creation', () => {
    const message = createMockMessage('Hello user', 'assistant');
    return {
      passed: message.content === 'Hello user' && message.role === 'assistant',
      message: 'Assistant message should be created with correct role',
    };
  });
};

export const testWorkspaceOperations = (suite: TestSuite) => {
  suite.addTest('Workspace creation', () => {
    const workspace = createMockWorkspace('test-workspace');
    return {
      passed: workspace.name === 'test-workspace' && workspace.path === '/test-workspace',
      message: 'Workspace should be created with correct name and path',
    };
  });
};

// Performance tests
export const testPerformance = (suite: TestSuite) => {
  suite.addTest('Large file tree generation', () => {
    const start = performance.now();
    
    // Generate a large file tree
    const files = [];
    for (let i = 0; i < 1000; i++) {
      files.push(createMockFile(`file-${i}.txt`));
    }
    
    const end = performance.now();
    const duration = end - start;
    
    return {
      passed: duration < 100, // Should complete in under 100ms
      message: `File tree generation took ${duration.toFixed(2)}ms`,
    };
  });

  suite.addTest('Many message generation', () => {
    const start = performance.now();
    
    // Generate many messages
    const messages = [];
    for (let i = 0; i < 1000; i++) {
      messages.push(createMockMessage(`Message ${i}`));
    }
    
    const end = performance.now();
    const duration = end - start;
    
    return {
      passed: duration < 100, // Should complete in under 100ms
      message: `Message generation took ${duration.toFixed(2)}ms`,
    };
  });
};

// Integration tests
export const testIntegration = (suite: TestSuite) => {
  suite.addTest('File and workspace integration', () => {
    const workspace = createMockWorkspace('test');
    const file = createMockFile('test.txt');
    
    // Simulate adding file to workspace
    const fullPath = `${workspace.path}${file.path}`;
    
    return {
      passed: fullPath === '/test/test.txt',
      message: 'File path should be correctly integrated with workspace path',
    };
  });

  suite.addTest('Message and file integration', () => {
    const file = createMockFile('test.txt');
    const message = createMockMessage(`Analyzing ${file.name}`);
    
    return {
      passed: message.content.includes(file.name),
      message: 'Message should reference the file name',
    };
  });
};

// Export default test suite
export const createTestSuite = () => {
  const suite = new TestSuite();
  
  testFileOperations(suite);
  testAIIntegration(suite);
  testWorkspaceOperations(suite);
  testPerformance(suite);
  testIntegration(suite);
  
  return suite;
};

export default {
  TestSuite,
  createMockFile,
  createMockWorkspace,
  createMockMessage,
  testFileOperations,
  testAIIntegration,
  testWorkspaceOperations,
  testPerformance,
  testIntegration,
  createTestSuite,
};
