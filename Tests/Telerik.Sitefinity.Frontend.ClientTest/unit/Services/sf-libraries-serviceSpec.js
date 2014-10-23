describe('sfLibrariesService', function () {

    var $httpBackend;

    beforeEach(module('sfLibrariesService'));

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('sfImageService', function () {

        var service;

        beforeEach(inject(function(sfImageService) {
            service = sfImageService;
        }));

        describe('#query', function () {

            it('options object is null, makes a request with default options', function () {

                var serviceUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20';
                $httpBackend.expectGET(serviceUrl).respond([]);

                // call the query method with no options
                service.query();
                
                $httpBackend.flush();
            });

        });

    });

});