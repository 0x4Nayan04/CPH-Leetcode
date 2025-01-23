const vscode = require('vscode');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const {
  formatArrayToString,
  splitTestCases,
} = require('./src/utils/formatters');
const { executeCode, runSingle } = require('./src/utils/codeExec');

const PROBLEM_METADATA_QUERY = `
query problemMetadata($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
        questionId
        title
        content
        exampleTestcases
        sampleTestCase
    }
}`;

function extractTestSuite(content, exampleCases, sampleCase) {
  if (!content) return { inputs: [], outputs: [] };

  const $ = cheerio.load(content);
  const expectedOutputs = [];

  const linesPerTestCase = sampleCase
    ? (sampleCase.match(/\n/g) || []).length + 1
    : 1;

  const testInputs = exampleCases
    ? splitTestCases(exampleCases, linesPerTestCase)
    : [];

  $('strong.example').each((i, element) => {
    let expectedOutput = '';
    let currentNode = $(element);

    while (currentNode.length) {
      if (currentNode.next().length) {
        currentNode = currentNode.next();
      } else if (currentNode.parent().next().length) {
        currentNode = currentNode.parent().next();
      } else {
        break;
      }

      const preElement = currentNode.is('pre')
        ? currentNode
        : currentNode.find('pre');

      if (preElement.length) {
        const testOutput = preElement.text();
        const outputMatch = testOutput.match(
          /Output:\s*([^]*?)(?=\nExplanation:|$)/
        );
        if (outputMatch && outputMatch[1]) {
          expectedOutput = formatArrayToString(outputMatch[1].trim());
          break;
        }
      }
    }
    expectedOutputs.push(expectedOutput || '');
  });

  return {
    inputs: testInputs.map((input) =>
      input
        .split('\n')
        .map((line) => formatArrayToString(line))
        .join('\n')
    ),
    outputs: expectedOutputs.map((output) =>
      output
        .split('\n')
        .map((line) => formatArrayToString(line))
        .join('\n')
    ),
  };
}

async function persistTestSuite(workspaceRoot, problemId, testSuite) {
  const testSuiteDir = path.join(
    workspaceRoot,
    '.leetcode',
    'testcases',
    problemId
  );

  try {
    await fs.mkdir(testSuiteDir, { recursive: true });

    for (let i = 0; i < testSuite.inputs.length; i++) {
      const inputPath = path.join(testSuiteDir, `input_${i + 1}.txt`);
      const formattedInput = Array.isArray(testSuite.inputs[i])
        ? testSuite.inputs[i].join('\n')
        : testSuite.inputs[i];
      await fs.writeFile(inputPath, formattedInput);
    }

    for (let i = 0; i < testSuite.outputs.length; i++) {
      const outputPath = path.join(testSuiteDir, `output_${i + 1}.txt`);
      await fs.writeFile(outputPath, testSuite.outputs[i]);
    }

    return testSuiteDir;
  } catch (error) {
    throw new Error(`Failed to persist test suite: ${error.message}`);
  }
}

async function retrieveProblemData(titleSlug) {
  try {
    const response = await axios.post('https://leetcode.com/graphql', {
      query: PROBLEM_METADATA_QUERY,
      variables: { titleSlug },
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    const problemData = response.data.data.question;
    return {
      id: problemData.questionId,
      content: problemData.content,
      testSuite: extractTestSuite(
        problemData.content,
        problemData.exampleTestcases,
        problemData.sampleTestCase
      ),
    };
  } catch (error) {
    throw new Error(`API Error: ${error.message}`);
  }
}

class TestEnvironmentProvider {
  constructor() {
    this.webview = null;
    this.activeFile = null;
    this.activeLang = null;
  }

  setActiveFile(filePath, language) {
    this.activeFile = filePath;
    this.activeLang = language;
  }

  resolveWebviewView(webviewView) {
    this.webview = webviewView.webview;
    const { getWebviewContent } = require('./src/webview/home');

    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = getWebviewContent();

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'fetch':
          vscode.commands.executeCommand(
            'leetcode-testcases.fetch',
            message.url
          );
          break;
        case 'runSingle':
          try {
            if (!this.activeFile || !this.activeLang) {
              throw new Error('No active solution file selected');
            }

            const result = await runSingle(
              this.activeFile,
              this.activeLang,
              message.testCase.input,
              message.testCase.expectedOutput
            );

            if (!result.success) {
              throw new Error(result.error);
            }

            webviewView.webview.postMessage({
              command: 'testCaseResult',
              index: message.testCase.index,
              passed: result.passed,
              actualOutput: result.actualOutput,
            });
          } catch (error) {
            webviewView.webview.postMessage({
              command: 'testCaseResult',
              index: message.testCase.index,
              passed: false,
              actualOutput: error.message,
            });
          }
          break;
      }
    });
  }
}

