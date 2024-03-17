const ApiError = require("../utils/ApiError");
const Company = require("../Models/Company");
const Event = require("../Models/Event");
const Location = require("../Models/Location");
const config = require('../config.json');
const Ticket = require("../Models/Ticket");
const moment = require('moment');

class CompanyController {
    async createCompany(req, res, next) {
        try {

            if (!req.body.cname || !req.body.cemail || !req.body.company_account ||
                !req.body.location.name_place || !req.body.location.latitude ||
                !req.body.location.longitude) {
                return next(ApiError.BadRequest("Check all fields"));
            }

            const [companyByUserId] = await Company.getCompanyByUserId(req.user.id);
            if(companyByUserId.length > 0) {
                return next(ApiError.BadRequest("One user can create only one company!"));
            }

            const [companyByName] = await Company.getCompanyByName(req.body.cname);
            if (companyByName.length > 0) {
                return next(ApiError.BadRequest("Company with this name already exist"));
            }

            const [companyByEmail] = await Company.getCompanyByEmail(req.body.cemail);
            if (companyByEmail.length > 0) {
                return next(ApiError.BadRequest("Company with this email already exist"));
            }

            const [companyByAccount] = await Company.getCompanyByAccount(req.body.company_account);
            if (companyByAccount.length > 0) {
                return next(ApiError.BadRequest("Company with this account already exist"));   
            }

            let company = {
                user_id: req.user.id,
                cname: req.body.cname,
                cpicture: config.register.default_image,
                cemail: req.body.cemail,
                create_date: new Date().toJSON().slice(0, 19).replace('T', ' '),
                company_account: req.body.company_account
            }

            const addCompany = await Company.addCompany(company);

            let insertLocation = {
                company_id: addCompany[0].insertId,
                name_place: req.body.location.name_place,
                latitude: req.body.location.latitude,
                longitude: req.body.location.longitude
            }

            const addLocation = await Location.addLocation(insertLocation);

            delete insertLocation.company_id;

            return res.status(201).json(
                {
                    company_id: addCompany[0].insertId, 
                    ...company,
                    location: {
                        ...insertLocation
                    }
                });
        } catch (e) {
            next(e);
        }
    }

    async changeCompany(req, res, next) {
        try {
            
            const { companyId } = req.params;

            const [companyById] = await Company.getCompanyByCompanyId(companyId);
            if(companyById.length < 1) {
                return next(ApiError.BadRequest("Company with this id does not exist"));
            }
            if(+companyById[0].user_id !== +req.user.id) {
                return next(ApiError.Forbidden("You can change only your own company"));
            }

            let company = {
                company_id: companyId,
                user_id: req.user.id
            };

            if(req.body.cname) {
                const [companyByName] = await Company.getCompanyByName(req.body.cname);
                if (companyByName.length > 0 && companyByName[0].company_id !== +companyId) {
                    return next(ApiError.BadRequest("Company with this name already exist"));
                }
                company.cname = req.body.cname
            }

            if(req.body.cemail) {
                const [companyByEmail] = await Company.getCompanyByEmail(req.body.cemail);
                if (companyByEmail.length > 0 && companyByEmail[0].company_id !== +companyId) {
                    return next(ApiError.BadRequest("Company with this email already exist"));
                }
                company.cemail = req.body.cemail
            }

            if(req.body.company_account) {
                const [companyByAccount] = await Company.getCompanyByAccount(req.body.company_account);
                if (companyByAccount.length > 0 && companyByAccount[0].company_id !== +companyId) {
                    return next(ApiError.BadRequest("Company with this account already exist"));   
                }
                company.company_account = req.body.company_account
            }

            if(req.body.cpicture) {
                company.cpicture = req.body.cpicture
            }

            if(req.body.location) {
                const [changeLocationOfCompany] = await Location.changeLocationOfCompany({...req.body.location}, companyId);
            }

            const [changeCompany] = await Company.changeCompany(company);
            const [getChangedCompany] = await Company.getCompanyByCompanyId(company.company_id);
            const [getChangedLocation] = await Location.getLocationByCompanyId(company.company_id);

            delete getChangedCompany[0].user_id;
            delete getChangedLocation[0].event_id;
            delete getChangedLocation[0].location_id;
            delete getChangedLocation[0].company_id;

            return res.status(201).json(
                {
                    ...getChangedCompany[0],
                    location: {
                        ...getChangedLocation[0]
                    }
                });

        } catch (e) {
            next(e);
        }
    }

