const ApiError = require("../utils/ApiError");

const changeDateToUTC = (utc, executionDate) => {
    try {
        let hoursUtc = Math.floor(Math.abs(+utc));
        let minutesUtc = (+utc - Math.floor(+utc))*100;

        let tempstr = executionDate.replace(' ', 'T');
        let tempDate = new Date(tempstr);
        tempDate.setMinutes(tempDate.getMinutes() - tempDate.getTimezoneOffset());
        if(utc < 0) {
            tempDate.setHours(tempDate.getHours() + hoursUtc );
            tempDate.setMinutes(tempDate.getMinutes() + minutesUtc);
        }
        else {
            tempDate.setHours(tempDate.getHours() - hoursUtc );
            tempDate.setMinutes(tempDate.getMinutes() - minutesUtc);
        }

        return tempDate.toISOString().replace('T', ' ').replace('Z', '');
    }
    catch(e) {
        throw ApiError.BadRequest("You entered the date in the wrong format");
    }
}

module.exports = {
    changeDateToUTC
}
