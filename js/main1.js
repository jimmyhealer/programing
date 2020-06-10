// firebase state design
var FSD = 'test';

$(function () {
    var body = $('body'), user;
    var home = body.attr('home'), profile = body.attr('profile');
    //login 
    firebase.auth().onAuthStateChanged(function () {
        user = firebase.auth().currentUser;
        // console.log(user);
        if (user) {
            $('#navLogin').hide();
            $('#navProfile').show();
        }
        else {
            $('#navLogin').show();
            $('#navProfile').hide();
        }
        $("#preloader").fadeOut("fast", function () {
            $(this).remove();
        });
        if (!profile)
            if (!user.displayName)
                $.confirm({
                    title: '請完善個人資料',
                    content: '你的名字還未完善!!',
                    buttons: {
                        '去跳轉': function () {
                            window.location.href = 'profile.html?1';
                        }
                    }
                });
    });

    // forum showprofile
    $('.showpf').on('hover', function () {
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
        // window.history.pushState({}, 0, 'http://' + window.location.host + '/forum.html#' + this.$scope.forumArray.id);
    })

    // shave
    const trashWidth = $('.trash-email').width(), writeWidth = $('.write.email').width();
    changeWidth(trashWidth, writeWidth);

    $('#mailBox').click(function () {
        setTimeout(function () { changeWidth(trashWidth, writeWidth); }, 100);
    })

    $(window).resize(function () { changeWidth(trashWidth, writeWidth); })

    // $('.exp').shave(23, { character: '...更多' });

    // mailbox write email
    $('#writeEmail').on('click', function () { $('.write.email').toggle(), $(this).toggleClass('closed'); });
    $('#writeEmail1').on('click', function () { $('.write.email').toggle(), $('#writeEmail').toggleClass('closed'); });
    $('#backMail').on('click', function () { $(this).parents('.mail-show').hide(), $('.trash-can').toggle(), $('.writeMail').toggle() });
    $('tr.mails').on('click', function () { $('.mail-show').show(), $('.trash-can').toggle(), $('.writeMail').toggle() });
    $('#trashmail').on('click', function () { $('.trash-email').toggle() });


    // wave button
    try {
        Waves.attach('.wave-btn', ['waves-circle']);
        Waves.init();
    } catch{ }

    // trash-table
    // $('.trash-table').width($('.mytable').width())


    // test
});

// string replace all prototype 
String.prototype.replaceAll = function (f, r) { return this.split(f).join(r); }

// angluar
var app = angular.module("programingApp", ['firebase', "ngSanitize"]);

app.factory("Auth", ["$firebaseAuth",
    function ($firebaseAuth) {
        return $firebaseAuth();
    }
]);

app.factory('AuthState', ['$q', 'Auth', function ($q, Auth) {
    deferred = $q.defer(), promise = deferred.promise;
    Auth.$onAuthStateChanged(function (user) {
        // $scope.user = user;
        if (user) {
            $('#navLogin').hide();
            $('#navProfile').show();
        }
        else {
            $('#navLogin').show();
            $('#navProfile').hide();
        }
        deferred.resolve(user);
    });
    return promise;
}]);


// https://reurl.cc/O1LQK9 onErrorSrc

