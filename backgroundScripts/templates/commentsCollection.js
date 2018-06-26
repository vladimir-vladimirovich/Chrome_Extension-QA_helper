import {environment} from "../config/projectProperties.js";

export let commentsCollection = {
        /**
         * This file contains configuration for text
         * that will be pasted after click on context menu item
         */
        passed:  {
            id: "commentPassed",
            text: '{panel:title=PT QA Test Results|borderColor=#828282|titleBGColor=#7EC45C|bgColor=#E1FADE}\n' +
            '| *Test status:* | Passed (/) |\n' +
            '| *Test scope\\Notes:* |  |\n' +
            '| *Device\\OS\\Browser:* |  |\n' +
            `| *Env URL:* | ${environment.defaultEnvironmentURL} |\n`
        },
        failed: {
            id: "commentFailed",
            text: '{panel:title=PT QA Test Results|borderColor=#828282|titleBGColor=#ff7f7f|bgColor=#FFF4F0}\n' +
            '| *Test status:* | Failed (x) |\n' +
            '| *Test scope\\Notes:* |  |\n' +
            '| *Device\\OS\\Browser:* |  |\n' +
            `| *Env URL:* | ${environment.defaultEnvironmentURL} |\n`
        },
        midState: {
            id: "commentMidState",
            text: '{panel:title=PT QA Test Results|borderColor=#828282|titleBGColor=#f4d942|bgColor=#E1FADE}\n' +
            '| *Test status:* | Test is partly OK |\n' +
            '| *Test scope\\Notes:* |  |\n' +
            '| *Device\\OS\\Browser:* |  |\n' +
            `| *Env URL:* | ${environment.defaultEnvironmentURL} |\n`
        },
        description: {
            id: "description",
            text: '*STR:*\n' +
            `# Open ${environment.defaultEnvironmentURL} \n` +
            '\n' +
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