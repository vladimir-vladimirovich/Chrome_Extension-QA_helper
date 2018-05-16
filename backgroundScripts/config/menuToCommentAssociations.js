define([
        'config/menuCollection',
        'config/commentsCollection'
],
    function (menuCollection, commentsCollection) {

        /**
         * This object contains information about relations
         * between menu item and text that will be
         * pasted after click on this menu item
         */
    return {
        commentPositive: {
            id: menuCollection.comments.positive.id,
            text: commentsCollection.comments.positive
        },
        commentNegative: {
            id: menuCollection.comments.negative.id,
            text: commentsCollection.comments.negative
        },
        commentModerate: {
            id: menuCollection.comments.moderate.id,
            text: commentsCollection.comments.moderate
        },
        description: {
            id: menuCollection.description.id,
            text: commentsCollection.description
        }
    };
});