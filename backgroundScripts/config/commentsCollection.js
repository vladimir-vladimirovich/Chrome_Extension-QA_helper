define({
    /**
     * This file contains configuration for text
     * that will be pasted after click on context menu
     */
    passed: {
        id: "commentPassed",
        text: '{panel:title=PT QA Test Results|borderColor=#828282|titleBGColor=#7EC45C|bgColor=#E1FADE}\n' +
        '| *Test status:* | Passed (/) |\n' +
        '| *Test scope\\Notes:* |  |\n' +
        '| *Device\\OS\\Browser:* |  |\n' +
        '| *Env URL:* |  |\n' +
        '| *Version stamp:* |  |\n' +
        '{panel}'
    },
    failed: {
        id: "commentFailed",
        text: '{panel:title=PT QA Test Results|borderColor=#828282|titleBGColor=#ff7f7f|bgColor=#FFF4F0}\n' +
        '| *Test status:* | Failed (x) |\n' +
        '| *Test scope\\Notes:* |  |\n' +
        '| *Device\\OS\\Browser:* |  |\n' +
        '| *Env URL:* |  |\n' +
        '| *Version stamp:* |  |\n' +
        '{panel}'
    },
    midState: {
        id: "commentMidState",
        text: '{panel:title=PT QA Test Results|borderColor=#828282|titleBGColor=#f4d942|bgColor=#E1FADE}\n' +
        '| *Test status:* | Test is partly OK |\n' +
        '| *Test scope\\Notes:* |  |\n' +
        '| *Device\\OS\\Browser:* |  |\n' +
        '| *Env URL:* |  |\n' +
        '| *Version stamp:* |  |\n' +
        '{panel}'
    },
    description: {
        id: "description",
        text: '*STR:*\n' +
        '# Open https://wpl-licensee76-admin.ptdev.eu/\n' +
        '\n' +
        '*AR:* \n' +
        '# \n' +
        '# For more details view attachment [^]\n' +
        '\n' +
        '*ER:* \n' +
        '\n' +
        '*Found on:*\n' +
        '\n' +
        '*Environment details:*\n' +
        'https://wpl-licensee76-admin.ptdev.eu/\n'
    }
});