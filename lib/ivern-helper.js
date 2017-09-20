'use babel';

export class Helper {

//
// ────────────────────────────────────────────────────────────────────────────────── PROPERTIES ───
//

    editor;

//
// ───────────────────────────────────────────────────────────────────────────────── CONSTRUCTOR ───
//

    constructor(editor) {
        this.editor = editor;
    }

//
// ───────────────────────────────────────────────────────────────────────── RETURN COMMENT CHAR ───
//

    getCommentChar() {
        switch ( this.editor.getGrammar().name.toLowerCase() ) {
            case 'arendelle':
            case 'cpp':
            case 'csharp':
            case 'fsharp':
            case 'go':
            case 'groovy':
            case 'haxe':
            case 'java':
            case 'javascript':
            case 'javascriptreact':
            case 'jison':
            case 'json':
            case 'karyscript':
            case 'less':
            case 'objective-c':
            case 'pageman':
            case 'pegjs':
            case 'php':
            case 'processing':
            case 'qml':
            case 'rust':
            case 'scala':
            case 'stylus':
            case 'swift':
            case 'typescript':
            case 'typescriptreact':
            case 'uno':
            case 'yuml':
                return '//';

            case 'bash':
            case 'coffeescript':
            case 'fish':
            case 'julia':
            case 'make':
            case 'makefile':
            case 'nearley':
            case 'perl':
            case 'powershell':
            case 'python':
            case 'r':
            case 'ruby':
            case 'shell':
            case 'shellscript':
            case 'yaml':
            case 'yml':
                return '#';

            case 'latex':
            case 'matlab':
            case 'octave':
            case 'tex':
                return '%';

            case 'elm':
            case 'haskell':
            case 'lua':
            case 'sql':
                return '--';

            case 'clojure':
            case 'lisp':
            case 'racket':
            case 'scheme':
                return ';;;';

            case 'bat':
                return '::';

            case 'vb':
                return "'";

            case 'plaintext':
            case 'plain text':
                return '\u2500' + '\u2500';

            default:
                return null;
        }
    }

//
// ────────────────────────────────────────────────────────────────────── CREATE IDENT AS STRING ───
//

    getIdent(cursorPosition) {
        let ident = '';
        const tabLength  = this.editor.getTabLength();
        const identLevel = this.editor.indentationForBufferRow(cursorPosition.row);

        if (this.editor.softTabs) {
            for (var i = 0; i < identLevel; i++) {
                for (var j = 0; j < tabLength; j++) {
                    ident += ' ';
                }
            }
        } else {
            for (var i = 0; i < identLevel; i++) {
                ident += '\t';
            }
        }

        return ident;
    }

//
// ───────────────────────────────────────────────────────────────────────── GET LENGTH OF IDENT ───
//

	getIdentLength(ident) {
		let length = 0;
		const tabLength  = this.editor.getTabLength();

		if (this.editor.softTabs) {
			return ident.length;
        } else {
			return ident.length * tabLength;
        }
	}

//
// ───────────────────────────────────────────────────────────────────────────────── REPEATCHARS ───
//

    repeatChars(text, times) {
        let result = '';
        for ( let index = 0; index < times; index ++ ) {
            result += text;
        }
        return result;
    }

//
// ─────────────────────────────────────────────────────────── RETURN EDITOR DEFAULT LINE ENDING ───
//

    getLineEnding() {
        switch (atom.config.get('line-ending-selector.defaultLineEnding')) {
            case 'LF':
                return '\n'
            case 'CRLF':
                return '\r\n'
            case 'OS Default':
                default:
                    return (process.platform === 'win32') ? '\r\n' : '\n'
            }
    }
}