app.controller('profiles', ['$scope', '$q', '$sce', '$filter', 'AuthState',
    function ($scope, $q, $sce, $filter, AuthState) {
        var user = {}, ref, last = {}, page = 1, length, nohasmail = $('.nohas-mail');
        $scope.page = 1;
        $scope.mailArray = [];
        $scope.trashMailArray = [];
        // $scope.test = `<h1 style='color: orange'>vhs</h1>`;


        $scope.searchChange = function () {
            length = $filter('filter')($scope.mailArray, $scope.searchMail).length;
            // console.log(length)
            $scope.page = 1;
            nohasmailToggle(length, $scope.page);
        }

        $scope.pageBefore = function () {
            // length = $filter('filter')($scope.mailArray, $scope.searchMail).length;
            if ($scope.page > 1)
                $scope.page -= 1;
            nohasmailToggle(length, $scope.page);
        };
        $scope.pageNext = function () {
            // length = $filter('filter')($scope.mailArray, $scope.searchMail).length;
            // console.log(length);
            if (length > 7 * page)
                // showMailList(),  先不做限制
                page++;
            if ($scope.page * 7 < length) {
                $scope.page += 1;
                nohasmailToggle(length, $scope.page);
            }
        };

        function nohasmailToggle(a, b) { a >= 7 * b ? nohasmail.hide() : nohasmail.show(); }

        // function AuthState() {
        //     deferred = $q.defer(), promise = deferred.promise;
        //     $scope.auth.$onAuthStateChanged(function (user) {
        //         $scope.user = user;
        //         if (user) {
        //             $('#navLogin').hide();
        //             $('#navProfile').show();
        //         }
        //         else {
        //             $('#navLogin').show();
        //             $('#navProfile').hide();
        //         }
        //         deferred.resolve(user);
        //     });
        //     return promise;
        // }

        function mailBoxList(ref) {
            var deferred = $q.defer(), promise = deferred.promise, mailArrays = [];
            ref.get().then(doc => {
                doc.forEach(element => {
                    var data = element.data();
                    data.id = element.id;
                    mailArrays.push(data);
                });
                last = doc.docs[doc.docs.length - 1];
                // console.log(last, doc.docs);
                // ref = fs.collection(FSD).doc(user.email).collection('mail')
                //     .orderBy('date', 'desc').startAfter(last).limit(8);
                // console.log(mailArrays);
                deferred.resolve(mailArrays);
            }).catch((error) => deferred.reject(error));
            return promise;
        }

        function showMailList() {
            AuthState
                .then((users) => {
                    user = users;
                    $scope.user = user;
                    ref = fs.collection(FSD).doc(user.email).collection('mail')
                        .orderBy('date', 'desc')
                    // .startAfter(last).limit(8); 先不做限制，因為有些BUG
                    return mailBoxList(ref);
                })
                .then((result) => {
                    console.log(result)
                    result.forEach(element => {
                        if (element.remove)
                            $scope.trashMailArray.push(element);
                        else
                            $scope.mailArray.push(element);
                    });
                    // console.log('$scope:', $scope.mailArray)
                    length = $scope.mailArray.length;
                    if (length >= 7) $('.nohas-mail').hide();
                }, fail => { console.log(fail) })
                .finally(() => {
                    // !!!要修改!!!
                    setTimeout(() => {
                        var w = $('.mailbox').width();
                        $('.subject.ellipsis').width(w >= 688 ? w - 320 : w - 76);
                        setTimeout(() => {
                            $("#preloader").fadeOut("fast", function () {
                                $(this).remove();
                            })
                        }, 500)
                    }, 0);
                    // console.log($scope.mailArray)
                    // !!!要修改!!!
                    // console.log('done')
                });
        }

        showMailList();

        $scope.mailLook = function () {
            var _this = this.item;
            if ($scope.mail != _this) {
                if (!_this.read) {
                    fs.collection(FSD).doc(user.email).collection('mail').doc(_this.id).update({ 'read': true });
                    _this.read = true;
                }
                $scope.mail = _this;
                $scope.mail.content = $sce.trustAsHtml($scope.mail.content);
            }
            $('.mail-show').show();
            $('.trash-can').toggle(); $('.writeMail').toggle()
        }

        function delMail(mail) {
            var ref = fs.collection(FSD).doc(user.email).collection('mail');
            var deferred = $q.defer(), promise = deferred.promise;
            ref.doc(mail).delete().then(() => {
                deferred.resolve('success');
            }).catch((error) => deferred.reject(error));
            return promise;
        }

        function editMailState(mail, op) {
            // var ref = fs.collection(FSD).doc(user.email).collection('mail');
            var deferred = $q.defer(), promise = deferred.promise;
            fs.collection(FSD).doc(user.email).collection('mail').doc(mail).update({ remove: op })
                .then(() => {
                    deferred.resolve('success');
                })
            return promise;
        }

        $scope.mailRemove = function (isMailShow) {
            var mail = this.item, index;
            if (isMailShow === 2) {
                index = $scope.trashMailArray.indexOf(mail);
                delMail(mail.id)
                    .then(() => {
                        $scope.trashMailArray.splice(index, 1)
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
            else {
                if (isMailShow) mail = this.mail, index = this.mailArray.indexOf(mail);
                else index = $scope.mailArray.indexOf(mail);
                editMailState(mail.id, 1).then(() => {
                    $scope.mailArray.splice(index, 1);
                    $scope.trashMailArray.push(mail);
                    // console.log($scope.mailArray, $scope.trashMailArray);
                    nohasmailToggle($filter('filter')($scope.mailArray, $scope.searchMail).length, $scope.page);
                })
                if (isMailShow) $('.mail-show').hide(), $('.trash-can').toggle(), $('.writeMail').toggle();
            }
        }

        $scope.mailRevert = function () {
            var mail = this.item, index = $scope.trashMailArray.indexOf(mail);
            editMailState(mail.id, 0).then(() => {
                $scope.trashMailArray.splice(index, 1);
                $scope.mailArray.push(mail);
                $scope.mailArray.sort((a, b) => (a.date.toDate() < b.date.toDate()) ? 1 : ((b.date.toDate() < a.date.toDate()) ? -1 : 0));
                length = $filter('filter')($scope.mailArray, $scope.searchMail).length
                nohasmailToggle(length, $scope.page);
            })
        }

        $scope.action = function () {

            console.log($filter('filter')($scope.mailArray, $scope.searchMail));
        }
    }]);

app.controller('forums', ['$scope', '$q', 'AuthState', function ($scope, $q, AuthState) {
    AuthState.then((user) => { $scope.user = user });
    $scope.forumArray = [];

    // ????.0.0__  {_0.
    $scope.flickityOptions = {
        cellSelector: '.f-img',
        resize: false,
        setGallerySize: false,
        friction: .4,
        selectedAttraction: .1,
    };

    // $scope.test = { tests: 'sd' }
    function getForumPost() {
        var deferred = $q.defer(), promise = deferred.promise;
        var ref = fs.collection('test-forum');
        function docx(id) {
            var js = []
            return new Promise((resolve, reject) => {
                ref.doc(id).collection('reply').get().then(docs => {
                    docs.forEach(element => {
                        js.push(element.data())
                    });
                    resolve(js);
                })
            });
        }
        ref.get().then(doc => {
            var ds = [], af = {};
            doc.forEach(element => {
                af = element.data();
                docx(element.id).then((data) => {
                    af.reply = data;
                    console.log('2')
                })
                    .finally(() => {
                        ds.push(af);
                        console.log('1')
                        deferred.resolve(ds);
                    })
                console.log('3')
            })
        })

        return promise;
    }
    getForumPost().then(data => {
        $scope.forumArray = data;
        console.log($scope.forumArray);
    });

    // var $carousel = $('.f-img').flickity('destory');


}])


// changeWidth

function isExFun(funcName) {
    try {
        if (typeof (eval(funcName)) == "function") {
            return true;
        }
    } catch (e) { }
    return false;
}

function changeWidth(a, b) {
    var w = $('.mailbox').width(), t = $('.trash-email'), r = $('.write.email');
    $('.subject.ellipsis').width(w >= 688 ? w - 320 : w - 76);
    $('.trash-subject.ellipsis').width(w >= 688 ? 330 : w - 136);
    if ($(window).width() < 576)
        t.width(w), r.width(w + 20);
    else if ($(window).width() < 768)
        t.width(w + 30), r.width(w + 50);
    else
        t.width(a), r.width(b);
}

// constructor
class User {
    constructor(username, photoURL) {
        this.username = username;
        this.photoURL = photoURL;
    }
    toString() {
        return this.username + "," + this.photoURL;
    }
}

var userConverter = {
    toFirestore: function (user) {
        return {
            displayName: user.username,
            photoURL: user.photoURL,
        };
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data(options);
        return new User(data.username, data.photoURL);
    },
};
// ?
function pf_error(btn) {
    btn.val("修改完成");
    btn.text("修改完成");
    btn.removeAttr("disabled");
}

// promise
function login(pwd) {
    var user = firebase.auth().currentUser;
    return new Promise((resolve, reject) => {
        firebase.auth().signInWithEmailAndPassword(user.email, pwd)
            .then(() => { resolve('loginS') })
            .catch((error) => { reject(error) });
    })
}

function editprofile(name, url) {
    var user = firebase.auth().currentUser;
    return new Promise((resolve, reject) => {
        user.updateProfile({ displayName: name, photoURL: url })
            .then(() => { resolve('edpfS') })
            .catch((error) => { reject(error) });
    })
}

// 判斷空格 
function isNull(str) {
    if (str == "") return true;
    var regu = "^[ ] $";
    var re = new RegExp(regu);
    return re.test(str);
}

function getUserProfile(mail) {
    var ref = fs.collection(FSD).doc(mail);
    return new Promise((resolve, reject) => {
        ref.get().then(doc => {
            resolve(doc.data());
        }).catch(error => {
            reject(error);
        })
    });
}

async function editfs(name, url, mailData, subject) {
    var user = firebase.auth().currentUser;
    if (isNull(subject) || subject == null) subject = '無主旨'
    if (mailData) {
        var mailRef = fs.collection(FSD).doc(name), mailUserArray = [];
        function userExist() {
            return new Promise((resolve, reject) => {
                mailRef.get().then(doc => { doc.exists ? resolve() : reject('noExist') })
            });
        }

        try {
            await userExist();
            return new Promise((resolve, reject) => {
                mailRef.collection('mail').add({
                    sender: user.displayName,
                    senderMail: user.email,
                    senderPhotoURL: user.photoURL,
                    remove: 0,
                    content: mailData,
                    date: firebase.firestore.FieldValue.serverTimestamp(),
                    subject: subject
                })
                    .then(success => { resolve(success); })
                    .catch(error => { reject(error); });
            });
        }
        catch (fail) {
            console.log(fail);
            $.alert({
                title: '不存在此用戶',
                content: '請重新輸入',
                backgroundDismiss: true
            });
            reject(fail);
        }
    }
    else {
        return new Promise((resolve, reject) => {
            fs.collection('user').doc(user.email)
                .set({ displayName: name, photoURL: url })
                .then(() => { resolve('edfsS') })
                .catch((error) => reject(error));
        });
    }
}

function updatePwd(pwd) {
    var user = firebase.auth().currentUser;
    return new Promise((resolve, reject) => {
        user.updatePassword(pwd)
            .then(() => resolve('upPS'))
            .catch((error) => reject(error));
    });
}

// ckeditor
// if (isExFun(ClassicEditor))
if (typeof ClassicEditor == 'function')
    ClassicEditor
        .create(document.querySelector('#newMailEditor'), {
            toolbar: ['undo', 'redo', '|', 'heading', 'bold', 'italic', 'link', 'bulletedList', 'numberedList',
                '|', 'indent', 'outdent', '|', 'code', 'codeBlock', 'FontFamily', 'FontSize'],
            codeBlock: {},
            fontFamily: {
                options: [
                    'default',
                    '新細明體',
                    'helvetica',
                    'Ubuntu, Arial, sans-serif',
                    'Ubuntu Mono, Courier New, Courier, monospace',
                    'Courier New, Courier, monospace',
                    'Georgia, serif',
                    'Lucida Sans Unicode, Lucida Grande, sans-serif',
                    'Tahoma, Geneva, sans-serif',
                    'Times New Roman, Times, serif'
                ]
            },
            fontSize: {
                options: [
                    9,
                    11,
                    13,
                    17,
                    19,
                    21
                ]
            },
            link: {
                addTargetToExternalLinks: true
            },
            simpleUpload: {
            }
        })
        .then(editor => {
            $('#newMailSend').on('click', function () {
                $(this).html(`<span id='loading' class='spinner-border spinner-border-sm' role='status' aria-hidden='true' style='display: inline-flex;'></span>載入中......`)
                var data = '', re = $('#newRecipient').val(), ns = $('#newSubject').val();
                data = editor.getData();
                // var sss = $(data).find('img');
                // sss.each(function () {
                //     var src = this.src;
                //     this.src = 'img/logo.jpg';
                //     console.log(this);
                //     data = editor.getData();
                // })
                // console.log(data);
                if (data == '') data = '無內容';
                editfs(re, '', data, ns).then(success => {
                    console.log(success)
                    history.go(0);
                }, fail => {
                    $(this).html(`<i class="fa fa-paper-plane mr-2"></i>送出`)
                    console.log(fail);
                });
            })
        })
        .catch(error => {
            console.error(error);
        });