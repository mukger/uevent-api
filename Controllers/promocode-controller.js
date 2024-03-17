const Company = require("../Models/Company");
const Promocode = require("../Models/Promocode");
const Event = require("../Models/Event");
const moment = require('moment');
const PromocodeService = require("../services/promocode-service");
const {changeDateToUTC} = require("../utils/changeDateToUtc");
const ApiError = require("../utils/ApiError");

class PromocodeController {

    async createPromocode(req, res, next) {
        try {
            
            const { eventId, utc } = req.query;

            if(!utc) {
                return next(ApiError.BadRequest("You must set utc query param!"));
            }

            const [userCompany] = await Company.getCompanyByUserId(req.user.id);
            if (userCompany.length === 0) {
                return next(ApiError.Forbidden("User didn't create company"));
            }

            //Пока промокоды будут обязательно со временем истечения, мб потом сделать на выбор

            if (!req.body.discount || !req.body.expiration_date) {
                return next(ApiError.BadRequest("Check all fields"));
            }

            if(req.body.promocode) {
                if(!/(([a-zA-Z].*\d)|(\d.*[a-zA-Z]))/.test(req.body.promocode) || req.body.promocode.length < 8 || req.body.promocode.length > 12) {
                    return next(ApiError.BadRequest("You have enter a wrong format promocode, use only A-Z and 0-9 combination with a length of 8 and more characters (less than 12)"));
                }

                req.body.promocode = await PromocodeService.encryptPromocode(req.body.promocode);

                let [getPromocodeByPromocode] = await Promocode.getPromocodeByPromocode(req.body.promocode);

                if(getPromocodeByPromocode.length !== 0) {
                    return next(ApiError.BadRequest("This promocode is already busy by someone, please enter another promocode"));
                }
            }
            else {
                while(1) {
                    req.body.promocode = await PromocodeService.generatePromocode(10);
                    req.body.promocode = await PromocodeService.encryptPromocode(req.body.promocode);

                    let [getPromocodeByPromocode] = await Promocode.getPromocodeByPromocode(req.body.promocode);

                    if(getPromocodeByPromocode.length === 0) {
                        break;
                    }
                }
                
            }

            let promocode = {};

            if(eventId) {
                const [getEventById] = await Event.getEventById(eventId);

                if (getEventById.length === 0) {
                    return next(ApiError.BadRequest("Event not found"));
                }

                if(+getEventById[0].company_id === +userCompany[0].company_id) {
                    promocode.event_id = eventId;
                }
                else {
                    return next(ApiError.Forbidden("Only author of the event can add new promocode to it"));
                }
            }
            else {
                promocode.company_id = userCompany[0].company_id;
            }

            promocode.promocode = req.body.promocode;
            promocode.discount = req.body.discount;
            promocode.expiration_date = changeDateToUTC(+req.query.utc, req.body.expiration_date);

            const addPromocode = await Promocode.addPromocode(promocode);

            return res.status(201).json(
                {
                    promocode_id: addPromocode[0].insertId, 
                    ...promocode
                });

        } catch (e) {
            next(e);
        }
    }

    async getUsedPromocodeToEvent(req, res, next) {
        try {

            const { eventId } = req.params;

            const [getEventById] = await Event.getEventById(eventId);
            if (getEventById.length === 0) {
                return next(ApiError.BadRequest("Event not found"));
            }

            const [getMaxDiscountToEvent] = await Promocode.getUsedPromocodeToEvent(req.user.id, eventId);
            const [getMaxDiscountToCompany] = await Promocode.getUsedPromocodeToCompany(req.user.id, getEventById[0].company_id);

            let maxDiscount;
            let promocodeId;

            if((getMaxDiscountToEvent && getMaxDiscountToEvent.length > 0) && (getMaxDiscountToCompany && getMaxDiscountToCompany.length > 0) ) {
                if(+getMaxDiscountToEvent[0].discount > +getMaxDiscountToCompany[0].discount) {
                    maxDiscount = +getMaxDiscountToEvent[0].discount;
                    promocodeId = getMaxDiscountToEvent[0].promocode_id;
                }
                else {
                    maxDiscount = +getMaxDiscountToCompany[0].discount;
                    promocodeId = getMaxDiscountToCompany[0].promocode_id;
                }
            }
            else if(getMaxDiscountToEvent && getMaxDiscountToEvent.length > 0) {
                maxDiscount = +getMaxDiscountToEvent[0].discount;
                promocodeId = getMaxDiscountToEvent[0].promocode_id;
            }
            else if(getMaxDiscountToCompany && getMaxDiscountToCompany.length > 0) {
                maxDiscount = +getMaxDiscountToCompany[0].discount;
                promocodeId = getMaxDiscountToCompany[0].promocode_id;
            }

            return res.status(200).json({discount: maxDiscount, promocode_id: promocodeId});
        } catch(e) {
            next(e);
        }
    }

