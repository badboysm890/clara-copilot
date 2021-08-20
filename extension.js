const vscode = require('vscode');
const superagent = require("superagent")

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {

    const editor = vscode.window.activeTextEditor;

    async function findSnippets(data, selections) {
        console.log('it was called')

        //validation for no text being selected
        if (data.length == 0){
            vscode.window.showWarningMessage("No text selected! Please select some text to get snippet")
        }
        const forumURL = "https://www.codegrepper.com/api/search.php?q=" + data + "&search_options=search_titles";
        // callbacks
        superagent
            .get(forumURL)
            .end((error, response) => {
                let data = JSON.parse(response.text);
                console.log(data)
                if (data["answers"].length == 0) {
                    vscode.window.showWarningMessage("Server returned no code - Search with words that are simple !!")
                }

                editor.edit(editBuilder => {
                    editBuilder.replace(selections, String(data["answers"].map(result => {
                        return `${result['answer']}\n/******************************/\n`
                    })));
                });
            })
    }

    let disposable = vscode.commands.registerCommand('clara-copilot.searchcode', async function() {

        if (editor) {
            const document = editor.document;
            const selection = editor.selection;

            const word = document.getText(selection);
            await findSnippets(word, selection);

        }

    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
