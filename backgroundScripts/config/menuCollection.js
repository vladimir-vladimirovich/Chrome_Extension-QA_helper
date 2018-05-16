define({
    /**
     * This file contains configuration for context menus
     */
    CPH: {
        "id": "CPH",
        "title": "CPH",
        "contexts": ["all"]
    },
    comments: {
        comments: {
            "id": "comments",
            "title": "comments>",
            "contexts": ["all"],
            "parentId": "CPH"
        },
        positive: {
            "id": "commentPositive",
            "title": "positive",
            "contexts": ["all"],
            "parentId": "comments"
        },
        negative: {
            "id": "commentNegative",
            "title": "negative",
            "contexts": ["all"],
            "parentId": "comments"
        },
        moderate: {
            "id": "commentModerate",
            "title": "moderate",
            "contexts": ["all"],
            "parentId": "comments"
        }
    },
    description: {
        "id": "description",
        "title": "description",
        "contexts": ["all"],
        "parentId": "CPH"
    }
});