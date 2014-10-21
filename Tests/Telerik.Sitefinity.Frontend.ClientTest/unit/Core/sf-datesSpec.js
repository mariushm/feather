describe('sfDates', function () {

    var $filter,
        staticNow = new Date(2014, 10, 21),
        clock;
    
    beforeEach(module('sfDates'));
    beforeEach(inject(function ($injector) {
        $filter = $injector.get('$filter');
        clock = sinon.useFakeTimers(staticNow.getTime());
    }));

    afterEach(function () {
        //clock.restore();
    });

    describe('toWcfDate', function () {

        it('converts JS date to a valid WCF date', function () {
            var jsDate = new Date(),
                expectedWcfDate = '/Date(' + jsDate.getTime() + '-0000)/';

            var wcfDate = $filter('toWcfDate')(jsDate);
            expect(wcfDate).toEqual(expectedWcfDate);
        });

        it('returns an empty string if filter input is falsy', function () {
            var wcfDate = $filter('toWcfDate')(null);
            expect(wcfDate).toEqual('');
        });

    });

    describe('fromWcfDate', function () {

        it('converts WCF date string to JavaScript date object', function () {

            var testDate = new Date(),
                wcfDate = '/Date(' + testDate.getTime() + '-0000)/',
                expectedDate = testDate;

            var jsDate = $filter('fromWcfDate')(wcfDate);
            expect(jsDate).toEqual(testDate);

        });

        it('returns null if filter input is falsy', function () {
            var jsDate = $filter('fromWcfDate')(null);
            expect(jsDate).toBe(null);
        });


    });

    describe('smartDateString', function () {

        it('returns "A few seconds ago" if input date is less than a minute in the past', function () {

            var expectedString = 'A few seconds ago',
                MS_PER_SECOND = 1000,
                now = new Date(),
                jsDate = new Date(now.valueOf() - 25 * MS_PER_SECOND); // 25 seconds ago

            var actualString = $filter('smartDateString')(jsDate);
            expect(actualString).toEqual(expectedString);

        });

        it('returns "5 minutes ago" if input date is less than an hour in the past', function () {

            var expectedString = '5 minutes ago',
                MS_PER_MINUTE = 1000 * 60,
                now = new Date(),
                jsDate = new Date(now.valueOf() - 46 * MS_PER_MINUTE); // 46 minutes ago

            var actualString = $filter('smartDateString')(jsDate);
            expect(actualString).toEqual(expectedString);

        });

        it('returns "8 hours ago" if input date is less than one day in the past', function () {

            var expectedString = '8 hours ago',
                MS_PER_HOUR = 1000 * 60 * 60,
                now = new Date(),
                jsDate = new Date(now.valueOf() - 2 * MS_PER_HOUR); // 2 hours ago

            var actualString = $filter('smartDateString')(jsDate);
            expect(actualString).toEqual(expectedString);

        });

        it('returns "Yesterday" if input date is less than two days in the past', function () {

            var expectedString = 'Yesterday',
                MS_PER_HOUR = 1000 * 60 * 60,
                now = new Date(),
                jsDate = new Date(now.valueOf() - 27 * MS_PER_HOUR); // 27 hours ago

            var actualString = $filter('smartDateString')(jsDate);
            expect(actualString).toEqual(expectedString);

        });

        it('returns date and month if input date is in the current year', function () {

            var expectedString = '26 March',
                jsDate = new Date(2014, 2, 26); // remember - months are zero based!

            var actualString = $filter('smartDateString')(jsDate);
            expect(actualString).toEqual(expectedString);

        });

        it('returns date, month and year if input date is in the previous calendar year', function () {

            var expectedString = '30 September 2013',
                jsDate = new Date(2013, 8, 30); // remember - months are zero based!

            var actualString = $filter('smartDateString')(jsDate);
            expect(actualString).toEqual(expectedString);

        });

        it('returns an empty string if the input date is falsy', function () {

            var actualString = $filter('smartDateString')(null);
            expect(actualString).toEqual('');

        });

    });

});