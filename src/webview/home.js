const { getStyles } = require('./styles');

function getWebviewContent() {
  return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>${getStyles()}</style>
            </head>
            <body>
                <div class="container">
                    <!-- Home View -->
                    <div id="homeView" class="active">
                        <div class="header">
                            <h1>CPH: LeetCode</h1>
                            <div class="header-subtitle">Local Test Environment</div>
                            <div class="attribution">By Nayan Swarnkar</div>
                        </div>
                        <div class="input-group">
                            <label for="leetcodeUrl" class="input-label">Enter Problem URL</label>
                            <div class="url-input-wrapper">
                                <input type="text" 
                                    id="leetcodeUrl" 
                                    class="url-input" 
                                    placeholder="https://leetcode.com/problems/your-problem">
                                <button id="fetchButton" class="fetch-button">
                                    <span class="button-icon">⚡</span>
                                    Import
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Test Cases View -->
                    <div id="testCasesView">
                        <div class="problem-section">
                            <div class="problem-header" onclick="toggleProblem()">
                                <div class="problem-title">
                                    <span class="arrow">▶</span>
                                    <span>Challenge Overview</span>
                                </div>
                            </div>
                            <div class="problem-content" id="problemContent">
                                <!-- Problem content will be inserted here -->
                            </div>
                        </div>

                        <button class="run-all-button" id="runAllButton">
                            <span class="button-icon">▶</span>
                            Execute All Test Cases
                        </button>

                        <div id="testCasesContainer">
                            <!-- Test cases will be inserted here -->
                        </div>

                        <button class="add-testcase-button" id="addTestCase">
                            <span class="button-icon">+</span>
                            Create New Test Case
                        </button>
                    </div>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();

                    function createTestCase(index, input = '', output = '') {
                        return \`
                            <div class="test-case" id="testcase-\${index}">
                                <div class="test-case-header" onclick="toggleTestCase(\${index})">
                                    <div class="test-case-summary">
                                        <span class="arrow">▶</span>
                                        <span>Test Suite #\${index + 1}</span>
                                        <span class="test-case-status" id="status-\${index}"></span>
                                    </div>
                                    <div class="test-case-actions">
                                        <button class="run-button" onclick="event.stopPropagation(); runTestCase(\${index})" title="Run Test">
                                            <span class="button-icon">▶</span>
                                        </button>
                                        <button class="delete-button" onclick="event.stopPropagation(); deleteTestCase(\${index})" title="Delete Test">
                                            <span class="button-icon">×</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="test-case-content">
                                    <div class="input-section">
                                        <div class="section-header">
                                            <span>Test Input</span>
                                            <button class="copy-button" onclick="copyText(this)">
                                                <span class="button-icon">📋</span>
                                                Copy
                                            </button>
                                        </div>
                                        <textarea class="input-box" 
                                            oninput="autoResize(this)" 
                                            placeholder="Enter your test input here...">\${input}</textarea>
                                    </div>
                                    <div class="output-section">
                                        <div class="section-header">
                                            <span>Expected Result</span>
                                            <button class="copy-button" onclick="copyText(this)">
                                                <span class="button-icon">📋</span>
                                                Copy
                                            </button>
                                        </div>
                                        <textarea class="output-box" 
                                            oninput="autoResize(this)"
                                            placeholder="Enter expected output here...">\${output}</textarea>
                                    </div>
                                    <div class="actual-output-section" id="actual-output-\${index}">
                                        <div class="section-header">
                                            <span>Execution Output</span>
                                            <button class="copy-button" onclick="copyText(this)">
                                                <span class="button-icon">📋</span>
                                                Copy
                                            </button>
                                        </div>
                                        <textarea class="output-box actual-output" 
                                            readonly 
                                            placeholder="Output will appear here after running the test..."></textarea>
                                    </div>
                                </div>
                            </div>
                        \`;
                    }

                    function toggleProblem() {
                        const content = document.getElementById('problemContent');
                        const arrow = document.querySelector('.problem-header .arrow');
                        const isShowing = content.classList.contains('show');
                        
                        content.classList.toggle('show');
                        arrow.style.transform = isShowing ? 'rotate(0deg)' : 'rotate(90deg)';
                    }

                    function showView(viewId) {
                        document.querySelectorAll('.container > div').forEach(div => div.classList.remove('active'));
                        document.getElementById(viewId).classList.add('active');
                    }

                    function toggleTestCase(index) {
                        const testCase = document.getElementById(\`testcase-\${index}\`);
                        const arrow = testCase.querySelector('.arrow');
                        const isCollapsed = testCase.classList.contains('collapsed');
                        
                        testCase.classList.toggle('collapsed');
                        arrow.style.transform = isCollapsed ? 'rotate(90deg)' : 'rotate(0deg)';
                    }

                    async function runAllTestCases() {
                        const runAllButton = document.getElementById('runAllButton');
                        runAllButton.disabled = true;
                        runAllButton.innerHTML = '<span class="button-icon">⌛</span> Running...';

                        const testCases = document.querySelectorAll('.test-case');
                        for (let i = 0; i < testCases.length; i++) {
                            const testCase = testCases[i];
                            const index = parseInt(testCase.id.split('-')[1]);
                            await new Promise(resolve => {
                                runTestCase(index);
                                const checkResult = (event) => {
                                    const message = event.data;
                                    if (message.command === 'testCaseResult' && message.index === index) {
                                        window.removeEventListener('message', checkResult);
                                        resolve();
                                    }
                                };
                                window.addEventListener('message', checkResult);
                            });
                        }

                        runAllButton.disabled = false;
                        runAllButton.innerHTML = '<span class="button-icon">▶</span> Run All Tests';
                    }

                    function copyText(button) {
                        const textarea = button.parentElement.nextElementSibling;
                        navigator.clipboard.writeText(textarea.value);
                        
                        const originalText = button.innerHTML;
                        button.innerHTML = '<span class="button-icon">✓</span> Copied!';
                        setTimeout(() => {
                            button.innerHTML = originalText;
                        }, 2000);
                    }

                    function updateTestCaseStatus(index, passed, actualOutput) {
                        const testCase = document.getElementById(\`testcase-\${index}\`);
                        const statusElement = document.getElementById(\`status-\${index}\`);
                        const actualOutputSection = document.getElementById(\`actual-output-\${index}\`);
                        const actualOutputBox = actualOutputSection.querySelector('.actual-output');

                        statusElement.textContent = passed ? 'Accepted' : 'Wrong Answer';
                        statusElement.className = \`test-case-status \${passed ? 'status-accepted' : 'status-wrong'}\`;

                        actualOutputBox.value = actualOutput;
                        actualOutputSection.classList.add('show');
                        autoResize(actualOutputBox);

                        if (!passed && testCase.classList.contains('collapsed')) {
                            toggleTestCase(index);
                        }
                    }

                    function autoResize(textarea) {
                        textarea.style.height = 'auto';
                        textarea.style.height = textarea.scrollHeight + 'px';
                    }

                    function runTestCase(index) {
                        const testCase = document.getElementById(\`testcase-\${index}\`);
                        const input = testCase.querySelector('.input-box').value;
                        const expectedOutput = testCase.querySelector('.output-box').value;
                        
                        const runButton = testCase.querySelector('.run-button');
                        const originalText = runButton.innerHTML;
                        runButton.innerHTML = '<span class="button-icon">⌛</span>';
                        runButton.disabled = true;

                        vscode.postMessage({
                            command: 'runSingle',
                            testCase: { input, expectedOutput, index }
                        });
                    }

                    function deleteTestCase(index) {
                        const testCase = document.getElementById(\`testcase-\${index}\`);
                        testCase.remove();
                    }

                    document.getElementById('fetchButton').addEventListener('click', () => {
                        const url = document.getElementById('leetcodeUrl').value;
                        vscode.postMessage({
                            command: 'fetch',
                            url: url
                        });
                    });

                    document.getElementById('runAllButton').addEventListener('click', runAllTestCases);

                    document.getElementById('addTestCase').addEventListener('click', () => {
                        const container = document.getElementById('testCasesContainer');
                        const currentCount = container.children.length;
                        const newTestCase = createTestCase(currentCount);
                        container.insertAdjacentHTML('beforeend', newTestCase);
                    });

                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.command) {
                            case 'showTestCases':
                                const container = document.getElementById('testCasesContainer');
                                container.innerHTML = message.testCases.inputs.map((input, index) => 
                                    createTestCase(index, input, message.testCases.outputs[index])
                                ).join('');
                                
                                if (message.problemContent) {
                                    const problemContentDiv = document.getElementById('problemContent');
                                    problemContentDiv.innerHTML = message.problemContent;
                                }
                                
                                showView('testCasesView');
                                break;
                            case 'testCaseResult':
                                const runButton = document.querySelector(\`#testcase-\${message.index} .run-button\`);
                                runButton.innerHTML = '<span class="button-icon">▶</span>';
                                runButton.disabled = false;
                                
                                updateTestCaseStatus(
                                    message.index,
                                    message.passed,
                                    message.actualOutput
                                );
                                break;
                        }
                    });

                    document.querySelectorAll('textarea').forEach(textarea => {
                        autoResize(textarea);
                        textarea.addEventListener('input', () => autoResize(textarea));
                    });
                </script>
            </body>
        </html>
    `;
}

module.exports = { getWebviewContent };
