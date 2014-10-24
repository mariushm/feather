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

        var service,
            injector;

        beforeEach(inject(function ($injector) {
            injector = $injector;
            service = injector.get('sfImageService');
        }));

        describe('#query', function () {

            it('makes a request with default options when options object is null', function () {

                var serviceUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=(Visible=true AND Status=Live)';
                $httpBackend.expectGET(serviceUrl).respond([]);

                // call the query method with no options
                service.query();
                
                $httpBackend.flush();
            });

            it('makes a request with default options, but takes into account skip parameter when present', function () {

                var queryOptions = {
                        skip: 28
                    },
                    serviceUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&skip=28&take=20&filter=(Visible=true AND Status=Live)';

                $httpBackend.expectGET(serviceUrl).respond([]);

                // call the query method with options
                service.query(queryOptions);

                $httpBackend.flush();

            });

            it('makes a request with a string filter, no other settings', function () {

                var queryOptions = {
                    filter: 'Title = "Hello world"'
                },
                serviceUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=(Visible=true AND Status=Live) AND (Title = "Hello world")';

                $httpBackend.expectGET(serviceUrl).respond([]);

                // call the query method with options
                service.query(queryOptions);

                $httpBackend.flush();

            });

            describe('#namedFilter: "recent"', function () {

                it('makes a request with a named filter, no other settings', function () {

                    var queryOptions = {
                        filter: {
                            name: 'recent'
                        }
                    },
                    serviceUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=[ShowRecentLiveItems]';

                    $httpBackend.expectGET(serviceUrl).respond([]);

                    // call the query method with options
                    service.query(queryOptions);

                    $httpBackend.flush();

                });

            });

            describe('#namedFilter: "mine"', function () {

                it('makes a request with a named filter, no other settings', function () {

                    var userId = '5';

                    var queryOptions = {
                        filter: {
                            name: 'mine'
                        }
                    },
                    serviceUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=(Visible=true AND Status=Live) AND (Owner = (' + userId + '))';

                    $httpBackend.expectGET(serviceUrl).respond([]);

                    service = injector.get('sfImageService')

                    // call the query method with options
                    service.query(queryOptions);

                    $httpBackend.flush();

                });

            });

        });

    });

});