const extractProblemSlug = (url) => {
  try {
    const cleanUrl = url.replace(/\/$/, '');
    const match = cleanUrl.match(/\/problems\/([^/]+)/);
    if (!match || !match[1]) throw new Error('Invalid problem URL format');
    return match[1];
  } catch (error) {
    throw new Error('Invalid problem URL format');
  }
};

function activate(context) {
  const provider = new TestEnvironmentProvider();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'leetcode-testcases.webview',
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      }
    )
  );

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      const document = editor.document;
      const language = document.languageId;
      provider.setActiveFile(document.uri.fsPath, language);
    }
  });

  if (vscode.window.activeTextEditor) {
    const document = vscode.window.activeTextEditor.document;
    const language = document.languageId;
    provider.setActiveFile(document.uri.fsPath, language);
  }

  let fetchCommand = vscode.commands.registerCommand(
    'leetcode-testcases.fetch',
    async (problemUrl) => {
      try {
        const workspaceRoot =
          vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
          throw new Error('No workspace folder found');
        }

        if (!problemUrl) {
          problemUrl = await vscode.window.showInputBox({
            prompt: 'Enter LeetCode problem URL',
            placeHolder: 'https://leetcode.com/problems/...',
          });
        }

        if (!problemUrl) {
          throw new Error('Problem URL is required');
        }

        const titleSlug = extractProblemSlug(problemUrl);
        const problemData = await retrieveProblemData(titleSlug);
        await persistTestSuite(
          workspaceRoot,
          problemData.id,
          problemData.testSuite
        );

        if (provider.webview) {
          provider.webview.postMessage({
            command: 'showTestCases',
            testCases: problemData.testSuite,
            problemContent: problemData.content,
          });
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
    }
  );

  let runCommand = vscode.commands.registerCommand(
    'leetcode-testcases.run',
    async () => {
      try {
        if (!provider.activeFile || !provider.activeLang) {
          throw new Error('No active solution file selected');
        }

        const workspaceRoot =
          vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
          throw new Error('No workspace folder found');
        }

        const leetcodePath = path.join(workspaceRoot, '.leetcode');
        const testcasesPath = path.join(leetcodePath, 'testcases');
        const dirs = await fs.readdir(testcasesPath);

        if (dirs.length === 0) {
          throw new Error(
            'No test cases found. Please fetch test cases first.'
          );
        }

        const problemId = dirs[0];

        const testCaseDir = path.join(testcasesPath, problemId);
        const files = await fs.readdir(testCaseDir);

        const inputFiles = files.filter((f) => f.startsWith('input_'));
        const results = [];

        for (let i = 0; i < inputFiles.length; i++) {
          const inputPath = path.join(testCaseDir, `input_${i + 1}.txt`);
          const outputPath = path.join(testCaseDir, `output_${i + 1}.txt`);

          const input = await fs.readFile(inputPath, 'utf-8');
          const expectedOutput = await fs.readFile(outputPath, 'utf-8');

          const result = await runSingle(
            provider.activeFile,
            provider.activeLang,
            input.trim(),
            expectedOutput.trim()
          );

          results.push({
            input: input.trim(),
            expectedOutput: expectedOutput.trim(),
            actualOutput: result.actualOutput,
            passed: result.passed,
          });
        }

        if (provider.webview) {
          provider.webview.postMessage({
            command: 'showTestCases',
            testCases: {
              inputs: results.map((r) => r.input),
              outputs: results.map((r) => r.expectedOutput),
            },
          });

          results.forEach((r, index) => {
            provider.webview.postMessage({
              command: 'testCaseResult',
              index: index,
              passed: r.passed,
              actualOutput: r.actualOutput,
            });
          });
        }

        const passedCount = results.filter((r) => r.passed).length;
        vscode.window.showInformationMessage(
          `Test Results: ${passedCount}/${results.length} cases passed`
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
    }
  );

  context.subscriptions.push(fetchCommand, runCommand);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