    async extendPromocodeExpirationDate(req, res, next) {
        try {

            const { promocodeId } = req.params;

            if (!req.body.expiration_date) {
                return next(ApiError.BadRequest("Check all fields"));
            }

            const { utc } = req.query;

            if(!utc) {
                return next(ApiError.BadRequest("You must set utc query param!"));
            }

            const [userCompany] = await Company.getCompanyByUserId(req.user.id);
            if (userCompany.length === 0) {
                return next(ApiError.Forbidden("User didn't create company"));
            }

            const [getPromocodeById] = await Promocode.getPromocodeById(promocodeId);
            if(getPromocodeById.length === 0) {
                return next(ApiError.BadRequest("Promocode have not found"));
            }

            if(getPromocodeById[0].company_id) {
                if(+userCompany[0].company_id !== +getPromocodeById[0].company_id) {
                    return next(ApiError.Forbidden("Only author of the company can extend the expiration date of its promocode"));
                }
            }
            else {
                const [getEventById] = await Event.getEventById(getPromocodeById[0].event_id);
                if(+userCompany[0].company_id !== +getEventById[0].company_id) {
                    return next(ApiError.Forbidden("Only author of the company can extend the expiration date of its promocode"));
                }
            }

            const [extendPromocodeExpirationDate] = await Promocode.changeExpirationDateOfPromocode(promocodeId, changeDateToUTC(+req.query.utc, req.body.expiration_date))

            const [changedPromocode] = await Promocode.getPromocodeById(promocodeId);

            changedPromocode[0].promocode = await PromocodeService.decryptPromocode(changedPromocode[0].promocode);

            return res.status(200).json(changedPromocode[0]);
            
        } catch(e) {
            next(e);
        }
    }

    async activatePromocodeByUser(req, res, next) {
        try {

            if (!req.body.promocode) {
                return next(ApiError.BadRequest("Check all fields"));
            }

            req.body.promocode = await PromocodeService.encryptPromocode(req.body.promocode);

            const [getPromocodeByPromocode] = await Promocode.getPromocodeByPromocode(req.body.promocode);
            if(getPromocodeByPromocode.length === 0) {
                return next(ApiError.BadRequest("You have entered incorrect promocode"));
            }

            const [getUserPromocode] = await Promocode.getUserPromocode(req.user.id, getPromocodeByPromocode[0].promocode_id);
            if(getUserPromocode.length !== 0) {
                return next(ApiError.BadRequest("You already used this promocode"));
            }

            let user_promocode = {
                user_id: req.user.id,
                promocode_id: getPromocodeByPromocode[0].promocode_id,
                activation_date: new Date().toJSON().slice(0, 19).replace('T', ' ')
            }

            let currentDate = new Date();
            let expirationDate = new Date(moment(getPromocodeByPromocode[0].expiration_date).format("YYYY-MM-DD HH:mm:ss").replace(' ', 'T') + 'Z');

            if((currentDate - expirationDate) < 0) {
                const [activatePromocodeByUser] = await Promocode.addUserPromocode(user_promocode);

                return res.status(201).json(user_promocode);
            }
            else {
                return next(ApiError.BadRequest("You have entered incorrect promocode"));
            }

        } catch (e) {
            next(e);
        }
    }

