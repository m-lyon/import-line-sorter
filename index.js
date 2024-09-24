// This plugin sorts imports, first by splittng up multi line imports into separate lines,
// then sorts groups of imports by line length in ascending order.

module.exports = {
    meta: {
        name: 'import-line-sorter',
        version: '1.0.0',
    },
    rules: {
        'import-length-sort': {
            meta: {
                type: 'suggestion',
                docs: {
                    description: 'Sort import groups by line length and split multiline imports',
                },
                fixable: 'code',
            },
            create(context) {
                const sourceCode = context.getSourceCode();
                const maxLength = context.options[0]?.maxLength || 100;

                function validateImports(node) {
                    const importStatements = node.body.filter(
                        (n) => n.type === 'ImportDeclaration'
                    );

                    // check if each line is greater than the max length
                    for (let i = 0; i < importStatements.length; i++) {
                        const importStatement = importStatements[i];
                        const importText = sourceCode.getText(importStatement);
                        if (importText.length > context.options[0]?.maxLength) {
                            return false;
                        }
                        if (importText.match(/\n/)) {
                            return false;
                        }
                    }
                    return true;
                }

                function groupImports(node) {
                    const importStatements = node.body.filter(
                        (n) => n.type === 'ImportDeclaration'
                    );

                    let currentGroup = [importStatements[0]]; // Start with the first import
                    const groupedImports = [currentGroup];

                    for (let i = 1; i < importStatements.length; i++) {
                        const prevImport = importStatements[i - 1];
                        const currentImport = importStatements[i];

                        const prevLine = prevImport.loc.end.line;
                        const currentLine = currentImport.loc.start.line;

                        if (currentLine - prevLine > 1) {
                            // If there's a newline between the imports, start a new group
                            currentGroup = [currentImport];
                            groupedImports.push(currentGroup);
                        } else {
                            // Otherwise, add to the current group
                            currentGroup.push(currentImport);
                        }
                    }
                    return groupedImports;
                }

                function splitImports(group) {
                    const splitImports = [];
                    const multilineRegex = /import {([\s\S]*?)} from (.*);/;
                    for (let i = 0; i < group.length; i++) {
                        const importText = sourceCode.getText(group[i]);
                        const match = importText.match(multilineRegex);
                        if (match) {
                            const imports = match[1].split(',').map((imp) => imp.trim());
                            const fromPath = match[2];
                            imports.forEach((imp) => {
                                if (imp.length > 0) {
                                    splitImports.push({ import: imp, from: fromPath });
                                }
                            });
                        } else {
                            // extract the import and the fromPath
                            const importRegex = /import (.*) from (.*);/;
                            const match = importText.match(importRegex);
                            splitImports.push({ import: match[1], from: match[2] });
                        }
                    }
                    return splitImports;
                }

                function groupSamePathImports(group) {
                    // Group imports with the same path, group object is an array of objects
                    const pathGroups = {};
                    for (let i = 0; i < group.length; i++) {
                        const currentImport = group[i];
                        if (pathGroups[currentImport.from]) {
                            pathGroups[currentImport.from].push(currentImport.import);
                        } else {
                            pathGroups[currentImport.from] = [currentImport.import];
                        }
                    }

                    // sort each pathGroup list alphabetically
                    for (const path in pathGroups) {
                        pathGroups[path].sort();
                    }
                    return pathGroups;
                }

                function constructImportStatements(pathGroups) {
                    // construct the import statements from the pathGroups array.
                    // At each step, we add an import statement, then check to see if the
                    // new line length exceeds the maximum length. If it does,
                    // we instead start a new import statement.
                    const importStatements = [];
                    for (const path in pathGroups) {
                        const imports = pathGroups[path];
                        let currentLine = `import { ${imports[0]}`;
                        for (let i = 1; i < imports.length; i++) {
                            const newLine = `${currentLine}, ${imports[i]}`;
                            if (`${newLine} } from ${path};`.length > maxLength) {
                                importStatements.push(`${currentLine} } from ${path};`);
                                currentLine = `import { ${imports[i]}`;
                            } else {
                                currentLine = newLine;
                            }
                        }
                        importStatements.push(`${currentLine} } from ${path};`);
                    }
                    // then sort the import statements by line length
                    importStatements.sort((a, b) => a.length - b.length);
                    return importStatements;
                }

                function applyChanges(groups, importStatements) {
                    for (let i = 0; i < groups.length; i++) {
                        const group = groups[i];
                        const importStatement = importStatements[i];
                        const firstImport = group[0];
                        const lastImport = group[group.length - 1];
                        context.report({
                            node: firstImport,
                            message: 'Imports should be sorted by line length.',
                            fix(fixer) {
                                return fixer.replaceTextRange(
                                    [firstImport.range[0], lastImport.range[1]],
                                    importStatement.join('\n')
                                );
                            },
                        });
                    }
                }

                return {
                    Program(node) {
                        // First determine if any changes are needed
                        if (validateImports(node)) {
                            return;
                        }
                        const groups = groupImports(node);
                        const splitGroups = groups.map((group) => splitImports(group));
                        const pathGroups = splitGroups.map((group) => groupSamePathImports(group));
                        const importStatements = pathGroups.map((group) =>
                            constructImportStatements(group)
                        );
                        applyChanges(groups, importStatements);
                    },
                };
            },
        },
    },
};
