function getStyles() {
  return `
        :root {
            --primary-color: #2563eb;
            --secondary-color: #3b82f6;
            --success-color: #059669;
            --error-color: #dc2626;
            --border-radius: 8px;
            --transition-speed: 0.3s;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        body {
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif);
            font-size: 13px;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }

        .container {
            padding: 24px;
            height: 100vh;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: var(--vscode-scrollbarSlider-background) transparent;
        }

        .header {
            margin-bottom: 32px;
            text-align: center;
        }

        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin: 0;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.5px;
        }

        .header-subtitle {
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }

        .attribution {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-top: 8px;
            font-style: italic;
        }

        .input-group {
            max-width: 600px;
            margin: 0 auto 32px;
        }

        .input-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--vscode-foreground);
        }

        .url-input-wrapper {
            display: flex;
            gap: 12px;
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: var(--border-radius);
            padding: 4px;
            transition: border-color var(--transition-speed);
        }

        .url-input-wrapper:focus-within {
            border-color: var(--primary-color);
        }

        .url-input {
            flex: 1;
            background: transparent;
            border: none;
            color: var(--vscode-input-foreground);
            padding: 8px 12px;
            font-size: 14px;
            outline: none;
        }

        .fetch-button {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: var(--border-radius);
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: filter var(--transition-speed);
        }

        .fetch-button:hover {
            filter: brightness(1.1);
        }

        .button-icon {
            font-size: 14px;
        }

        .test-case {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: var(--border-radius);
            margin-bottom: 20px;
            overflow: hidden;
            transition: all var(--transition-speed);
            box-shadow: var(--shadow-sm);
        }

        .test-case:hover {
            box-shadow: var(--shadow-md);
            border-color: var(--secondary-color);
        }

        .test-case-header {
            background: linear-gradient(to right, var(--vscode-sideBarSectionHeader-background), transparent);
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .test-case-summary {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
        }

        .test-case-actions {
            display: flex;
            gap: 8px;
            opacity: 0.8;
            transition: opacity var(--transition-speed);
        }

        .test-case:hover .test-case-actions {
            opacity: 1;
        }

        .run-button {
            background-color: var(--success-color);
            color: white;
            border: none;
            padding: 6px;
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: filter var(--transition-speed);
        }

        .run-button:hover {
            filter: brightness(1.1);
        }

        .delete-button {
            background-color: transparent;
            color: var(--error-color);
            border: none;
            padding: 6px;
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: background-color var(--transition-speed);
        }

        .delete-button:hover {
            background-color: rgba(220, 38, 38, 0.1);
        }

        .test-case-content {
            padding: 20px;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }

        .section-header span {
            font-weight: 500;
            color: var(--vscode-foreground);
        }

        .input-box, .output-box {
            width: 100%;
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: var(--border-radius);
            padding: 12px;
            color: var(--vscode-input-foreground);
            font-family: var(--vscode-editor-font-family, 'Consolas', monospace);
            font-size: 13px;
            line-height: 1.5;
            resize: vertical;
            min-height: 80px;
            transition: border-color var(--transition-speed);
        }

        .input-box:focus, .output-box:focus {
            border-color: var(--primary-color);
            outline: none;
        }

        .test-case-status {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-accepted {
            background-color: var(--success-color);
            color: white;
        }

        .status-wrong {
            background-color: var(--error-color);
            color: white;
        }

        .problem-section {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: var(--border-radius);
            margin-bottom: 24px;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            transition: all var(--transition-speed);
        }

        .problem-section:hover {
            box-shadow: var(--shadow-md);
            border-color: var(--secondary-color);
        }

        .problem-header {
            background: linear-gradient(to right, var(--vscode-sideBarSectionHeader-background), transparent);
            padding: 16px;
            cursor: pointer;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .problem-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            font-size: 15px;
            color: var(--vscode-foreground);
        }

        .arrow {
            transition: transform var(--transition-speed);
            font-size: 12px;
            color: var(--secondary-color);
        }

        .problem-content {
            padding: 20px;
            font-size: 14px;
            line-height: 1.6;
            display: none;
        }

        .problem-content.show {
            display: block;
            animation: slideDown var(--transition-speed) ease-out;
        }

        .problem-content pre {
            background: var(--vscode-textBlockQuote-background);
            padding: 16px;
            border-radius: var(--border-radius);
            overflow-x: auto;
            margin: 16px 0;
            border: 1px solid var(--vscode-panel-border);
        }

        .problem-content code {
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 13px;
        }

        .run-all-button {
            background: linear-gradient(135deg, var(--success-color), #10b981);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: var(--border-radius);
            font-size: 14px;
            font-weight: 500;
            width: 100%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 24px;
            transition: filter var(--transition-speed);
        }

        .run-all-button:hover {
            filter: brightness(1.1);
        }

        .run-all-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .add-testcase-button {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: var(--border-radius);
            font-size: 14px;
            font-weight: 500;
            width: 100%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 20px;
            transition: filter var(--transition-speed);
        }

        .add-testcase-button:hover {
            filter: brightness(1.1);
        }

        .copy-button {
            background: transparent;
            color: var(--vscode-textLink-foreground);
            border: 1px solid var(--vscode-textLink-foreground);
            padding: 4px 8px;
            border-radius: var(--border-radius);
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all var(--transition-speed);
        }

        .copy-button:hover {
            background: var(--vscode-textLink-foreground);
            color: var(--vscode-editor-background);
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-8px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
}

module.exports = { getStyles };