    async deleteCurrentUserCompany(req, res, next) {
        try {

            const [userCompany] = await Company.getCompanyByUserId(req.user.id);
            if (userCompany.length === 0) {
                return next(ApiError.Forbidden("User not create company"));
            }

            let currentDate = new Date();

            const[getEventByCompany] = await Event.getAllEventsByCurUserCompany(userCompany[0].company_id);
            for(let i = 0; i < getEventByCompany.length; i++) {
                
                let executionDate = new Date(moment(getEventByCompany[i].execution_date).format("YYYY-MM-DD HH:mm:ss").replace(' ', 'T') + 'Z');

                if((currentDate - executionDate) < 0) {
                    let [ticketOfEventByCurUserCompany] = await Ticket.getEventTickets(getEventByCompany[i].event_id);
                    if(ticketOfEventByCurUserCompany.length !== 0) {
                        return next(ApiError.Forbidden("You can't delete your company because you have upcoming events"));
                    }
                }

            }

            const deleteCompany = await Company.deleteCompanyByUserId(req.user.id);

            return res.status(204).json();

        } catch (e) {
            next(e);
        }
    }

    async deleteCompanyById(req, res, next) {
        try {

            const { companyId } = req.params;

            const [getCompanyById] = await Company.getCompanyByCompanyId(companyId);
            if (getCompanyById.length === 0) {
                return next(ApiError.Forbidden("Company not found"));
            }

            if(+getCompanyById[0].user_id !== +req.user.id && req.user.user_role !== 'admin') {
                return next(ApiError.Forbidden("Only author of the company can delete it"));
            }

            const deleteCompanyById = await Company.deleteCompanyByCompanyId(companyId);

            return res.status(204).json();

            //

        } catch(e) {
            next(e);
        }
    }

    async getCompanyByCompanyId(req, res, next) {
        try {
            const { companyId } = req.params;

            const [getCompanyByCompanyId] = await Company.getCompanyByCompanyId(companyId);
            if(getCompanyByCompanyId.length > 0) {

                const [getLocation] = await Location.getLocationByCompanyId(companyId);

                delete getLocation[0].event_id;
                delete getLocation[0].location_id;
                delete getLocation[0].company_id;

                return res.status(200).json(
                    {
                        ...getCompanyByCompanyId[0],
                        location: {
                            ...getLocation[0]
                        }
                    });
            }
            else {
                return next(ApiError.BadRequest("Company with this id does not exist"));
            }

        } catch (e) {
            next(e);
        }
    }

    async getCompanyByUserId(req, res, next) {
        try {
            const { userId } = req.params;

            const [getCompanyByUserId] = await Company.getCompanyByUserId(userId);
            if(getCompanyByUserId.length > 0) {

                return res.status(200).json(
                    {
                        ...getCompanyByUserId[0]
                    });
            }
            else {
                return next(ApiError.BadRequest("This user didn't create a company"));
            }

        } catch (e) {
            next(e);
        }
    }

    async getCompanyByCurrentUser(req, res, next) {
        try {

            const [getCompanyByCurrentUserId] = await Company.getCompanyByUserId(req.user.id);
            return res.status(200).json(
                {
                    ...getCompanyByCurrentUserId[0]
                });

        } catch (e) {
            next(e);
        }
    }

    async getCompanyList(req, res, next) {
        try {

            const [getCompanyList] = await Company.getCompanyList();

            //const [getAllCompanies] = await Company.getAllCompanies()
            //res.set('X-Total-Count', getAllCompanies.length);
            //res.set('Access-Control-Expose-Headers', 'X-Total-Count');

            res.set('X-Total-Count', getCompanyList.length);
            res.set('Access-Control-Expose-Headers', 'X-Total-Count');

            return res.status(200).json(getCompanyList);

        } catch (e) {
            next(e);
        }
    }
}

module.exports = new CompanyController();
