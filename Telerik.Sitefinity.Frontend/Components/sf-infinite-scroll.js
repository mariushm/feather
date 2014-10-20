; (function () {

    var endlessScroll = angular.module('sfInfiniteScroll', []);

    endlessScroll.directive('sfInfiniteScroll', [function () {

        /*
         * Returns true if user has scrolled to the bottom of the element,
         * otherwise returns false.
         */
        var atBottom = function(element) {
            return ($(element).scrollTop() + $(element).innerHeight()) >= $(element).get(0).scrollHeight;
        };

        var link = function ($scope, element, attributes) {

            // set overflow of the element to scroll
            $(element).css('overflow-y', 'scroll');

            element.off('scroll');
            element.on('scroll', function () {
                if (atBottom(element)) {
                    $scope.needsData();
                }
            });

        };

        return {
            restrict: 'A',
            scope: {
                needsData: '=needsData'
            },
            link: link
        };

    }]);

}());