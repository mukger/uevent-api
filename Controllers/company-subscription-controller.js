const ApiError = require("../utils/ApiError");
const Company = require("../Models/Company");
const Notification = require("../Models/Notification");
const CompanySubscription = require("../Models/CompanySubscription");

class CompanySubscriptionController {
    async createCompanySubscription(req, res, next) {
        try {

            const { companyId } = req.params;

            const [getCompanyByCompanyId] = await Company.getCompanyByCompanyId(companyId);
            if(getCompanyByCompanyId.length < 1) {
                return next(ApiError.BadRequest("Company with this id does not exist"));
            }

            const [subscriptionUserToEvent] = await CompanySubscription.getCompanySubscriptionUser(req.user.id, companyId);

            if(subscriptionUserToEvent.length > 0) {
                return next(ApiError.BadRequest("The user with the given id is already subscribed to the company"));
            }

            let subscription = {
                user_id: req.user.id,
                company_id: companyId
            }

            const addSubscription = await CompanySubscription.addCompanySubscription(subscription);

            let notificationOfSubscriptionToUser = {
                user_id: req.user.id,
                company_id: companyId,
                ndescription: `You have subscribed to the company`,
                notification_date: new Date().toJSON().slice(0, 19).replace('T', ' ')
            };

            const addNotificationToUser = await Notification.addNotification(notificationOfSubscriptionToUser);
            
            return res.status(201).json(
                {
                    ...subscription
                });

        } catch (e) {
            next(e);
        }
    }

    async getSubscriptionCurUserToCompany(req, res, next) {
        try {

            const { companyId } = req.params;

            const [getCompanyByCompanyId] = await Company.getCompanyByCompanyId(companyId);
            if(getCompanyByCompanyId.length < 1) {
                return next(ApiError.BadRequest("Company with this id does not exist"));
            }

            const [subscriptionUserToCompany] = await CompanySubscription.getCompanySubscriptionUser(req.user.id, companyId);

            return res.status(200).json(subscriptionUserToCompany[0]);

        } catch(e) {
            next(e);
        }
    }

    async deleteCompanySubscription(req, res, next) {
        try {

            const { companyId } = req.params;

            const [getCompanyByCompanyId] = await Company.getCompanyByCompanyId(companyId);
            if(getCompanyByCompanyId.length < 1) {
                return next(ApiError.BadRequest("Company with this id does not exist"));
            }

            const [subscriptionUserToCompany] = await CompanySubscription.getCompanySubscriptionUser(req.user.id, companyId);

            if(subscriptionUserToCompany.length > 0) {
                const deleteSubscription = await CompanySubscription.deleteCompanySubscription(req.user.id, companyId);

                let notificationOfUnsubscription = {
                    user_id: req.user.id,
                    company_id: companyId,
                    ndescription: `You unsubscribed from the company`,
                    notification_date: new Date().toJSON().slice(0, 19).replace('T', ' ')
                };

                const addNotification = await Notification.addNotification(notificationOfUnsubscription);
            }

            return res.status(204).json();

        } catch (e) {
            next(e);
        }
    }
}

module.exports = new CompanySubscriptionController();
