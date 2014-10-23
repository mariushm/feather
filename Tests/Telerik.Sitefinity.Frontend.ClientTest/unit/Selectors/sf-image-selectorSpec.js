describe('sfImageSelector', function () {

    var $httpBackend,
        imageService;

    beforeEach(module('sfLibrariesService'));
    beforeEach(module('sfImageSelector'));

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        imageService = $injector.get('sfImageService');
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('sfImageSelectorListCtrl', function () {

        var scope,
            service,
            createController;

        beforeEach(inject(function ($rootScope, $controller) {

            scope = $rootScope.$new();

            createController = function () {
                return $controller('sfImageSelectorListCtrl', {
                    '$scope': scope,
                    'sfImageService' : imageService
                });
            };
        }));

        it('it loads 20 albums and images from service into the listItems array', function () {

            var fakeData = {
                Items: []
            };
            for (var i = 0; i < 20; i++) {
                fakeData.Items.push(i);
            }

            var serviceUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20';
            $httpBackend.expectGET(serviceUrl).respond(fakeData);

            var ctrl = createController();
            scope.listFilter = 'all';

            $httpBackend.flush();

            expect(scope.listItems.length).toEqual(20);
        });
        

    });

});