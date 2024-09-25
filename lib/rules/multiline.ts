import { TSESTree } from '@typescript-eslint/types';
import { ESLintUtils } from '@typescript-eslint/utils';

type Options = [{ maxLength: number; debug: boolean }];
type MessageIds = 'no-multiline-imports';

export const multiline = ESLintUtils.RuleCreator.withoutDocs<Options, MessageIds>({
    meta: {
        docs: { description: 'Disallow multiline imports' },
        type: 'suggestion',
        messages: { 'no-multiline-imports': 'Multiline imports are not allowed' },
        schema: [
            {
                type: 'object',
                properties: {
                    maxLength: { type: 'number' },
                    debug: { type: 'boolean' },
                },
                additionalProperties: false,
            },
        ],
        fixable: 'code',
    },
    defaultOptions: [{ maxLength: 100, debug: false }],
    create: (context, options) => {
        const maxLength = options[0].maxLength;
        const constructImportStatements = (imports: string[], source: string) => {
            const importStatements: string[] = [];
            let currentLine = `import { ${imports[0]}`;
            for (let i = 1; i < imports.length; i++) {
                const newLine = `${currentLine}, ${imports[i]}`;
                if (`${newLine} } from ${source};`.length > maxLength) {
                    importStatements.push(`${currentLine} } from ${source};`);
                    currentLine = `import { ${imports[i]}`;
                } else {
                    currentLine = newLine;
                }
            }
            importStatements.push(`${currentLine} } from ${source};`);
            return importStatements.join('\n');
        };
        return {
            ImportDeclaration(node: TSESTree.ImportDeclaration) {
                if (node.loc.start.line !== node.loc.end.line) {
                    context.report({
                        node,
                        messageId: 'no-multiline-imports',
                        fix: (fixer) => {
                            const importText = context.sourceCode.getText(node);
                            const match = importText.match(/import {([\s\S]*?)} from (.*);/);
                            if (match) {
                                const imports = match[1].split(',').map((s) => s.trim());
                                const source = match[2];
                                const importStatements = constructImportStatements(imports, source);
                                return fixer.replaceText(node, importStatements);
                            }
                            return null;
                        },
                    });
                }
            },
        };
    },
});
