import { TSESTree } from '@typescript-eslint/types';
import { ESLintUtils } from '@typescript-eslint/utils';

type Options = [{ debug: boolean }];
type MessageIds = 'sort-imports';

export const sorter = ESLintUtils.RuleCreator.withoutDocs<Options, MessageIds>({
    meta: {
        docs: { description: 'Sort imports' },
        type: 'suggestion',
        messages: { 'sort-imports': 'Imports are not sorted by line length' },
        schema: [
            {
                type: 'object',
                properties: {
                    debug: { type: 'boolean' },
                },
                additionalProperties: false,
            },
        ],
        fixable: 'code',
    },
    defaultOptions: [{ debug: false }],
    create: (context) => {
        const groupImports = (node: TSESTree.Program) => {
            // group imports by spaces between them
            const singleLineRegex =
                /^(import|export|import\s+type|export\s+type)\s*{\s*[^}\n]+\s*}\s*from\s*['"][^'\n"]+['"];?\s*$/;
            const nodes = node.body.filter((n) =>
                ['ImportDeclaration', 'ExportNamedDeclaration'].includes(n.type)
            );
            const singleLines = nodes.filter((n) =>
                singleLineRegex.test(context.sourceCode.getText(n))
            );

            let currentGroup = [singleLines[0]];
            const groups = [currentGroup];

            for (let i = 1; i < singleLines.length; i++) {
                const previousNode = singleLines[i - 1];
                const currentNode = singleLines[i];
                if (!previousNode || !currentNode) {
                    continue;
                }
                if (currentNode.loc.start.line - previousNode.loc.end.line <= 1) {
                    currentGroup.push(currentNode);
                } else {
                    currentGroup = [currentNode];
                    groups.push(currentGroup);
                }
            }
            return groups;
        };
        return {
            Program(node: TSESTree.Program) {
                const groups = groupImports(node);
                for (const group of groups) {
                    const sortedGroup = group.slice().sort((a, b) => {
                        const aLength = context.sourceCode.getText(a).length;
                        const bLength = context.sourceCode.getText(b).length;
                        return aLength - bLength;
                    });
                    if (group.some((n, i) => n !== sortedGroup[i])) {
                        context.report({
                            node: group[0],
                            messageId: 'sort-imports',
                            fix: (fixer) => {
                                const sortedImportText = sortedGroup
                                    .map((n) => context.sourceCode.getText(n))
                                    .join('\n');
                                return fixer.replaceTextRange(
                                    [group[0].range[0], group[group.length - 1].range[1]],
                                    sortedImportText
                                );
                            },
                        });
                    }
                }
            },
        };
    },
});
