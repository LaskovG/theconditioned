current_mess_type = null;

// считаем высоту элемента экрана
function getElementTop(elemId)
{
    var elem = document.getElementById(elemId);
    var t = 0;

    while (elem) {
        t += elem.offsetTop;
        elem = elem.offsetParent;
    }

    return t;
}

// считаем разрешение экрана
function findDimensions()
{
    var width = 0, height = 0;
    if (window.innerWidth) {
        width = window.innerWidth;
        height = window.innerHeight;
    } else if (document.body && document.body.clientWidth) {
        width = document.body.clientWidth;
        height = document.body.clientHeight;
    }
    if (document.documentElement && document.documentElement.clientWidth) {
        width = document.documentElement.clientWidth;
        height = document.documentElement.clientHeight;
    }

    var ret = new Array();
    ret['width']=width;
    ret['height']=height;

    return ret;
}


function getBodyScrollTop()
{
    return self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop);
}


function openMailFriend(auto_position, level1)
{   
    if (isGuest()) {
        $.app.notice($.app.notices.authRequired, {"action":"отправки писем"});
    } else {
        var $modal = $('<div class="darkScreen" id="shareModal"></div>');
        $("body").prepend($modal);
        $modal.css({'zIndex':900, 'cursor' : 'pointer'}).fadeIn();
        $('#shareModal').bind("click", function(){
            closeMailFriend();
        });
        if (typeof(auto_position) == 'undefined') {
            auto_position = true;
        }
        $('#div_send_mail').css('display', 'block');
        current_mess_type = 'email';
        $( "#ps_user_to" ).autocomplete('disable');
        $(function(){ $( "#ps_user_to" ).autocomplete('disable'); });
        if (auto_position) {
            monitor = findDimensions();
            topScroll = getBodyScrollTop();

            if (level1 == true) {
                newtop = topScroll + (monitor['height']-$('#div_send_mail').get(0).offsetHeight)/2 - getElementTop('block_social_open') - 160;
            } else {
                newtop = topScroll + (monitor['height']-$('#div_send_mail').get(0).offsetHeight)/2 - getElementTop('content_block') - 160;
            }

            $('#div_send_mail > .send_alert').css('marginTop', newtop);
        }
    }
}


function openMailFriendTrailers(auto_position, level1)
{
    if (typeof(auto_position) == 'undefined') {
        auto_position = true;
    }

    if (isGuest()) {
        $.app.notice($.app.notices.authRequired, {"action":"отправки писем"});
    } else {
        current_mess_type = 'email';
        $('#div_send_mail').css('display', 'block');
        $( "#ps_user_to" ).autocomplete('disable');
        $(function(){ $( "#ps_user_to" ).autocomplete('disable'); });
        if (auto_position) {
            monitor = findDimensions();
            topScroll = getBodyScrollTop();

            if (level1 == true) {
                newtop = topScroll + (monitor['height']-$('#div_send_mail').get(0).offsetHeight)/2 - getElementTop('block_social_open') - 180;
            } else {
                newtop = topScroll + (monitor['height']-$('#div_send_mail').get(0).offsetHeight)/2 - getElementTop('content_block') - 180;
            }

            $('#div_send_mail > .send_alert').css({'top': newtop,'position':'absolute'});
        }
    }
}

function sendMailFriend()
{
    $('.send').get(0).disabled=true;
    var user_to = $('#ps_user_to').val();
    var mail_body = $('#mail_body').val();
    var mess_type = $('#mess_type').val();

    if (user_to == 'e-mail друга' || user_to == 'никнейм друга на КиноПоиске' || mail_body == '') {
        alert('Заполните все поля.');
        $('.send').get(0).disabled=false;
        return false;
    }

    if (typeof(mail_subj) == 'undefined') {
        mail_subj = '';
    }

    if (mess_type == 'email') {
        mail_reg = /^[-._a-z0-9]+@[-._a-z0-9]+\.[a-z]{2,6}$/i;
        if (!mail_reg.test(user_to)) {
            $('.send').get(0).disabled=false;
            return false;
        }
    } else {
        user_to=$('#ps_user_to_id').val();
    }

    var now = new Date();

    $.post(
        '/handler_send_news_to_friend.php',
        {user_to: user_to, mail_body: mail_body, mess_type: mess_type, level_from: level_from, mail_subj: mail_subj, rnd: now.getTime()},
        function(data) {
            if (data == 'user not found') {
                alert('Пользователь '+user_to+' не обнаружен.');
            } else if (data == 'spam') {
                alert('Слишком много сообщений!');
            } else {
                if (mess_type == 'ps') {
                    alert('Сообщение отправлено.');
                } else {
                    alert('Письмо отправлено.');
                }
            }
            closeMailFriend();
            $('.send').get(0).disabled=false;
        }
    );
}

function closeMailFriend()
{
    $( "#ps_user_to" ).val('').autocomplete('close');
    changeSendType('ps');
    changeSendType('email');
    $('#div_send_mail').css('display', 'none');
    current_mess_type = null;
    $("#shareModal").remove();
}

function changeSendType(type)
{
    if ($('#mess_type').val() == type) {
        return;
    }

    $('#mess_type').val(type);

    switch (type) {
        case 'email':
            current_mess_type = 'email';
            $('#ps_user_to').val('e-mail друга');
            $( "#ps_user_to" ).autocomplete('disable');
            $('#ps_user_to_id').val('');
            if (typeof(reDrawUsers) == 'function') {
                reDrawUsers();
            }

            $('#user_from').val('от: '+email_from);
            $('#b_email').removeClass('link');
            $('#b_ps').addClass('link');
            if($('.send_alert .send').get(0))
                $('.send_alert .send').get(0).disabled=false;
            break;

        case 'ps':
            current_mess_type = 'ps';
            $('#ps_user_to').val('никнейм друга на КиноПоиске');
            $( "#ps_user_to" ).autocomplete('enable');
            $('#user_from').val('от: '+login_from);
            $('#b_email').addClass('link');
            $('#b_ps').removeClass('link');
            if ($('.send_alert .send').get(0)) {
                $('.send_alert .send').get(0).disabled = true;
            }
            break;
    }
}