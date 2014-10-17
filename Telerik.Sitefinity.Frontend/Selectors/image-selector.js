; (function () {

    var selectors = angular.module('selectors');

    /*
     * Image Selector Button directive is a thin wrapper around
     * Image Selector component. The actual Image Selector is not
     * visible until the button marked with this directive is clicked
     * at which point the Image Selector will be opened in a modal
     * dialog.
     */
    selectors.directive('sfImageSelectorButton', function () {

        var link = function ($scope, element, attributes) {

            $(element).bind('click', function () {
                alert('Opening Image Selector...');
            });

        };

        return {
            restrict: 'A',
            link: link
        };

    });
        

}());