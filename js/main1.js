$(function () {
    var body = $('body');
    var home = body.attr('home');
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

    // forum showprofile
    $('.showpf').hover(function () {
        let offset = $(this).offset(), show = $('.showprofile');

        function settop(t) {
            if (t - $(window).scrollTop() > 300)
                return t - $(window).scrollTop() - 215;
            else
                return t - $(window).scrollTop() + 55;
        }
        offset.top = settop(offset.top);
        // console.log(offset.top)
        offset.left -= 125 - $(this).width() / 2;
        show.css(offset);
        show.css('display', 'flex');
    }, function () {
        $('.showprofile').css('display', 'none');
    })

    $('.forum').hover(function () {
        window.history.pushState({}, 0, 'http://' + window.location.host + '/forum.html#' + '001');

    })

    // mailbox write email
    $('#writeEmail').on('click', function () { $('.write.email').toggle(), $(this).toggleClass('closed'); });
    $('#writeEmail1').on('click', function () { $('.write.email').toggle(), $('#writeEmail').toggleClass('closed'); });
    $('#backMail').on('click', function () { $(this).parents('.mail-show').hide(), $('.trash-can').toggle(), $('.writeMail').toggle() });
    $('tr.mails').on('click', function () { $('.mail-show').show(), $('.trash-can').toggle(), $('.writeMail').toggle() });
    $('#trashmail').on('click', function () { $('.trash-email').toggle() });


});

