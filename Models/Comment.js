const db = require('../db/db');
const FilterSortService = require('../services/FilterSort-service');
const config = require('../config.json');

class Comment {
    addComment(comment) {
        return db.query('INSERT INTO comment SET ?', comment);
    }

    getCommentById(comment_id) {
        return db.query('SELECT * FROM comment WHERE comment_id = ?', comment_id);
    }

    changeCommentById(comment) {
        return db.query('UPDATE comment SET ? WHERE comment_id = ?', [comment, comment.comment_id]);
    }

    getListCommentsToEvent(page, date, search, sort, event_id) {
        const maxCommentOnPage = config.comment.maxCommentOnPage;
    
        const startingLimit = (page - 1) * maxCommentOnPage;

        return db.query(FilterSortService.commentFilterSort(date, search, sort, event_id, '') +
            ` LIMIT ${db.escape(startingLimit)}, ${db.escape(maxCommentOnPage)} `);
    }

    getAllCommentsToEvent(date, search, sort, event_id) {
        return db.query(FilterSortService.commentFilterSort(date, search, sort, event_id, ''));
    }

    getListCommentsToCompany(page, date, search, sort, company_id) {
        const maxCommentOnPage = config.comment.maxCommentOnPage;
    
        const startingLimit = (page - 1) * maxCommentOnPage;

        return db.query(FilterSortService.commentFilterSort(date, search, sort, '', company_id) +
            ` LIMIT ${db.escape(startingLimit)}, ${db.escape(maxCommentOnPage)} `);
    }

    getAllCommentsToCompany(date, search, sort, company_id) {
        return db.query(FilterSortService.commentFilterSort(date, search, sort, '', company_id));
    }

    deleteCommentById(comment_id) {
        return db.query('DELETE FROM comment WHERE comment_id = ?', comment_id);
    }
}

module.exports = new Comment();