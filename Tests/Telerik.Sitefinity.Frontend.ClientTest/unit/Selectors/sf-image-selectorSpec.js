describe('sfImageSelector', function () {

	var $httpBackend,
		$rootScope,
		$controller,
        $compile,
		createController,
		scope,
        serverDataMock,
        modes,
        imageService;

	beforeEach(module('serverDataModule', 'sfLibrariesService', 'sfImageSelector'));

    beforeEach(inject(function ($injector) {
    	$httpBackend = $injector.get('$httpBackend');
    	$rootScope = $injector.get('$rootScope');
	    $controller = $injector.get('$controller');
        $compile = $injector.get('$compile');
        imageService = $injector.get('sfImageService');
        modes = $injector.get('sfImageSelectorModes');
        serverDataMock = $injector.get('serverData');
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('Directive: sfImageSelector', function () {

    	var element = angular.element('<sf-image-selector></sf-image-selector>');

        beforeEach(function () {
        	scope = $rootScope.$new();

        	$httpBackend.expectGET('/Frontend-Assembly/Telerik.Sitefinity.Frontend/Selectors/image-selector.html')
                        .respond('<div></div>');
        	$compile(element)(scope);
        	scope.$digest();
        	$httpBackend.flush();
        });

        it('should define "list" as an active mode on initialization', function () {
            expect(scope.activeMode.name).toEqual('list');

        });

        it('should subscribe to "ImageSelected" event, set the $scope.image to selected image and switch to insert mode', function () {

	        var selectedItem = { Title: 'Item 1' },
		        childScope = scope.$new();

            // emit the "ImageSelected" command from child scope
            childScope.$emit('ImageSelected', selectedItem);

            expect(scope.image.Title).toEqual(selectedItem.Title);
            expect(scope.activeMode.name).toEqual('insert');
        });

	    it('should emit "modeChanged" event when $scope.activeMode is changed', function() {

	    	var newMode = modes.insert,
	    		wasCalled = false;

		    $rootScope.$on('modeChanged', function(ev, arg) {
		    	expect(arg.name).toEqual(newMode.name);
			    wasCalled = true;
		    });

		    scope.activeMode = newMode;
		    scope.$digest();
		    expect(wasCalled).toEqual(true);
	    });

    });

    describe('Controller: sfImageSelectorListCtrl', function () {

    	beforeEach(function () {
            
            scope = $rootScope.$new();

            createController = function () {
                return $controller('sfImageSelectorListCtrl', {
                    '$scope': scope,
                    'sfImageService' : imageService
                });
            };
        });

        it('raises ImageSelected event when DoneSelecting command is fired', function () {

            createController();

            scope.selectedItem = {
                Title: 'Item 1'
            };

            // we'll spy on the emit function to make sure
            // ImageSelected event is emitted
            spyOn(scope, '$emit');

            // fire the 'DoneSelecting' command from the scope up
            // the hierarchy
            $rootScope.$broadcast('DoneSelecting');

            expect(scope.$emit).toHaveBeenCalledWith('ImageSelected', scope.selectedItem);

        });

        it('raises CloseDialog event when Cancel command is fired', function () {

            createController();

            // we'll spy on the emit function to make sure
            // Cancel event is emitted
            spyOn(scope, '$emit');


            // fire the 'CancelSelect' command from the scope up the
            // hierarchy
            $rootScope.$broadcast('CancelSelect');

            expect(scope.$emit).toHaveBeenCalledWith('Cancel');
        });

        it('sets the $scope.selectedItem property when select function is called', function () {

        	var item = { Title: 'One' };
	        createController();
            scope.select(item);
            expect(scope.selectedItem).toBe(item);

        });

	    it('clears the listItems array if the filter has been changed', function() {

		    var fakeData = {
			    Items: []
		    };
		    for (var i = 0; i < 20; i++) {
			    fakeData.Items.push(i);
		    }

		    var firstFilter = 'all',
			    firstRequestUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=(Visible=true AND Status=Live)&sortExpression=DateCreated DESC',
			    secondFilter = 'recent',
			    secondRequestUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=[ShowRecentLiveItems]&sortExpression=DateCreated DESC';

		    createController();

		    $httpBackend.expectGET(firstRequestUrl).respond(fakeData);
		    scope.listFilter = firstFilter;
		    $httpBackend.flush();

		    $httpBackend.expectGET(secondRequestUrl).respond(fakeData);
		    scope.listFilter = secondFilter;
		    $httpBackend.flush();

		    // even though we will load 40 items, because filter is being changed
		    // we clean the first 20 items, so we should end up only with the 20
		    // items from the second request
		    expect(scope.listItems.length).toEqual(20);
	    });

        it('changes the list mode ok button title to "Done selecting" when filter is applied', function () {

            createController();

            scope.$digest();

            // by default, list has no filter applied and is in upload
            // mode, so the title of the okButton should be 'Done'
            expect(modes.list.okButton.title).toEqual('Done');

            // setting the listFilter to anything (e.g. 'recent')
            // other than null, should change the title of the
            // list mode ok button to 'Done selecting'. Keep in mind that
            // setting a filter will trigger an http request, so we need
            // to take care of that as well
            var requestUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=[ShowRecentLiveItems]&sortExpression=DateCreated DESC';
            $httpBackend.expectGET(requestUrl).respond([]);
            scope.listFilter = 'recent';
            $httpBackend.flush();

            expect(modes.list.okButton.title).toEqual('Done selecting');

        });

        var filterTest = function (filter, loadedItemsCount, expectedUrl) {

            var fakeData = {
                Items: []
            };
            for (var i = 0; i < 20; i++) {
                fakeData.Items.push(i);
            }
            
            $httpBackend.expectGET(expectedUrl).respond(fakeData);

            createController();

            scope.listItems = [];
            // preload items in the scope to test paging with skip
            for (var x = 0; x < loadedItemsCount; x++) {
                scope.listItems.push(x);
            }

            scope.listFilter = filter;

            $httpBackend.flush();

            expect(scope.listItems.length).toEqual(20 + loadedItemsCount);

        };

        describe('#filter = "all"', function () {

            it('loads 20 albums and images from service into the listItems array', function () {
                
                var filter = 'all',
                    preloadedItems = 0,
                    expectedUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=(Visible=true AND Status=Live)&sortExpression=DateCreated DESC';

                filterTest(filter, preloadedItems, expectedUrl);

            });

            it('loads 20 albums and images from service into the listItems array, but skips the items already loaded - infinite scroll', function () {

                var filter = 'all',
                    preloadedItems = 20,
                    expectedUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&skip=20&take=20&filter=(Visible=true AND Status=Live)&sortExpression=DateCreated DESC';

                filterTest(filter, preloadedItems, expectedUrl);

            });
        });

        describe('#filter = "recent"', function () {

            it('loads 20 albums and images from service into the listItems array', function () {

                var filter = 'recent',
                    preloadedItems = 0,
                    expectedUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=[ShowRecentLiveItems]&sortExpression=DateCreated DESC';

                filterTest(filter, preloadedItems, expectedUrl);

            });

        });

        describe('#filter = "mine"', function () {

            it('loads 20 albums and images from service into the listItems array that belong to the current user', function () {

                var filter = 'mine',
                    currentUserId = serverDataMock.get('currentUserId'),
                    preloadedItems = 0,
                    expectedUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=(Visible=true AND Status=Live) AND (Owner = (' + currentUserId + '))&sortExpression=DateCreated DESC';

                filterTest(filter, preloadedItems, expectedUrl);

            });

        });

        describe('#sorting', function () {

            var sortTest = function (namedSort, expectedUrl) {
                var fakeData = {
                    Items: []
                };
                for (var i = 0; i < 20; i++) {
                    fakeData.Items.push(i);
                }

                $httpBackend.expectGET(expectedUrl).respond(fakeData);

                createController();

                scope.listItems = [];

                // preload items in the scope to test that list will be cleared
                // on change of listSort
                for (var x = 0; x < 22; x++) {
                    scope.listItems.push(x);
                }

                scope.$digest();

                scope.listSort = namedSort;

                $httpBackend.flush();

                expect(scope.listItems.length).toEqual(20);
            };

            
            it('clears the listItems and orders items by DateCreated descending when listSort set to "newUploadedFirst"', function () {

                // newUploadedFirst is a default value, so we first have to change to some other sort
                // to be able to test

                var expectedUrl1 = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=(Visible=true AND Status=Live)&sortExpression=LastModified DESC',
                    namedSort1 = 'newModifiedFirst';

                sortTest(namedSort1, expectedUrl1);

                var expectedUrl2 = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=(Visible=true AND Status=Live)&sortExpression=DateCreated DESC',
                    namedSort2 = 'newUploadedFirst';

                sortTest(namedSort2, expectedUrl2);

            });
            

            it('clears the listItems and orders items by LastModified descending when listSort set to "newModifiedFirst"', function () {
                
                var expectedUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=(Visible=true AND Status=Live)&sortExpression=LastModified DESC',
                    namedSort = 'newModifiedFirst';

                sortTest(namedSort, expectedUrl);

            });

            it('clears the listItems and orders items by Title ascending when listSort set to "titleAtoZ"', function () {
                
                var expectedUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=(Visible=true AND Status=Live)&sortExpression=Title ASC',
                    namedSort = 'titleAtoZ';

                sortTest(namedSort, expectedUrl);

            });

            it('clears the listItems and orders items by Title descending when listSort set to "titleZtoA"', function () {
                
                var expectedUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=(Visible=true AND Status=Live)&sortExpression=Title DESC',
                    namedSort = 'titleZtoA';

                sortTest(namedSort, expectedUrl);

            });

        });

    });

    describe('Controller: sfImageSelectorInsertCtrl', function () {

		beforeEach(function() {
			scope = $rootScope.$new();
			createController = function() {
				return $controller('sfImageSelectorInsertCtrl', {
					'$scope' : scope
				});
			};
			createController();
		});

		var insertTest = function(expectedMarkup)
	    {
			var wasInsertImageRaised = false;

			$rootScope.$on('insertImage', function (ev, arg) {
				expect(arg).toEqual(expectedMarkup);
				wasInsertImageRaised = true;
			});

			// emit the insert mode okButton command
			$rootScope.$broadcast(modes.insert.okButton.raise);

			$rootScope.$digest();
			expect(wasInsertImageRaised).toBe(true);
	    }

		it('should emit "insertImage" with Title, Alt, Url and no alignment', function() {

			var expectedMarkup = '<img src="/images/pic.jpg" alt="Image alt" title="Image title" />';

			scope.image = {
				Title: 'Image title',
				AlternativeText: 'Image alt',
				MediaUrl: '/images/pic.jpg'
			};

			insertTest(expectedMarkup);

		});

		it('should emit "insertImage" with Title, Alt, Url and left alignment', function () {

			var expectedMarkup = '<img src="/images/pic.jpg" alt="Image alt" title="Image title" class="sf-image-left" />';

			scope.insertOptions = {
				alignment: 'left'
			};

			scope.image = {
				Title: 'Image title',
				AlternativeText: 'Image alt',
				MediaUrl: '/images/pic.jpg'
			};

			insertTest(expectedMarkup);

		});

		it('should emit "insertImage" with Title, Alt, Url and left alignment', function () {

			var expectedMarkup = '<img src="/images/pic.jpg" alt="Image alt" title="Image title" class="sf-image-right" />';

			scope.insertOptions = {
				alignment: 'right'
			};

			scope.image = {
				Title: 'Image title',
				AlternativeText: 'Image alt',
				MediaUrl: '/images/pic.jpg'
			};

			insertTest(expectedMarkup);

		});

		it('should emit "insertImage" with Title, Alt, Url and center alignment', function () {

			var expectedMarkup = '<img src="/images/pic.jpg" alt="Image alt" title="Image title" class="sf-image-center" />';

			scope.insertOptions = {
				alignment: 'center'
			};

			scope.image = {
				Title: 'Image title',
				AlternativeText: 'Image alt',
				MediaUrl: '/images/pic.jpg'
			};

			insertTest(expectedMarkup);

		});

	});

    describe('Directive: sfImageSelectorModal', function () {

    	var element = angular.element('<sf-image-selector-modal></sf-image-selector-modal>'),
			promiseArg,
		    modalInstance = {
			    close: function() {},
			    result: {
				    then: function(action) {
					    action(promiseArg);
				    }
			    }
		    };

        beforeEach(inject(function ($injector) {

	        scope = $injector.get('$rootScope');
	        scope.$modalInstance = modalInstance;
	        $compile(element)(scope);
	        scope.$digest();

        }));

        it('should call scope.$modalInstance.close() when any of the child scopes emits "Cancel" command', function () {

        	var childScope = scope.$new();
	        spyOn(modalInstance, 'close');

            // emit "Cancel" command from child scope
        	childScope.$emit('Cancel');

	        expect(modalInstance.close).toHaveBeenCalled();
        });

	    it('should subscribe to insertImage command, trigger DOM insertImage event on the modal instance and close the modal', function() {

		    var childScope = scope.$new(),
			    expectedMarkup = '<img src="pic.jpg" />';

			promiseArg = expectedMarkup;

		    spyOn($.fn, 'trigger');
		    spyOn(modalInstance, 'close');

	    	// emit "insertImage" command from child scope
	    	childScope.$emit('insertImage', expectedMarkup);

	    	expect(modalInstance.close).toHaveBeenCalled();
		    scope.$digest();
		    expect($.fn.trigger).toHaveBeenCalledWith('insertImage', expectedMarkup);
	    });

    });

});