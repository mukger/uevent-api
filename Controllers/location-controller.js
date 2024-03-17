const Location = require("../Models/Location");
const ApiError = require("../utils/ApiError");

class LocationController {
    async getLocationById(req, res, next) {
        try {
            const [location] = await Location.getLocationById(req.params.id);
            if (location.length === 0) {
                return next(ApiError.BadRequest("Location not found"));
            }

            return res.status(200).json(location[0]);

        } catch (e) {
            next(e);
        }
    }

    async getLocationByEventId(req, res, next) {
        try {
            const [location] = await Location.getLocationByEventId(req.params.id);
            if (location.length === 0) {
                return next(ApiError.BadRequest("Location not found"));
            }

            return res.status(200).json(location[0]);

        } catch (e) {
            next(e)
        }
    }

    async getLocationByCompanyId(req, res, next) {
        try {
            const [location] = await Location.getLocationByCompanyId(req.params.id);
            if (location.length === 0) {
                return next(ApiError.BadRequest("Location not found"));
            }

            return res.status(200).json(location[0]);
        } catch (e) {
            next(e)
        }
    }
    
}

module.exports = new LocationController();
