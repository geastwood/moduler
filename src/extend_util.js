moduler.extend(function(foundation) {
    var each = function(obj) {
        console.log('each method');
    };
    foundation.ARRAY = {
        foreach: each
    };
});
