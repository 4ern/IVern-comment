'use babel';

import { CompositeDisposable, Range } from 'atom';
import { Helper } from './ivern-helper'

class Ivern_Comment {

//
// ────────────────────────────────────────────────────────────────────────────────── PROPERTIES ───
//

        Helper;
        range;
        ident;
        editor;
        lineEnding;
        commentText;
        commentChar;
        editorLineLength;
        sectionEnd = false;
        sectionEndSeperator = '•';
        sectionSeperator = '\u2500';
        regexLineMatch = /^\s*([a-z ]|[0-9][0-9\.]|[äöüß\_\-\@\&\+\*\=]*)+\s*$/i;

//
// ────────────────────────────────────────────────────────────────────── TRIGGER IVERN COMMENT ────
//

    activate(state) {
        this.subscriptions = new CompositeDisposable();

        //
        // ─── TRIGGER SECTION COMMENT ─────────────────────────────────────────────────────────────
        //

            this.subscriptions.add(atom.commands.add('atom-workspace', {
              'ivern-comment:section': () => this.section()
            }));

        //
        // ─── TRIGGER REVERSE SECTION COMMENT ─────────────────────────────────────────────────────
        //

            this.subscriptions.add(atom.commands.add('atom-workspace', {
              'ivern-comment:reverse-section': () => this.section(true)
            }));

    }

//
// ─────────────────────────────────────────────────────────────────────── DISABLE IVERN COMMENT ───
//

    deactivate() {
      this.subscriptions.dispose();
    }

// ─────────────────────────────────────────────────────────────────────────────────────────────────



//
// ─────────────────────────────────────────────────────────────── STARTUP & FILL ALL PROPERTIES ───
//

    startUp() {

        //
        // ─── GET ACTIVE EDITOR & LOAD HELPER CLASS ───────────────────────────────────────────────
        //

            this.editor = atom.workspace.getActiveTextEditor()

            //
            // RETURN IF ACTIVE EDITOR UNDEFINED
            //

            this.Helper = new Helper(this.editor);
            if (this.editor === undefined) {
              return false;
            }


        //
        // ─── GET COMMENT CHAR FOR SPECIFC LANGUAGE ───────────────────────────────────────────────
        //

            this.commentChar = this.Helper.getCommentChar();

            //
            // RETURN IF LANGUAGE NOT SUPPORTED
            //

            if (this.commentChar === null) {
                atom.notifications.addWarning(
                    `<h2>IVern Comment Error</h2>
                    <p><strong>ivern - comment</strong> can't be used in language: </br>
                    <code>${ this.editor.getGrammar().name }</code></p>`
                );
                return false;
            }

        //
        // ─── GET LINE BUFFER RANGE ───────────────────────────────────────────────────────────────
        //

            this.editor.moveToEndOfLine();
            const cursorPosition  = this.editor.getSelections()[0].cursor.getBufferPosition();
            this.range = new Range(
                    [cursorPosition.row, 0],
                    [cursorPosition.row, cursorPosition.column]
                );

        //
        // ─── GET LINE TEXT ───────────────────────────────────────────────────────────────────────
        //

            this.commentText = this.editor.lineTextForBufferRow(cursorPosition.row);

            //
            // IF LINE HAS NO TEXT - SET SECTION END
            //

            if (this.commentText.trim().length === 0) {
                this.sectionEnd = true;

            //
            // CHECK LINE INPUT
            //

            } else {

                // set section
                this.sectionEnd = false;

                // check regex
                if (this.regexLineMatch.test(this.commentText) === false) {
                    atom.notifications.addWarning(
                        `<h2>IVern Comment Error</h2>
                        <p>Input text must only contain following characters:</p>
                        <code>[a-z-A-Z-ö-ä-ü-ß]</code>
                        <code>[0-9]</code>
                        <code>[@ & + - _ = *]</code>
                        `,
                        {dismissable: true}
                    );
                    return false;
                }
            }

        //
        // ─── GET IDENT IN LINE ───────────────────────────────────────────────────────────────────
        //

            console.log('blub?');
            this.ident = this.Helper.getIdent(cursorPosition);

        //
        // ─── GET DEFAULT EDITOR LINE LENGTH ──────────────────────────────────────────────────────
        //

            this.editorLineLength = this.editor.preferredLineLength;

        //
        // ─── GET DEFAULT LINEENDING ──────────────────────────────────────────────────────────────
        //

            this.lineEnding = this.Helper.getLineEnding()


        return true;

    }


//
// ──────────────────────────────────────────────────────────────────── GENERATE SECTION COMMENT ───
//

