describe('sfInfiniteScroll', function () {

    var scope,
        compile;

    beforeEach(module('sfInfiniteScroll'));

    beforeEach(inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();
        compile = $compile;
    }));


    it('sets the overflow-y property to scroll on initialization', function () {

        var markup = '<div sf-infinite-scroll></div>',
            element = compile(markup)(scope);

        scope.$digest();

        expect(element.css('overflow-y')).toEqual('scroll');
    });

});