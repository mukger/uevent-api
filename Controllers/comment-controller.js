const Event = require("../Models/Event");
const Company = require("../Models/Company");
const Comment = require("../Models/Comment");

const ApiError = require("../utils/ApiError");

class CommentController {
    async createCommentToEvent(req, res, next) {
        try {
            if (!req.body.comment_text) {
                return next(ApiError.BadRequest("Check all fields"));
            }

            const { eventId } = req.params;

            const [getEventById] = await Event.getEventById(eventId);
            if(getEventById.length === 0) {
                return next(ApiError.BadRequest("Event not found"));
            }

            let comment = {
                user_id: req.user.id,
                event_id: eventId,
                comment_date: new Date().toJSON().slice(0, 19).replace('T', ' '),
                comment_text: req.body.comment_text
            };

            const addComment = await Comment.addComment(comment);

            return res.status(201).json(
                {
                    comment_id: addComment[0].insertId, 
                    ...comment
                });

        } catch(e) {
            next(e);
        }
    }

    async createCommentToCompany(req, res, next) {
        try {
            if (!req.body.comment_text) {
                return next(ApiError.BadRequest("Check all fields"));
            }

            const { companyId } = req.params;

            const [getCompanyByCompanyId] = await Company.getCompanyByCompanyId(companyId);
            if(getCompanyByCompanyId.length === 0) {
                return next(ApiError.BadRequest("Company not found"));
            }

            let comment = {
                user_id: req.user.id,
                company_id: companyId,
                comment_date: new Date().toJSON().slice(0, 19).replace('T', ' '),
                comment_text: req.body.comment_text
            };

            const addComment = await Comment.addComment(comment);

            return res.status(201).json(
                {
                    comment_id: addComment[0].insertId, 
                    ...comment
                });

        } catch(e) {
            next(e);
        }
    }

    async changeCommentById(req, res, next) {
        try {

            const { commentId } = req.params;

            const [getCommentById] = await Comment.getCommentById(commentId);
            if(getCommentById.length === 0) {
                return next(ApiError.BadRequest("Comment not found"));
            }
            if(+getCommentById[0].user_id !== +req.user.id) {
                return next(ApiError.Forbidden("Only author of the comment can change it"));
            }

            let comment = {
                comment_id: commentId,
                is_modified: 1
            };

            if(req.body.comment_text) {
                comment.comment_text = req.body.comment_text;
            }

            const [changeCommentById] = await Comment.changeCommentById(comment);
            const [getChangedComment] = await Comment.getCommentById(commentId);

            return res.status(201).json(getChangedComment);

        } catch(e) {
            next(e);
        }
    }

    async getCommentsToEvent(req, res, next) {
        try {

            let page = req.query.page ? Number(req.query.page) : 1;

            const { eventId } = req.params;

            const [getEventById] = await Event.getEventById(eventId);
            if(getEventById.length === 0) {
                return next(ApiError.BadRequest("Event not found"));
            }

            const [getListCommentsToEvent] = await Comment.getListCommentsToEvent(page, req.query.date, req.query.search, req.query.sort, eventId);

            const [getAllCommentsToEvent] = await Comment.getAllCommentsToEvent(req.query.date, req.query.search, req.query.sort, eventId);

            res.set('X-Total-Count', getAllCommentsToEvent.length);
            res.set('Access-Control-Expose-Headers', 'X-Total-Count');

            return res.status(200).json(getListCommentsToEvent);
            
        } catch(e) {
            next(e);
        }
    }

    async getCommentsToCompany(req, res, next) {
        try {

            let page = req.query.page ? Number(req.query.page) : 1;

            const { companyId } = req.params;

            const [getCompanyById] = await Company.getCompanyByCompanyId(companyId);
            if(getCompanyById.length === 0) {
                return next(ApiError.BadRequest("Company not found"));
            }

            const [getListCommentsToCompany] = await Comment.getListCommentsToCompany(page, req.query.date, req.query.search, req.query.sort, companyId);

            const [getAllCommentsToCompany] = await Comment.getAllCommentsToCompany(req.query.date, req.query.search, req.query.sort, companyId);

            res.set('X-Total-Count', getAllCommentsToCompany.length);
            res.set('Access-Control-Expose-Headers', 'X-Total-Count');

            return res.status(200).json(getListCommentsToCompany);
            
        } catch(e) {
            next(e);
        }
    }

    async deleteCommentById(req, res, next) {
        try {

            const { commentId } = req.params;

            const [getCommentById] = await Comment.getCommentById(commentId);
            if(getCommentById.length === 0) {
                return next(ApiError.BadRequest("Comment not found"));
            }
            if(+getCommentById[0].user_id !== +req.user.id && req.user.user_role !== 'admin') {
                return next(ApiError.Forbidden("Only author of the comment can delete it"));
            }

            const deleteCommentById = await Comment.deleteCommentById(commentId);

            return res.status(204).json();

        } catch(e) {
            next(e);
        }
    }
    
}

module.exports = new CommentController();