    async getPromocodeById(req, res, next) {
        try {

            const { promocodeId } = req.params;

            const [userCompany] = await Company.getCompanyByUserId(req.user.id);
            if (userCompany.length === 0) {
                return next(ApiError.Forbidden("User didn't create company"));
            }

            const [getPromocodeById] = await Promocode.getPromocodeById(promocodeId);
            if(getPromocodeById.length === 0) {
                return next(ApiError.BadRequest("Promocode have not found"));
            }

            if(getPromocodeById[0].company_id) {
                if(+userCompany[0].company_id !== +getPromocodeById[0].company_id) {
                    return next(ApiError.Forbidden("Only author of the company can view its promocodes"));
                }
            }
            else {
                const [getEventById] = await Event.getEventById(getPromocodeById[0].event_id);
                if(+userCompany[0].company_id !== +getEventById[0].company_id) {
                    return next(ApiError.Forbidden("Only author of the event can view its promocodes"));
                }
            }

            getPromocodeById[0].promocode = await PromocodeService.decryptPromocode(getPromocodeById[0].promocode);

            return res.status(200).json(getPromocodeById[0]);

        } catch (e) {
            next(e);
        }
    }

    async getAllPromocodesActivatedByUser(req, res, next) {
        try {

            const [promocodes] = await Promocode.getAllPromocodesActivatedByUser(req.user.id);

            for(let i = 0; i < promocodes.length; i++) {
                promocodes[i].promocode = await PromocodeService.decryptPromocode(promocodes[i].promocode);
                if(promocodes[i].event_id) {
                    let [getEventById] = await Event.getEventById(promocodes[i].event_id);
                    promocodes[i].event = {
                        ...getEventById[0]
                    }   
                }
                else if (promocodes[i].company_id) {
                    let [getCompanyById] = await Company.getCompanyByCompanyId(promocodes[i].company_id);
                    promocodes[i].company = {
                        ...getCompanyById[0]
                    }
                }
                delete promocodes[i].event_id
                delete promocodes[i].company_id
                delete promocodes[i].expiration_date;
            }

            return res.status(200).json(promocodes);

        } catch (e) {
            next(e);
        }
    }

    async getAllPromocodesByCompany(req, res, next) {

        try {

            const [userCompany] = await Company.getCompanyByUserId(req.user.id);
            if (userCompany.length === 0) {
                return next(ApiError.Forbidden("User didn't create company"));
            }

            const [promocodes] = await Promocode.getAllPromocodesByCompany(userCompany[0].company_id);

            for(let i = 0; i < promocodes.length; i++) {
                promocodes[i].promocode = await PromocodeService.decryptPromocode(promocodes[i].promocode);
            }

            return res.status(200).json(promocodes);

        } catch (e) {
            next(e);
        }

    }

    async deletePromocode(req, res, next) {
        try {

            const { promocodeId } = req.params;

            const [userCompany] = await Company.getCompanyByUserId(req.user.id);
            if (userCompany.length === 0) {
                return next(ApiError.Forbidden("User didn't create company"));
            }

            const [getPromocodeById] = await Promocode.getPromocodeById(promocodeId);
            if(getPromocodeById.length === 0) {
                return next(ApiError.BadRequest("Promocode have not found"));
            }

            if(getPromocodeById[0].company_id) {
                if(+userCompany[0].company_id !== +getPromocodeById[0].company_id) {
                    return next(ApiError.Forbidden("Only author of the company can delete its promocodes"));
                }
            }
            else {
                const [getEventById] = await Event.getEventById(getPromocodeById[0].event_id);
                if(+userCompany[0].company_id !== +getEventById[0].company_id) {
                    return next(ApiError.Forbidden("Only author of the event can delete its promocodes"));
                }
            }

            const deletePromocode = await Promocode.deletePromocode(promocodeId);

            return res.status(204).json();

        } catch (e) {
            next(e);
        }
    }

}

module.exports = new PromocodeController();