$(function () {
    var body = $('body');

    // flexslider
    if ($.fn.flexslider)
        $(".flexslider").flexslider({
            animation: "fade",
            directionNav: false,
            keyboard: false,
            slideshowSpeed: 5000,
            animationSpeed: 200,
            start: function () {
                setTimeout(function () {
                    $('.innertext').removeClass('animated fadeInUp');
                    $('.flex-active-slide').find('.innertext').addClass('animated fadeInUp');
                }, 350);
            },
            before: function () {
                setTimeout(function () {
                    $('.innertext').removeClass('animated fadeInUp');
                    $('.flex-active-slide').find('.innertext').addClass('animated fadeInUp');
                }, 350);
            }
        });

    //navbar sticky
    if ($.fn.sticky) {
        $(".navbar-meau").sticky({
            topSpacing: 0
        });
    }

    // autoSize

    try {
        autosize($('textarea'));
    } catch{ }

    // profile item
    if (body.attr('profile')) {
        var src = /^[1-3]{1}$/.test(location.search.split("?")[1]);
        if (src)
            showprofile(location.search.split("?")[1]);
    }

    // forum image
    $('.forum-img:nth-child(4)').prev().css('grid-column', 'span 1');
    $('.f-img>.forum-img:nth-child(5)').parent().next().addClass('more');


    //login 
    if ($.fn.validate)
        $(".form-signin").validate({
            rules: {
                password: {
                    required: true,
                    minlength: 6
                },
                email: {
                    required: true,
                    email: true
                }
            },
            messages: {
                password: {
                    required: "請輸入密碼",
                    minlength: "密碼長度不能小於 6 個字元"
                },
                email: "請輸入一個正確的信箱",
            }
        })
    if ($('body').attr('login'))
        if ($.cookie('userEmail'))
            $('#inputEmail').val($.cookie('userEmail'));

    //logout
    $("#signOut").click(function () {
        firebase.auth().signOut();
        // location.replace("index.html");
    });


    //-- profile edit --
    $("#pf_btn").click(function () {
        if ($(this).val() == "修改") {
            $("#div_oldpwd").show();
            $('#pf_username').removeAttr("disabled");
            $(this).val("修改完成");
            $(this).text("修改完成");
        } else {
            var btn = $("#pf_btn");
            var old = $("#pf_oldpwd").val();
            var newpwd = $("#pf_newpwd").val();
            var pwnull = $("#pwdnull");
            var namenull = $("#namenull");
            var username1 = $("#pf_username").val();
            if (username1.length == 0) {
                namenull.show();
                return false;
            }
            namenull.hide();
            if (old.length == 0) {
                pwnull.show();
                return false;
            }
            pwnull.hide();
            if (newpwd.length != 0 && newpwd.length < 6) {
                $("#pwdlittle").show();
                return false;
            }
            $("#pwdlittle").hide();
            $(this).html(
                " <span id='loading' class='spinner-border spinner-border-sm' role='status' aria-hidden='true' style='display: inline-flex;'></span>載入中......"
            );
            $(this).attr("disabled", "");
            $("#loading").css("display", "inline-flex");
            var user = firebase.auth().currentUser;
            login(old)
                .then(success => {
                    console.log(success);
                    return editprofile(username1, user.photoURL);
                }
                    , fail => {
                        throw fail;
                    }
                )
                .then(success => {
                    console.log(success);
                    return editfs(username1, user.photoURL);
                })
                .then(success => {
                    console.log(success);
                    if (newpwd.length >= 6)
                        return updatePwd(newpwd);
                })
                .then(success => {
                    console.log(success);
                })
                .catch(error => {
                    pf_error(btn);
                    if (error.code === 'auth/wrong-password')
                        $('#pwdError').show();
                    else if (error.code === 'auth/too-many-requests')
                        $.alert({
                            title: '密碼輸錯太多次!!',
                            content: '請稍後再試試',
                            backgroundDismiss: true
                        });
                    else
                        $.alert({
                            title: '發生未知錯誤',
                            content: '請聯絡客服，感謝!',
                            backgroundDismiss: true
                        });
                    throw console.log('error:', error)
                })
                .then(() => {
                    console.log('done');
                    history.go(0);
                    return true;
                })
        }
    });



    $("#ud_pwd").click(function () {
        $(this).hide();
        $("#div_newpwd").show();
    });

    $(".img_content .img-circle ,.mask").mouseover(function () {
        $(".img_content .mask").show();
    });
    $(".img_content .img-circle ,.mask").mouseout(function () {
        $(".img_content .mask").hide();
    });

    var img = new Image();

    $("#file").change(function (e) {
        console.log(e.target.files);
        var file = this.files[0],
            fileReader;
        if (file && file.type.indexOf("image") == 0) {
            fileReader = new FileReader();
            fileReader.onload = getFileInfo;
            fileReader.readAsDataURL(file);
            $("#update_ph").show();
        }
    });

    function getFileInfo(evt) {
        img.src = evt.target.result;
    }

    img.onload = function () {
        var canvas = document.createElement("canvas"),
            context = canvas.getContext("2d"),
            compressRatio = 0.7, // 圖片壓縮比例
            imgNewWidth = 150,
            width = this.width,
            height = this.height,
            progress,
            imgNewHeight = (imgNewWidth * height) / width,
            user = firebase.auth().currentUser;
        canvas.width = imgNewWidth;
        canvas.height = imgNewHeight;
        context.clearRect(0, 0, imgNewWidth, imgNewHeight);
        context.drawImage(img, 0, 0, imgNewWidth, imgNewHeight);
        canvas.toBlob(
            function (blob) {
                var uploadTask = storageRef.child("User_photo/" + user.email).put(blob);
                uploadTask.on(
                    "state_changed",
                    function (snapshot) {
                        progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100 - 20;
                        $("#progress_bar").css("width", `${progress}% `);
                        switch (snapshot.state) {
                            case firebase.storage.TaskState.PAUSED:
                                console.log("Upload is paused");
                                break;
                            case firebase.storage.TaskState.RUNNING:
                                console.log("Upload is running");
                                break;
                        }
                    },
                    function (error) {
                        console.log(error);
                    },
                    function () {
                        uploadTask.snapshot.ref
                            .getDownloadURL()
                            .then(function (downloadURL) {
                                console.log(downloadURL);
                                editfs(user.displayName, downloadURL)
                                    .then(success => { return editprofile(user.displayName, downloadURL) })
                                    .catch(error => { console.log(error) })
                                    .finally(() => {
                                        $("#progress_bar").css("width", "100%");
                                        window.setTimeout(function () {
                                            history.go(0);
                                        }, 100);
                                    })
                            });
                    }
                );
            },
            "image/jpeg",
            compressRatio
        );
    };
    // -- profile edit --

});

function showprofile(i) {
    var be = $("div[name='pf']:visible");
    be.hide();
    $("#pf_" + i).show();
    window.history.pushState({}, 0, 'http://' + window.location.host + '/profile.html?' + i);
}


// validate
if ($.fn.validate)
    $.validator.setDefaults({
        submitHandler: function () {
            if ($('input[type=checkbox]').prop('checked'))
                $.cookie('userEmail', $('#inputEmail').val(), { expires: 30 });
            $('#loginBtn').hide();
            $('.spinner-border').show();
            firebase
                .auth()
                .signInWithEmailAndPassword($("#inputEmail").val(), $("#inputPassword").val())
                .then(function () {
                    console.log('sucesss');
                    $(".pwdError").hide();
                    location.replace("index.html");
                })
                .catch(function (error) {
                    console.log('error: ', error.message);
                    $("#inputPassword").value = "";
                    $(".pwdError").show();
                    $('#loginBtn').show();
                    $('.spinner-border').hide();
                });
        }
    });

