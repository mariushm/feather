; (function () {

    var selectors = angular.module('selectors');

    selectors.directive('sfImageSelectorModal', function () {

        var link = function ($scope, element, attributes) {
            $(element).append('<div>')
                      .attr('modal', '')
                      .attr('existing-scope', 'true')
                      .attr('window-class', 'sf-image-selector-dlg')
                      .attr('template-url', 'Selectors/image-selector.html');
        };

        return {
            restrict: 'E',
            link: link
        };

    });

    /*
     * Image Selector Button directive is a thin wrapper around
     * Image Selector component. The actual Image Selector is not
     * visible until the button marked with this directive is clicked
     * at which point the Image Selector will be opened in a modal
     * dialog.
     */
    selectors.directive('sfImageSelectorButton', function () {

        var link = function ($scope, element, attributes) {

            var modal = attributes.sfImageSelectorButton;
            if (!modal) {
                throw 'You must specify the selector for the sf-image-selector-modal element.';
            }

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