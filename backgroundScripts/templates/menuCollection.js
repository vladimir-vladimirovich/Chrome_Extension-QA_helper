export let menuCollection = {
    /**
     * This file contains configuration for context menus
     */
    CPH: {
        "id": "CPH",
        "title": "CPH",
        "contexts": ["all"]
    },
    comments: {
        "id": "comments",
        "title": "comments>",
        "contexts": ["all"],
        "parentId": "CPH"
    },
    passed: {
        "id": "commentPassed",
        "title": "passed",
        "contexts": ["all"],
        "parentId": "comments"
    },
    failed: {
        "id": "commentFailed",
        "title": "failed",
        "contexts": ["all"],
        "parentId": "comments"
    },
    midState: {
        "id": "commentMidState",
        "title": "midState",
        "contexts": ["all"],
        "parentId": "comments"
    },
    description: {
        "id": "description",
        "title": "description",
        "contexts": ["all"],
        "parentId": "CPH"
    }
};