    section(reverse = false) {

        //
        // ─── FILL PROPERTIES ─────────────────────────────────────────────────────────────────────
        //

            if (this.startUp() === false) {
                return;
            }

        //
        // ─── INSERT SECTION COMMENT ──────────────────────────────────────────────────────────────
        //

            if (this.sectionEnd) {
                this.generateSectionEdComment()
            } else {
                this.generateSectionComment(reverse)
            }

        // ─────────────────────────────────────────────────────────────────────────────────────────

    }

//
// ─────────────────────────────────────────────────────── GENRATE SECTION OR IN SECTION COMMENT ───
//

    generateSectionComment(reverse) {

        //
        // ─── GET LINE TEXT ───────────────────────────────────────────────────────────────────────
        //

            const comment = this.commentText.toUpperCase().trim();


        //
        // ─── CREATE IN SECTION COMMENT ───────────────────────────────────────────────────────────
        //

            if (this.Helper.getIdentLength(this.ident) >= 12) {

                const leadingChars = this.Helper.repeatChars(this.sectionSeperator, 3);
                first   = this.ident + this.commentChar + this.lineEnding;
                secound = this.ident + this.commentChar + ' ' + comment + this.lineEnding;
                third   = this.ident + this.commentChar;

        //
        // ─── CREATE SECTIONCOMMENT ───────────────────────────────────────────────────────────────
        //

            } else {

                const leadingChars = this.Helper.repeatChars(this.sectionSeperator, 3);
                const leastChars   = this.Helper.repeatChars(this.sectionSeperator,
                    this.editorLineLength -
                    (
                        this.commentChar.length +
                        comment.length +
                        this.Helper.getIdentLength(this.ident) +
                        6
                    ));

                first    = this.ident + this.commentChar + this.lineEnding;
                third    = this.ident + this.commentChar;

                if (reverse) {
                    secound  = this.ident + this.commentChar + ' ' + leastChars + ' ';
                    secound += comment + ' ' + leadingChars + this.lineEnding;
                } else {
                    secound  = this.ident + this.commentChar + ' ' + leadingChars + ' ';
                    secound += comment + ' ' + leastChars + this.lineEnding;
                }

            }

        //
        // ─── SET COMMENT IN LINE ─────────────────────────────────────────────────────────────────
        //

            this.editor.setTextInBufferRange(this.range, first + secound + third);
            this.editor.insertNewline();

    }


//
// ──────────────────────────────────────────────────────────────────────── GENERATE SECTION END ───
//

    generateSectionEdComment() {

        //
        // ─── CREATE IN SECTION COMMENT ───────────────────────────────────────────────────────────
        //

            if (this.Helper.getIdentLength(this.ident) >= 12) {
                line  = this.ident + this.commentChar + ' ';
                line += this.Helper.repeatChars(this.sectionEndSeperator, 5) + this.lineEnding;

        //
        // ─── CREATE SECTIONCOMMENT ───────────────────────────────────────────────────────────────
        //

            } else {

                const seperator = this.Helper.repeatChars(this.sectionSeperator,
                    this.editorLineLength -
                    (
                        this.commentChar.length +
                        this.Helper.getIdentLength(this.ident) + 1
                    ));

                line = this.ident + this.commentChar + ' ' + seperator + this.lineEnding;
            }

        //
        // ─── SET COMMENT IN LINE ─────────────────────────────────────────────────────────────────
        //

            this.editor.setTextInBufferRange(this.range, line);
            this.editor.insertNewline();
    }

}

//
// ─────────────────────────────────────────────────────────────────────── EXPORT CLASS FOR ATOM ───
//

    export default new Ivern_Comment();
