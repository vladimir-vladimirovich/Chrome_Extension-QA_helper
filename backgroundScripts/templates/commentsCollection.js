export let commentsCollection = {
        /**
         * This file contains configuration for text
         * that will be pasted after click on context menu item
         */
        passed:  {
            id: "commentPassed",
            text: '{panel:title=PT QA Test Results|borderColor=#828282|titleBGColor=#7EC45C|bgColor=#E1FADE}\n' +
            '| *Test status:* | Pass (/) |\n' +
            '| *Test scope\\Notes:* |  |\n'
        },
        failed: {
            id: "commentFailed",
            text: '{panel:title=PT QA Test Results|borderColor=#828282|titleBGColor=#ff7f7f|bgColor=#FFF4F0}\n' +
            '| *Test status:* | Fail (x) |\n' +
            '| *Test scope\\Notes:* |  |\n'
        },
        midState: {
            id: "commentMidState",
            text: '{panel:title=PT QA Test Results|borderColor=#828282|titleBGColor=#f4d942|bgColor=#E1FADE}\n' +
            '| *Test status:* | Test is partly OK |\n' +
            '| *Test scope\\Notes:* |  |\n'
        },
        description: {
            id: "description",
            text: '\n' +
            '*AR:* \n' +
            '# \n' +
            '# For more details view attachment [^]\n' +
            '\n' +
            '*ER:* \n' +
            '\n' +
            '*Found on:*\n' +
            '\n' +
            '*Environment details:* \n'
        }
    };