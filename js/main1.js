$(function () {
    var home = $('body').attr('home');
    //login 
    firebase.auth().onAuthStateChanged(function () {
        var user = firebase.auth().currentUser;
        console.log(user);
        if (user) {
            $('#navLogin').hide();
            $('#navProfile').show();
            $('#navUserName').html(user.displayName);
        }
        else {
            $('#navLogin').show();
            $('#navProfile').hide();
        }
        $("#preloader").fadeOut("fast", function () {
            $(this).remove();
        });
    });


    autosize($('textarea'));
});

