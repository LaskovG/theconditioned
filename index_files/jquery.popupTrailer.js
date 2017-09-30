/**
 * Попап с трейлером к фильму
 */
(function($){
    var initTimer = null;
    var infoTimerOn, infoTimerOff = null;
    var items = [];
    var scrollTop;
    //var current_mess_type;
    var popupShare;
    var CONST_BLOCK_POPUP_TRAILER = 8388608; // тип расширенного слоя в трейлерах (x2)
    var forceDoubleSize = false;
    $.extend({
        popupTrailer: function(item,doubleSize){
            if (initTimer) {
                clearTimeout(initTimer);
            }
            if(doubleSize) {
                forceDoubleSize = true;
            }
            items[items.length] = $.extend(item, {init: false});

            initTimer = setTimeout(function(){
                init();
            }, 50);
        }
    });

    function init()
    {
        var notInitItems = getNotInitItems();
        var ids = [];

        if (notInitItems.length) {
            for (var k = 0; k < items.length; k++) {
                ids[ids.length] = items[k].fid;
            }

            $.post('/handler_trailer_popup.php', {ids: ids.join(), rnd: (new Date()).getTime()}, function(resp){
                for (var k = 0; k < items.length; k++) {
                    if (!items[k].init && in_array(items[k].fid, ids)) {
                        items[k].init = true;
                        for (var i = 0; i < resp.items.length; i++) {
                            if (resp.items[i].fid == items[k].fid) {
                                $.extend(items[k], resp.items[i]);
                                initItem(items[k]);
                            }
                        }
                    }
                }
            }, 'json');
        }
    }

    function initItem(item)
    {
        var btnPlay = $('<div class="playTrailer"></div>');

        item.appendTo.append(btnPlay);
        $.each([item.clickTo, btnPlay], function(i, obj){
            obj.click(function(){
                showPosterClickedTrailer(item);
                return false;
            });
        });
    }

    function getNotInitItems()
    {
        var ret = [];
        for (var k = 0; k < items.length; k++) {
            if (!items[k].init) {
                ret[ret.length] = items[k];
            }
        }
        return ret;
    }

    function in_array(val, ar)
    {
        for (var k = 0; k < ar.length; k++) {
            if (ar[k] == val) {
                return true;
            }
        }

        return false;
    }

    function showPosterClickedTrailer(item)
    {
        hideRightBanner();

        var popup_trailer_type = ($.cookie('hideBlocks') & CONST_BLOCK_POPUP_TRAILER) || forceDoubleSize;
        var html = '' +
            '<form id="lj_hidden_form_trailer" method="post" accept-charset="utf-8" name="lj_hidden_form" action="https://www.livejournal.com/update.bml" target="_blank">' +
            '<input value="'+item.tname+' к '+item.dtitle+': &laquo;'+item.rus+'&raquo; '+item.od_url+'" name="event" type="hidden">' +
            '<input value="'+'Видео к '+item.dtitle+': &laquo;'+item.rus+'&raquo;'+'" name="subject" type="hidden">' +
            '</form>' +
            '<table class="posterClickedTrailer"><tr><td>' +
            '   <div class="block" ' + ((popup_trailer_type) ? 'style="width: 804px; left:-7px"' : '') + '>' +
            '      <div class="title">' +
            '         <a href="/level/1/film/'+item.fid+'/">'+item.rus+'</a>' +
                      ((item.name || item.year) ? '<span class="eng_year">'+(item.name ? item.name+(item.year ? ' ' : '') : '')+(item.year ? '('+item.year+')' : '')+'</span>' : '') +
            '      </div>' +
            '      <div class="trailer clearfix">' +
            '         <div class="statH"><div class="stat">' +
                         (item.login ? '<p class="AddFileUser"><i>файл добавил</i><a href="' + item.ulink + '">' + item.login + '</a></p>' : '') +
            '            <div class="item time"><s></s>'+item.duration+'</div>' +
            '            <div class="item views"><s></s>'+item.rating+'</div>' +
            '            <div class="item comments"><s></s><a href="'+item.this_url+'#comm0">'+item.comms+'</a></div>' +
            '         </div></div>' +
            '         <a id="bigVideoButton" href="" ' + ((popup_trailer_type) ? 'class="active"' : '') + '></a>' +
            '         <div class="trailer" style="width:'+item.w+'px; height:'+item.h+'px"><div id="fc_t' + item.id + '"></div></div>' +
            '      </div>' +
            '      <div class="synopsis">'+item.desc+'</div>' +
            '      <div class="share">' +
            '         <ul class="list">' +
            '            <li class="lj"><a href="#" title="Добавьте ссылку на эту страницу в ЖЖ"></a></li>' +
            '            <li class="vk"><a href="#" title="Добавьте ссылку на эту страницу в Vkontakte"></a></li>' +
            '            <li class="fb"><a href="#" title="Добавьте ссылку на эту страницу в Facebook"></a></li>' +
            '            <li class="tw"><a href="https://twitter.com/home?status='+item.tw_txt+'" title="Добавьте ссылку на эту страницу в Twitter" target="_blank"></a></li>' +
            '            <li class="ok"><a href="#" data-url="'+item.od_url+'" title="Добавить в Одноклассники" target="_blank"></a></li>' +
            '            <li class="send"><a href="#" title="Отправьте ссылку на эту страницу другу"></a></li>' +
            '         </ul>' +
            '         <span>поделитесь с друзьями</span>' +
            '      </div>' +
            '      <div class="socH"><div class="soc">' +
            '         <div class="fb"><iframe src="https://www.facebook.com/plugins/like.php?href='+item.fb_url+'&locale=en_US&send=false&layout=button_count&width=96&show_faces=false&action=like&colorscheme=light&font=arial&height=21" scrolling="no" frameborder="0" allowTransparency="true"></iframe></div>' +
            '         <div class="go"><g:plusone size="medium" href="'+item.go_url+'"></g:plusone></div>' +
            '         <div class="vk"><div id="vk_like"></div></div>' +
            '      </div></div>' +
            '      <div class="clear both"></div>' +
            '      <div class="close">' +
            '         <div class="icon"></div>' +
            '      </div>' +
            '   </div>' +
            '   <form name="lj_hidden_form" action="/redirect_lj.php?type=popupTrailer&id='+item.fid+'" method="post" target="_blank"></form>' +
            '</td></tr></table>';

        scrollTop = $(window).scrollTop();
        $('body')
            .append(html)
            .addClass('posterClickedTrailerOverflow');
        $('.dark').show();

        setTimeout(function(){
            // Google+
            // http://www.google.com/intl/ru/webmasters/+1/button/
            window.___gcfg = {lang: 'ru'};
            var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
            po.src = 'https://apis.google.com/js/plusone.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);

            VK.Widgets.Like("vk_like", {
                pageUrl: VKCheck(top.location.href),
                width: 250,
                type: "mini",
                fixed: true,
                pageTitle: VKCheck('рекомендует видео к '+item.dtitle+': &laquo;'+item.rus+'&raquo;'),
                pageDescription: VKCheck(item.tname+' к '+item.dtitle+': &laquo;'+item.rus+'&raquo;')
            });
        }, 250);
        setTimeout(function(){
            $('.posterClickedTrailer').fadeIn();
        },100);

        $('.posterClickedTrailer')
            .click(function(){
                closePosterClickedTrailer();
            })
            .find('.trailer').css({
                'margin-left': Math.round((630 - item.w) / 2)
            }).end()
            .find('.block')
                .click(function(event){
                    event.stopPropagation();
                })
                .mouseover(function(){
                    if (infoTimerOff) {
                        clearTimeout(infoTimerOff);
                    }
                    infoTimerOn = setTimeout(function(){
                        $('.posterClickedTrailer').find('.stat, .share, .soc').fadeIn(400);
                    }, 200);
                })
                .mouseout(function(){
                    if (infoTimerOn) {
                        clearTimeout(infoTimerOn);
                    }
                    infoTimerOff = setTimeout(function(){
                        $('.posterClickedTrailer').find('.stat, .share, .soc').fadeOut(400);
                    }, 200);
                })
                .end()
            .find('.close').click(function(event){
                event.stopPropagation();
                closePosterClickedTrailer();
            }).end()
            .find('li.lj a').click(function(){
                $('#lj_hidden_form_trailer').submit();
                return false;
            }).end()
            .find('li.vk a').click(function(){
                PopupCenter('https://vk.com/share.php?url='+item.vk_url, 'title', 625, 450);
                return false;
            }).end()
            .find('li.fb a').click(function(){
                PopupCenter('https://www.facebook.com/sharer.php?u='+item.fb_url, 'title', 625, 450);
                return false;
            }).end()
            .find('li.ok a').click(function(){
                PopupCenter('https://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1000&st._surl=' + $(this).attr('data-url') , 'title', 625, 450);
                return false;
            }).end()
            .find('li.send a').click(function(){
                openMailFriend(item);
            });

        var item_w = (popup_trailer_type) ? item.w * 1.45 : item.w;
        var item_h = (popup_trailer_type) ? item.h * 1.45 : item.h;
        getTrailer('t' + item.id,'/trailers/'+item.fid+'/'+item.file,false,item_w,item_h,getTrailersDomain(),'',(item.sbt ? item.fid+'/'+item.id+'_'+item.sbt+'.xml' : ''),true,false,false,{
            "id" : item.fid,
            "name" : item.rus_plain,
            "publisher_id" : item.publisher_id,
            "publisher_name" : item.publisher_name,
            "genre_ids" : item.genre_ids,
            "genre_names" : item.genre_names,
            "charset" : "utf-8",
        });

        // send metrika params
        var type = getFilmType(item.id) === 'movie' ? 'film' : 'series';
        sendMetrikaTrailerStartParams(type, item.fid, 't' + item.id, 'filmpage');

        $("#bigVideoButton").click(function(event){
            event.preventDefault()
            if ($(this).is('.active')) {
                $('#Trailer, #t' + item.id).css({
                    width: item.w,
                    height: item.h
                });
                $('.posterClickedTrailer .block').css({'width': '634px', 'left': '0px'});
                $(this).removeClass('active');
                updateHideBlockCookie(CONST_BLOCK_POPUP_TRAILER, false);
            } else {
                $('#Trailer, #t' + item.id).css({
                    width: item.w * 1.45,
                    height: item.h * 1.45
                });
                $('.posterClickedTrailer .block').css({'width': '804px', 'left': '-7px'});
                $(this).addClass('active');
                updateHideBlockCookie(CONST_BLOCK_POPUP_TRAILER, true);
            }
        });
    }

    function closePosterClickedTrailer()
    {
        closeMailFriend();
        $('.dark').hide();
        $('body').removeClass('posterClickedTrailerOverflow');
        $('.posterClickedTrailer').remove();
        setTimeout(function(){
            $("html,body").animate({scrollTop: scrollTop});
            //$(window).scrollTop(scrollTop);
        }, 250);

        showRightBanner();
    }

    function openMailFriend(item)
    {
        if (isGuest()) {
            $.app.notice($.app.notices.authRequired, {"action":"отправки писем"});
            return;
        }
        var html_code = '' +
            '<div class="popupShare" id="div_send_mail" ps_type="email" style="z-index:2000">' +
            '   <div class="send_alert">' +
            '      <form action="">' +
            '         <a class="close" href="#" onclick="closeMailFriend(); return false"></a>' +
            '         <p>Послать ссылку на <b id="b_email">email</b> или через <b id="b_ps" class="link">персональное сообщение</b></p>' +
            '         <div class="fake_input mykp_m">' +
            '            <ul class="active_user_list"></ul>' +
            '            <img class="loader_in_fake" src="/images/loaders/f60_fff.gif" alt="" />' +
            '            <input id="ps_user_to" tabindex="1" type="text" value="e-mail друга" style="margin: 3px; width: 200px; border: none" />' +
            '            <input id="ps_user_to_id" type="hidden" value="" />' +
            '         </div>' +
            '         <div class="vbmenu_popup" id="pmrecips_menu" style="display: none; z-index: 50"></div>' +
            '         <input class="text disabled" id="user_from" type="text" value="от: '+getEmailFrom()+'" disabled="disabled" />' +
            '         <textarea cols="1" rows="1" id="mail_body">Привет!\n\nВидео к '+item.dtitle+' «'+item.rus+'» на КиноПоиске:\n'+item.this_url+'\n('+item.tname+')</textarea>' +
            '         <input class="send" type="button" value="отправить" />' +
            '         <input class="close" type="button" value="закрыть" onclick="closeMailFriend()"/>' +
            '         <span><i>*</i> КиноПоиск не сохраняет в базе данных e-mail адреса, вводимые в этом окне, и не собирается использовать их для каких-либо посторонних целей</span>' +
            '      </form>' +
            '   </div>' +
            '</div>';
        $('body').append(html_code);

        setTimeout(function(){
            popupShare = $('.popupShare');

            popupShare
                .find('.close').click(function(){
                    closeMailFriend();
                    return false;
                }).end()
                .find('#b_email').click(function(){
                    changeSendType('email');
                }).end()
                .find('#b_ps').click(function(){
                    changeSendType('ps');
                }).end()
                .find('#ps_user_to')
                    .click(function(){
                        if (this.value == 'e-mail друга' || this.value == 'никнейм друга на КиноПоиске') {
                            this.value = '';
                        }
                    })
                    .focus(function(){
                        if (this.value == 'e-mail друга' || this.value == 'никнейм друга на КиноПоиске') {
                            this.value = '';
                        }
                    })
                    .end()
                .find('.send').click(function(){
                    sendMailFriend();
                }).end()
                .find('.fake_input').click(function(){
                    $('#ps_user_to').focus();
                });

            current_mess_type = 'email';
        }, 250);
        return false;
    }

    function closeMailFriend()
    {
        if ($('.popupShare').attr('ps_type') == 'ps') {
            removePsUserTo();
        }
        $('.popupShare').remove();
    }

    function changeSendType(type)
    {
        if (current_mess_type == type) {
            return;
        }

        current_mess_type = type;

        popupShare.find('#b_email').toggleClass('link', current_mess_type == 'ps');
        popupShare.find('#b_ps').toggleClass('link', current_mess_type == 'email');

        switch (type) {
            case 'email':
                popupShare.attr('ps_type',type);
                popupShare.find('#ps_user_to').val('e-mail друга');
                popupShare.find('#user_from').val('от: '+getEmailFrom());

                popupShare.find('#ps_user_to_id').val('');
                removePsUserTo();

                if (typeof(reDrawUsers) == 'function') {
                    reDrawUsers();
                }
                break;

            case 'ps':
                popupShare.attr('ps_type',type);
                popupShare.find('#ps_user_to').val('никнейм друга на КиноПоиске');
                popupShare.find('#user_from').val('от: '+getLoginFrom());
                initPsUserTo();
                break;
        }
    }

    function sendMailFriend()
    {
        var user_to = current_mess_type == 'email' ? popupShare.find('#ps_user_to').val() : popupShare.find('#ps_user_to_id').val();
        var mail_body = popupShare.find('#mail_body').val();

        if (user_to == 'e-mail друга' || user_to == 'никнейм друга на КиноПоиске' || mail_body == '') {
            alert('Заполните все поля.');
            return false;
        }

        if (current_mess_type == 'email') {
            var mail_reg = /^[-._a-z0-9]+@[-._a-z0-9]+\.[a-z]{2,6}$/i;
            if (!mail_reg.test(user_to)) {
                return false;
            }
        }

        popupShare.find('.send').prop('disabled', true);

        var sendData = {
            user_to: user_to,
            mail_body: mail_body,
            mess_type: current_mess_type,
            level_from: 16,
            rnd: (new Date()).getTime()
        };

        $.post('/handler_send_news_to_friend.php', sendData, function(data){
            if (data == 'user not found') {
                alert('Пользователь '+user_to+' не обнаружен.');
            } else if (data == 'spam') {
                alert('Слишком много сообщений!');
            } else {
                if (current_mess_type == 'ps') {
                    alert('Сообщение отправлено.');
                } else {
                    alert('Письмо отправлено.');
                }
            }
            popupShare.find('.send').prop('disabled', false);
            closeMailFriend();
        });
    }

    function hideRightBanner()
    {
        $('#loadb_').find('div[id^="ad_ph_"]').css({'display': 'none'});
    }

    function showRightBanner()
    {
        $('#loadb_').find('div[id^="ad_ph_"]').css({'display': 'block'});
    }
})(jQuery);
