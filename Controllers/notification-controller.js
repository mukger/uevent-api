const Notification = require("../Models/Notification");
const Company = require("../Models/Company");
const ApiError = require("../utils/ApiError");

class NotificationController {

    async getNotificationsByUser(req, res, next) {

        try {

            const [getNotificationsByUser] = await Notification.getNotificationsByUser(req.user.id);

            for(let i = 0; i < getNotificationsByUser.length; i++) {
                if(getNotificationsByUser[i].event_name) {
                      const [getCompanyById] = await Company.getCompanyByCompanyId(getNotificationsByUser[i].event_company_id);
                      getNotificationsByUser[i].company_name = getCompanyById[0].cname;
                }
                delete getNotificationsByUser[i].event_company_id;
            }

            return res.status(200).json(getNotificationsByUser);

        } catch (e) {
            next(e);
        }
    }

}

module.exports = new NotificationController();
