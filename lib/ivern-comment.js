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
        lineText;
        commentChar;
        editorLineLength;
        sectionEnd          = false;
        sectionCustomize    = false;
        sectionEndSeperator = '•';
        sectionSeperator    = '\u2500';
        regexLineMatch      = /^\s*([a-z ]|[0-9][0-9\.]|[äöüß\_\-\@\&\+\*\=]*)+\s*$/i;

//
// ──────────────────────────────────────────────────────────────────────────────────── ACTIVATE ───
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
// ────────────────────────────────────────────────────────────────────────────────── DEACTIVATE ───
//

    deactivate() {
      this.subscriptions.dispose();
    }

// ─────────────────────────────────────────────────────────────────────────────────────────────────


//
// ─────────────────────────────────────────────────────────────────── STARTUP & FILL PROPERTIES ───
//

    startUp() {

        //
        // ─── GET EDITOR & LOAD HELPER CLASS ──────────────────────────────────────────────────────
        //

            this.editor = atom.workspace.getActiveTextEditor()

            //
            // RETRUN FAIL IF EDITOR UNDEFINED
            //

            this.Helper = new Helper(this.editor);
            if (this.editor === undefined) {
              return 'fail';
            }


        //
        // ─── GET COMMENT CHAR FOR SPECIFC LANGUAGE ───────────────────────────────────────────────
        //

            this.commentChar = this.Helper.getCommentChar();

            //
            // RETURN FAIL IF LANGUAGE NOT SUPPORTED
            //

            if (this.commentChar === null) {
                atom.notifications.addWarning(
                    `<h2>IVern Comment Error</h2>
                    <p><strong>ivern - comment</strong> can't be used in language: </br>
                    <code>${ this.editor.getGrammar().name }</code></p>`
                );
                return 'fail';
            }

        //
        // ─── CREATE LINE BUFFER RANGE ────────────────────────────────────────────────────────────
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

            this.lineText = this.editor.lineTextForBufferRow(cursorPosition.row);

            //
            // IF LINE HAS NO TEXT - SET SECTION END
            //

            if (this.lineText.trim().length === 0) {
                this.sectionEnd = true;

            //
            // CHECK LINE TEXT
            //

            } else {

                this.sectionEnd = false;

                //
                // IF SECTION HAVE TO CUSTOMIZE
                //

                const t1 = this.commentChar + ' ' + this.Helper.repeatChars(this.sectionSeperator, 3);
                this.sectionCustomize = this.lineText.includes(t1) ? true : false;

                //
                // DONT APPLY SECTION IVERN COMMENT ON CODE
                //

                if (this.regexLineMatch.test(this.lineText) === false && this.sectionCustomize === false) {
                    atom.notifications.addWarning(
                        `<h2>IVern Comment Error</h2>
                        <p>Input text must only contain following characters:</p>
                        <code>[a-z-A-Z-ö-ä-ü-ß]</code>
                        <code>[0-9]</code>
                        <code>[@ & + - _ = *]</code>
                        `,
                        {dismissable: true}
                    );
                    return 'fail';
                }
            }

        //
        // ─── GET IDENT IN LINE ───────────────────────────────────────────────────────────────────
        //

            this.ident = this.Helper.getIdent(cursorPosition);

        //
        // ─── GET DEFAULT EDITOR LINE LENGTH ──────────────────────────────────────────────────────
        //

            this.editorLineLength = this.editor.preferredLineLength;

        //
        // ─── GET DEFAULT LINE ENDING ─────────────────────────────────────────────────────────────
        //

            this.lineEnding = this.Helper.getLineEnding()

        return true;

    }

//
// ─────────────────────────────────────────────────────────────────────── START SECTION COMMENT ───
//

    section(reverse = false) {

        //
        // ─── RUN STARTUP ─────────────────────────────────────────────────────────────────────────
        //

            if (this.startUp() === 'fail') {
                return;
            }

        //
        // ─── GENEARTE & INSERT ───────────────────────────────────────────────────────────────────
        //

            if (this.sectionEnd) {
                this.generateSectionEnd()
            } else {
                this.generateSection(reverse)
            }

    }

//
// ────────────────────────────────────────────── CREATE OR CUSTOMIZE SECTION OR REVERSE COMMENT ───
//

    generateSection(reverse) {

        //
        // ─── PREPARE LINE TEXT, IF SECTION HAVE TO CUSTOMIZE ─────────────────────────────────────
        //

            if (this.sectionCustomize) {
                r1 = new RegExp(this.sectionSeperator,'g');
                this.lineText = this.lineText.replace(this.commentChar, '');
                this.lineText = this.lineText.replace(r1, '');
            }

        //
        // ─── TRIM & UPPERCASE ────────────────────────────────────────────────────────────────────
        //

            const comment = this.lineText.toUpperCase().trim();

        //
        // ─── CREATE IN SECTION COMMENT ───────────────────────────────────────────────────────────
        //

            if (this.Helper.getIdentLength(this.ident) >= 12) {

                leadingChars = this.Helper.repeatChars(this.sectionSeperator, 3);
                first        = this.ident + this.commentChar + this.lineEnding;
                secound      = this.ident + this.commentChar + ' ' + comment + this.lineEnding;
                third        = this.ident + this.commentChar;

        //
        // ─── CREATE SECTION COMMENT ──────────────────────────────────────────────────────────────
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

                first = this.ident + this.commentChar + this.lineEnding;

                secound  = this.ident + this.commentChar + ' ';
                secound += (reverse ? leastChars : leadingChars) + ' ';
                secound += comment + ' ' + (reverse ? leadingChars : leastChars);
                secound += (this.sectionCustomize ? '' : this.lineEnding);

                third = this.ident + this.commentChar;
            }

        //
        // ─── INSERT COMMENT ──────────────────────────────────────────────────────────────────────
        //

            if (this.sectionCustomize) {
                this.editor.setTextInBufferRange(this.range, secound);
            } else {
                this.editor.setTextInBufferRange(this.range, first + secound + third);
                this.editor.insertNewline();
            }
    }


//
// ──────────────────────────────────────────────────────────────────────── GENERATE SECTION END ───
//

    generateSectionEnd() {

        //
        // ─── CREATE IN SECTION ───────────────────────────────────────────────────────────────────
        //

            if (this.Helper.getIdentLength(this.ident) >= 12) {
                line  = this.ident + this.commentChar + ' ';
                line += this.Helper.repeatChars(this.sectionEndSeperator, 5) + this.lineEnding;

        //
        // ─── CREATE SECTION ──────────────────────────────────────────────────────────────────────
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
        // ─── INSERT COMMENT ──────────────────────────────────────────────────────────────────────
        //

            this.editor.setTextInBufferRange(this.range, line);
            this.editor.insertNewline();
    }

}

//
// ─────────────────────────────────────────────────────────────────────── EXPORT CLASS FOR ATOM ───
//

    export default new Ivern_Comment();
