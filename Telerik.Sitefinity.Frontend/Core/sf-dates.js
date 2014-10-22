/*
 * This module provides functionality related to date and time.
 */
; (function () {

    var dates = angular.module('sfDates', []);
    
    /*
     * Prototype function:
     * Converts a JavaScript Date object into a string WCF
     * representation of a date.
     */
    Date.prototype.toWcfDate = function () {
        return '/Date(' + this.getTime() + '-0000)/';
    };

    // Converts WCF date string to a JavaScript date
    /*
     * Prototype function:
     * Converts a string WCF representation of date into
     * JavaScript date representation.
     */
    String.prototype.fromWcfDate = function () {
        var matches = this.match(/\/Date\(([0-9]+)(?:.*)\)\//);
        if (matches)
            return new Date(parseInt(matches[1]));
    };

    /*
     * AngularJS filter that converts a JavaScript date object
     * into a WCF date string.
     */
    dates.filter('toWcfDate', function () {
        return function (input) {
            if (input)
                return input.toWcfDate();
            else
                return '';
        };
    });

    /*
     * AngularJS filter that converts a WCF string date
     * into a JavaScript date object.
     */
    dates.filter('fromWcfDate', function () {
        return function (input) {
            if (input)
                return input.fromWcfDate();
            else
                return null;
        };
    });

    /*
     * AngularJS filter that provides smart formatting for the dates.
     * The "smart" part comes from the fact that date string will also
     * have "Today" if the the date is today, "Yesterday" if the date
     * was yesterday etc.
     */
    dates.filter('smartDateString', ['$filter', function ($filter) {
        return function (input) {

            if (!input)
                return '';

            var now = new Date(),
                differenceInMs = now.getTime() - input.getTime(),
                oneSecondInMs = 1000,
                oneMinuteInMs = oneSecondInMs * 60,
                oneHourInMs = oneMinuteInMs * 60,
                oneDayInMs = oneHourInMs * 24;

            if (differenceInMs < oneMinuteInMs) return 'A few seconds ago';
            if (differenceInMs < oneHourInMs) return '5 minutes ago';
            if (differenceInMs < oneDayInMs) return '8 hours ago';
            if (differenceInMs < (oneDayInMs * 2)) return 'Yesterday';
            if (now.getYear() === input.getYear()) return $filter('date')(input, 'd MMMM');

            return $filter('date')(input, 'd MMMM yyyy');
            
        };
    }]);

}());