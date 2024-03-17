const db = require('../db/db');
const e = require("express");

class FilterSortService {
    eventFilterSort(format, theme, date, search, sort, future, eventReq = '', companyReq = '') {
        let whereEventReq = (eventReq.length !== 0)?(`WHERE event.event_id NOT IN (${db.escape(eventReq)})`):('');
        let andEventReq = (eventReq.length !== 0)?(`AND event.event_id NOT IN (${db.escape(eventReq)})`):('');

        let whereCompanyReq = (companyReq.length !== 0)?(`WHERE event.company_id IN (${db.escape(companyReq)})`):('');
        let andCompanyReq = (companyReq.length !== 0)?(`AND event.company_id IN (${db.escape(companyReq)})`):('');

        let flag = false;
        let sql = 'SELECT event.*, company.cname, company.user_id FROM event LEFT OUTER JOIN company ON company.company_id = event.company_id WHERE';
        if (!format && !theme && !date && !search && !sort && !future) {
            return `SELECT event.*, company.cname, company.user_id FROM event LEFT OUTER JOIN company ON company.company_id = event.company_id ${whereEventReq} ${whereCompanyReq}`;
        }

        if(future) {
            sql += ` execution_date > UTC_TIMESTAMP()`
            flag = true;
        }
        if (format) {
            if(flag) {
                sql += ` AND format IN(${db.escape(format)}) ${andEventReq} ${andCompanyReq}`;
            } else {
                sql += ` format IN(${db.escape(format)}) ${andEventReq} ${andCompanyReq}`;
                flag = true;
            }
        }
        if (theme) {
            if (flag) {
                sql += ` AND theme IN(${db.escape(theme)})`;
            } else {
                sql += ` theme IN(${db.escape(theme)}) ${andEventReq} ${andCompanyReq}`;
                flag = true;
            }
        }
        if(date) {
            let dateArr = date.split('-');
            if (flag) {
                sql += ` AND (DATE(execution_date) BETWEEN ${db.escape(dateArr[0])} AND ${db.escape(dateArr[1])})`;
            } else {
                sql += ` (DATE(execution_date) BETWEEN ${db.escape(dateArr[0])} AND ${db.escape(dateArr[1])}) ${andEventReq} ${andCompanyReq}`;
                flag = true;
            }
        }
        if(search) {
            if(flag) {
                sql += ` AND event_name LIKE '%${search}%'`;
            } else {
                sql += ` event_name LIKE '%${search}%' ${andEventReq} ${andCompanyReq}`;
                flag = true;
            }
        }
        if(sort) {
            if(flag) {
                if (sort === '1') {
                    sql += ` ORDER BY execution_date DESC`;
                } else {
                    sql += ` ORDER BY execution_date ASC`;
                }
            } else {
                if (sort === '1') {
                    sql = `SELECT event.*, company.cname, company.user_id FROM event LEFT OUTER JOIN company ON company.company_id = event.company_id ${whereEventReq} ${whereCompanyReq} ORDER BY execution_date DESC`;
                } else {
                    sql = `SELECT event.*, company.cname, company.user_id FROM event LEFT OUTER JOIN company ON company.company_id = event.company_id ${whereEventReq} ${whereCompanyReq} ORDER BY execution_date ASC`;
                }
            }
        }

        return sql;
    }

    commentFilterSort(date, search, sort, eventReq = '', companyReq = '') {
        let whereEventReq = (eventReq.length !== 0)?(`WHERE comment.event_id IN (${db.escape(eventReq)})`):('');
        let andEventReq = (eventReq.length !== 0)?(`AND comment.event_id IN (${db.escape(eventReq)})`):('');

        let whereCompanyReq = (companyReq.length !== 0)?(`WHERE comment.company_id IN (${db.escape(companyReq)})`):('');
        let andCompanyReq = (companyReq.length !== 0)?(`AND comment.company_id IN (${db.escape(companyReq)})`):('');

        let flag = false;
        let sql = 'SELECT comment.*, users.login FROM comment LEFT OUTER JOIN users ON users.id = comment.user_id WHERE';
        if (!date && !search && !sort) {
            return `SELECT comment.*, users.login FROM comment LEFT OUTER JOIN users ON users.id = comment.user_id ${whereEventReq} ${whereCompanyReq}`;
        }

        if(date) {
            let dateArr = date.split('-');
            sql += ` (DATE(comment_date) BETWEEN ${db.escape(dateArr[0])} AND ${db.escape(dateArr[1])}) ${andEventReq} ${andCompanyReq}`;
            flag = true;
        }
        if(search) {
            if(flag) {
                sql += ` AND comment_text LIKE '%${search}%'`;
            } else {
                sql += ` comment_text LIKE '%${search}%' ${andEventReq} ${andCompanyReq}`;
                flag = true;
            }
        }
        if(sort) {
            if(flag) {
                if (sort === '1') {
                    sql += ` ORDER BY comment_date DESC`;
                } else {
                    sql += ` ORDER BY comment_date ASC`;
                }
            } else {
                if (sort === '1') {
                    sql = `SELECT comment.*, users.login FROM comment LEFT OUTER JOIN users ON users.id = comment.user_id ${whereEventReq} ${whereCompanyReq} ORDER BY comment_date DESC`;
                } else {
                    sql = `SELECT comment.*, users.login FROM comment LEFT OUTER JOIN users ON users.id = comment.user_id ${whereEventReq} ${whereCompanyReq} ORDER BY comment_date ASC`;
                }
            }
        }
        return sql;
    }
}

module.exports = new FilterSortService();