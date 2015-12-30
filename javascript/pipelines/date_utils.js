//************ Constructor **************//
function DateUtils() {

}

// date must be in format "yy-mm-dd"
function getDateAsDate(dateStr) {

    var dateParts = dateStr.split("-");
    var date = new Date(parseInt(dateParts[0], 10),
        parseInt(dateParts[1], 10) - 1,
        parseInt(dateParts[2], 10));
    return date;
}
// date must be in format "yy-mm-dd"
function getDateAsString(dateStr) {

    var date = getDateAsDate(dateStr);
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

function getYearsSinceNow(dateStr) {

    var date = getDateAsDate(dateStr);
    var ageDifMs = Date.now() - date.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    var ageYears = Math.abs(ageDate.getUTCFullYear() - 1970);
    return ageYears;
}

// Exported class
module.exports = DateUtils;
module.exports.getDateAsString = getDateAsString;
module.exports.getYearsSinceNow = getYearsSinceNow;
