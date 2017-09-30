// флаги блоков фильма
var CONST_BLOCK_AWAIT = 1; // ожидание
var CONST_BLOCK_RATING_USER = 2; // рейтинг пользователей
var CONST_BLOCK_RATING_CRIT = 4; // рейтинг критиков
var CONST_BLOCK_SOC_NETS = 8; // социальные сети
var CONST_BLOCK_RECOMS = 32; // рекомендации
var CONST_BLOCK_REVIEW_K = 64; // рецензии Кудрявцева
var CONST_BLOCK_FRIENDS_MENTIONS = 128; // Блок "Мнение друзей"
var CONST_BLOCK_LIST = 8192; // списки в которые входит фильм
// 8388608 вынесено в jquery.popupTrailer.js
var CONST_BLOCK_TRIV_FACT = 16777216; // тривии (факты)
var CONST_BLOCK_TRIV_BLOOPER = 33554432; // тривии (киноляпы)
var CONST_BLOCK_SERIAL = 67108864; // сериалы
var CONST_BLOCK_FILM_SOUNDTRACKS = 268435456; // саундтрэки

$(function(){
    $('.slideInfoTD').click(function (evt) {
        evt.preventDefault();
        $(this).parent().toggleClass('slideInfoOpen');
    });
    // Ожидание. ДА!
    $('#await_yes_enable').click(function (evt) {
        evt.preventDefault();

        if (getAlertStatus() == 'login_error') {
            $.app.notice($.app.notices.authRequired);
            return;
        }

        sendAwaitData('yes');

        // подсвечивам "Да"
        $(this).css('display', 'none');
        $('#await_yes_disable').css('display', 'block');

        // даём право сказать "Нет"
        $('#await_no_disable').css('display', 'none');
        $('#await_no_enable').css('display', 'block');

        // показываем сообщение
        $('#await_message').css('display', 'block');
    });
    // Ожидание. НЕТ!
    $('#await_no_enable').click(function (evt) {
        evt.preventDefault();

        if (getAlertStatus() == 'login_error') {
            $.app.notice($.app.notices.authRequired);
        }

        sendAwaitData('no');
        // подсвечивам "Нет"
        $(this).css('display', 'none');

        $('#await_no_disable').css('display', 'block');
        // даём право сказать "Да"
        $('#await_yes_disable').css('display', 'none');
        $('#await_yes_enable').css('display', 'block');
    });
    // Ожидание. ДА! (отменить)
    $('#await_yes_disable').click(function (evt) {
        evt.preventDefault();

        sendAwaitData('yes');
        // подсвечивам "Да"
        $(this).css('display', 'none');
        $('#await_yes_enable').css('display', 'block');
        // показываем сообщение
        $('#await_message').css('display', 'block');
    });
    // Ожидание. НЕТ! (отменить)
    $('#await_no_disable').click(function (evt) {
        evt.preventDefault();

        sendAwaitData('no');
        // подсвечивам "Нет"
        $(this).css('display', 'none');
        $('#await_no_enable').css('display', 'block');
        // показываем сообщение
        $('#await_message').css('display', 'block');
    });
    // Ожидание. Скрыть
    $('#btn_await_close').click(function(evt){
        evt.preventDefault();

        $('#block_await_open').css('display', 'none');
        $('#block_await_close').css('display', 'block');

        updateHideBlockCookie(CONST_BLOCK_AWAIT, true);
    });
    // Ожидание. Показать
    $('#btn_await_open').click(function(evt){
        evt.preventDefault();

        $('#block_await_open').css('display', 'block');
        $('#block_await_close').css('display', 'none');

        updateHideBlockCookie(CONST_BLOCK_AWAIT, false);
    });

    // Ожидание. Всплывающая ссылка
    if (!isGuest()) {
        mouse_over_await_hands = false;
        mouse_await_hands_timer = null;
        mouse_await_hands_helper = $('#await_hands div.descr');
        mouse_await_hands_link = mouse_await_hands_helper.find('a');
        $('#await_hands')
            .mouseover(function(){
                mouse_over_await_hands = true;
                clearInterval(mouse_await_hands_timer);
                mouse_await_hands_helper.show();
                mouse_await_hands_timer = setInterval(function(){
                    if (!mouse_over_await_hands) {
                        clearInterval(mouse_await_hands_timer);
                        mouse_await_hands_helper.hide();
                    }
                }, 500);
            })
            .mouseout(function(){
                mouse_over_await_hands = false;
            });
        $('#await_hands').find('a.yes, b.yes').mouseover(function(){
            href = mouse_await_hands_link.attr('href').replace(/\/await\/.*/g, '/await/yes/only_future/yes/#list');
            mouse_await_hands_link.attr({'href': href});
            mouse_await_hands_link.text('фильмы, которые жду');
        });
        $('#await_hands').find('a.no, b.no').mouseover(function(){
            href = mouse_await_hands_link.attr('href').replace(/\/await\/.*/g, '/await/no/#list');
            mouse_await_hands_link.attr({'href': href});
            mouse_await_hands_link.text('фильмы, которые не жду');
        });
    }

    // Рейтинг фильма. Скрыть
    $('#btn_rating_close').click(function(evt){
        evt.preventDefault();

        $('#btn_rating_close').css('display', 'none');
        $('#starbar').css('display', 'none');
        $('.starbar_w').css('display', 'none');
        $('#block_rating_close').css('display', 'block');
        $('#block_rating').css('display', 'none');
        $('#btn_rating_open_pls').css('display', 'block');
        $('#friend_blocks').css('display', 'none');

        updateHideBlockCookie(CONST_BLOCK_RATING_USER, true);
    });
    // Рейтинг фильма. Показать
    $('#btn_rating_open, #btn_rating_open_pls, #btn_rating_hidden').click(function(evt){
        evt.preventDefault();

        $('#btn_rating_close').css('display', 'block');
        $('#starbar').css('display', 'block');
        $('.starbar_w').css('display', 'block');
        $('#block_rating_close').css('display', 'none');
        $('#block_rating').css('display', 'block');
        $('#btn_rating_open_pls').css('display', 'none');
        $('#friend_blocks').css('display', 'block');

        updateHideBlockCookie(CONST_BLOCK_RATING_USER, false);
    });


    // Рейтинг критиков. Скрыть
    $('div.criticsRating div.close').click(function(evt){
        evt.preventDefault();

        $('div.criticsRating').css('display', 'none');
        $('#block_critic_rate_close').css('display', 'block');

        updateHideBlockCookie(CONST_BLOCK_RATING_CRIT, true);
    });
    // Рейтинг критиков. Показать
    $('#btn_critic_rate_open').click(function(evt){
        evt.preventDefault();

        $('div.criticsRating').css('display', 'block');
        $('#block_critic_rate_close').css('display', 'none');

        updateHideBlockCookie(CONST_BLOCK_RATING_CRIT, false);
    });


    // Соц.сети. Скрыть
    $('#btn_social_close').click(function(evt){
        evt.preventDefault();
        $('#block_social_open').css('display', 'none');
        $('#block_social_close').css('display', 'block');

        updateHideBlockCookie(CONST_BLOCK_SOC_NETS, true);
    });
    // Соц.сети. Показать
    $('#btn_social_open').click(function(evt){
        evt.preventDefault();
        $('#block_social_open').css('display', 'block');
        $('#block_social_close').css('display', 'none');

        updateHideBlockCookie(CONST_BLOCK_SOC_NETS, false);
    });


    // Сюжет. Скрыть, показать
    $('.sinopsys_closers').click(function(event){
        event.preventDefault()
        if($(this).is('.sinopsys_open')) {
            $(this).removeClass('sinopsys_open').next('.brand_words').show();
            updateHideBlockCookie(CONST_BLOCK_SINOPSYS, false);
        } else {
            $(this).addClass('sinopsys_open').next('.brand_words').hide();
            updateHideBlockCookie(CONST_BLOCK_SINOPSYS, true);
        }
    });


    // Рекомендации. Скрыть
    $('#btn_recom_close').click(function(evt){
        evt.preventDefault();
        $('#film_recom').css('display', 'none');
        $('#closer_recom_block').css('display', 'block');
        updateHideBlockCookie(CONST_BLOCK_RECOMS, true);
    });
    // Рекомендации. Показать
    $('#btn_recom_open1, #btn_recom_open2, #btn_recom_open3').click(function(evt){
        evt.preventDefault();
        $('#film_recom').css('display', 'block');
        $('#closer_recom_block').css('display', 'none');
        updateHideBlockCookie(CONST_BLOCK_RECOMS, false);
    });

    // Сериалы. Скрыть/показать
    $('.serialBlock .opener').click(function(evt){
        evt.preventDefault();
        if ($(this).parent().is('.serialBlockClosed')) {
            $(this).parent().removeClass('serialBlockClosed');
            updateHideBlockCookie(CONST_BLOCK_SERIAL, false);
        } else {
            $(this).parent().addClass('serialBlockClosed');
            updateHideBlockCookie(CONST_BLOCK_SERIAL, true);
        }
    });

    // рецензии Кудрявцева. Скрыть
    $('#btn_review_k_closer').click(function(evt){
        evt.preventDefault();
        $('#review_k_closer').css('display', 'none');
        $('#review_k_opener').css('display', 'block');
        $('#tbl_review_k').css('display', 'none');

        updateHideBlockCookie(CONST_BLOCK_REVIEW_K, true);
    });
    // рецензии Кудрявцева. Показать
    $('#btn_review_k_opener1, #btn_review_k_opener2').click(function(evt){
        evt.preventDefault();
        $('#review_k_closer').css('display', 'block');
        $('#review_k_opener').css('display', 'none');
        $('#tbl_review_k').css('display', 'block');

        updateHideBlockCookie(CONST_BLOCK_REVIEW_K, false);
    });

    // блок "Мнение друзей". Скрыть
    $('#block_invite_friends a.close').click(function(evt){
        evt.preventDefault();
        $('#block_invite_friends').css('display', 'none');

        updateHideBlockCookie(CONST_BLOCK_FRIENDS_MENTIONS, true);
    });

    // Список в которых есть этот фильм. Скрыть/Показать
    $('#block_list div.switch, #block_list div.rollDown').click(function(evt){
        evt.preventDefault();
        var block_list = $('#block_list');
        // показать
        if (block_list.hasClass('inLists2Closed')) {
            updateHideBlockCookie(CONST_BLOCK_LIST, false);
            block_list.removeClass('inLists2Closed')/*
                .find('div.title span').html(':').end()
                .find('div.title a').unbind('click')*/;
        // скрыть
        } else {
            updateHideBlockCookie(CONST_BLOCK_LIST, true);
            block_list.addClass('inLists2Closed')/*
                .find('div.title span').html('...').end()
                .find('div.title a').click(function(){
                    $('#block_list div.opener').click();
                    return false;
                })*/;
        }
    });

    // текущая кука сокрытия блоков
    hideBlocks = $.cookie('hideBlocks');
    if (hideBlocks == null) {
        hideBlocks = 0;
    }


    // нотис фильма. открыть/закрыть/редактировать
    $('#btn_film_notice, #txt_film_notice a.edit').click(function(evt){
        evt.preventDefault();

        if (isGuest()) {
            $.app.notice($.app.notices.authRequired, {'action': 'добавления примечания к ' + getObjTitle() + 'у'});
            return;
        }
        $('#ta_film_notice').toggle();

        var film_notice = $('#ta_film_notice');
        var film_notice_visible = film_notice.css('display') != 'none';
        var film_notice_val = $('#ta_film_notice textarea').val().replace(/&nbsp;/gi, ' ');

        $('#txt_film_notice').toggle(!film_notice_visible && film_notice_val != '');
        $('#ta_film_notice textarea').val(film_notice_val);

        if (film_notice_visible && film_notice_val != '') {
            $('#ta_film_notice input.delete').val('удалить');
        }

        if (film_notice_visible) {
            var win_scroll_top = $(window).scrollTop();
            var win_height = $(window).height();
            var film_notice_top = film_notice.offset().top;
            if (win_scroll_top + win_height < film_notice_top) {
                var scrollTop = film_notice_top - win_height + film_notice.height();
                $('html,body').animate({
                    scrollTop: scrollTop
                }, 200);
            }
        }
    });
    $('#txt_film_notice div.descr').dblclick(function(){
        $('#btn_film_notice').click();
    });

    // нотис фильма. сохранить
    $('#ta_film_notice input.save').click(function(){
        var message = $('#ta_film_notice textarea').val().replace(/&nbsp;/gi, ' ');
        if (message.length > 500) {
            $('#ta_film_notice textarea').val(message.substr(0, 500));
            alert('Длина комментария превышает допустимый лимит в 500 символов');
            return;
        }

        $('#ta_film_notice')
            .find('input').prop({'disabled': true}).end()
            .find('.loader').show();

        $.post('/handler_film_notice.php', {id_film: id_film, message: message, rnd: (new Date()).getTime()}, function(data){
            $('#ta_film_notice')
                .hide()
                .find('input').prop({'disabled': false}).end()
                .find('.loader').hide();

            if (message != '') {
                $('#ta_film_notice input.delete').val('удалить');
            }

            if (data.mess.length) {
                $('#txt_film_notice div.descr').html(data.mess);
                $('#txt_film_notice').show();
                $('ul.to_friend li.el_3 a').addClass('el_3_act');
                $('#ta_film_notice span').html(data.date);
                if (!$('#ms_folder_142498').length || $('#ms_folder_142498.noact_s').length) {
                    window.location.reload();
                }
            } else {
                $('#txt_film_notice').hide();
                $('ul.to_friend li.el_3 a').removeClass('el_3_act');
                window.location.reload();
            }
        }, 'json').fail(function(data){
            $('#ta_film_notice')
                .hide()
                .find('input').prop({'disabled': false}).end()
                .find('.loader').hide();
            if(data=='auth_error')
            {
                $.app.notice($.app.notices.authRequired);
            }else{
                $.app.notice($.app.notices.unavailable);
            }
        });
    });

    // нотис фильма. удалить
    $('#ta_film_notice input.delete, #txt_film_notice a.remove').click(function(evt){
        evt.preventDefault();

        if ($('#ta_film_notice input.delete').val() == 'удалить' && !confirm('Вы уверены, что хотите удалить комментарий?\nФильм будет удален из папки "Примечания".')) {
            return;
        }

        $('#ta_film_notice textarea').val('');
        $('#ta_film_notice input.save').click();
    });

    // нотис фильма. лимит длины
    $('#ta_film_notice textarea').keyup(function(){
        var message = $('#ta_film_notice textarea').val();
        if (message.length > 500) {
            $('#ta_film_notice textarea').val(message.substr(0, 500));
            alert('Длина комментария превышает допустимый лимит в 500 символов');
        }
    // нотис фильма. сохранение по Ctrl+Enter
    }).keypress(function(event) {
        if ((event.keyCode == '10' || event.keyCode == '13') && event.ctrlKey && !!$(this).val()) {
            $('#ta_film_notice input.save').click();
        }
    });


    // любимый фильм. добавить/удалить
    if (!$('#film_votes').length) {
        if(typeof getObjTitle == 'function') {
            $('#btn_fav_film')
                .attr({'title': getObjTitle(true)+' ещё не вышел в '+(getObjTitle() == 'сериал' ? 'эфир' : 'прокат')})
                .css({'cursor': 'default'})
                .click(function(evt){
                    evt.preventDefault();
                });
        }
        $('li.el_1').removeClass('el_1').addClass('el_1_Off');
    } else {
        $('#btn_fav_film').click(function(evt){
            evt.preventDefault();

            if (isGuest()) {
                $.app.notice($.app.notices.authRequired, {'action': 'того чтобы добавить ' + getObjTitle() + ' в список любимых,'});
                return;
            }

            // нельзя любить фильм, если он ещё не вышел в прокат
            if (!$('#film_votes').length) {
                alert(getObjTitle(true)+' ещё не вышел в '+(getObjTitle() == 'сериал' ? 'эфир' : 'прокат')+'.');
                return;
            }

            $('#btn_fav_film, #star_fav_film').toggle();

            if (need_create_fav_folder()) {
                var now = new Date();
                $.get('/handler_mustsee_ajax.php', {mode: 'create_fav_folder', rnd: now.getTime()}, function(data) {
                    var id_film = $('#div_mustsee_main').find('div[id^="MyKP_Folder_"]').attr('id').replace('MyKP_Folder_', '');
                    $.get('/handler_mustsee_ajax.php', {mode: 'add_film', id_film: id_film, to_folder: 6, rnd: now.getTime()}, function(data) {
                        window.location.reload();
                    }).fail(function(){
                        alert(unavailableMessage);
                    });
                }).fail(function(){
                    alert(unavailableMessage);
                });
            } else {
                if (typeof(FirstTime[id_film]) == "undefined") {
                    ClickFolders($('#select_'+id_film+' span.title'), true);
                }
                setTimeout(function(){
                    $('dl.list dd[value="6"]').click();
                }, 500);
            }
        });
    }

    // буду смотреть
    $('.addFolder').click(function(evt){
        evt.preventDefault();

        if (isGuest()) {
            $.app.notice($.app.notices.authRequired, {'action': 'того чтобы добавить '+getObjTitle()+' в папку &laquo;Буду смотреть&raquo;,'});
            return;
        }

        //$('.addFolder').toggle();

        if (need_create_watchlist_folder()) {
            var now = new Date();
            $.get('/handler_mustsee_ajax.php', {mode: 'create_watchlist_folder', rnd: now.getTime()}, function(data) {
                var id_film = $('#div_mustsee_main').find('div[id^="MyKP_Folder_"]').attr('id').replace('MyKP_Folder_', '');
                $.get('/handler_mustsee_ajax.php', {mode: 'add_film', id_film: id_film, to_folder: 3575, rnd: now.getTime()}, function(data) {
                    window.location.reload();
                }).fail(function(){
                    alert(unavailableMessage);
                });
            }).fail(function(){
                alert(unavailableMessage);
            });
        } else {
            if (typeof(FirstTime[id_film]) == "undefined") {
                ClickFolders($('#select_'+id_film+' span.title'), true);
            }
            setTimeout(function(){
                $('dl.list dd[value="3575"]').click();
            }, 500);
        }
    });

    // флаг "я смотрел этот фильм"
    if (!$('#film_votes').length) {
        if(typeof getObjTitle == 'function') {
            $('#btn_fav_film')
                .attr({'title': getObjTitle(true)+' ещё не вышел в '+(getObjTitle() == 'сериал' ? 'эфир' : 'прокат')})
                .css({'cursor': 'default'})
                .click(function(evt){
                    evt.preventDefault();
                });
        }
        $('li.el_1').removeClass('el_1').addClass('el_1_Off');
        if(typeof getObjTitle == 'function') {
            $('#btn_null_vote')
                .removeClass('eye')
                .addClass('eyeDisabledLevel1')
                .attr({'title': getObjTitle(true)+' ещё не вышел в '+(getObjTitle() == 'сериал' ? 'эфир' : 'прокат')})
                .css({'cursor': 'default'})
                .click(function(evt){
                    evt.preventDefault();
                });
        }
        $('li.el_2').removeClass('el_2').addClass('el_2_Off');
    } else {
        $('#btn_null_vote').click(function(evt){
            evt.preventDefault();

            if (isGuest()) {
                $.app.notice($.app.notices.authRequired, {"action":"того чтобы поставить пометку о просмотре"});
                return;
            }

            // флаг не кликабелен, если юзер оценил фильм
            if ($('#my_vote_block').length && $('#my_vote_block').css('display') != 'none') {
                alert('Снять пометку о просмотре невозможно, т.к. вы поставили оценку этому '+getObjTitle()+'у.');
                return;
            }

            // нельзя увидеть фильм, если он ещё не вышел в прокат
            if (!$('#film_votes').length) {
                alert(getObjTitle(true)+' ещё не вышел в '+(getObjTitle() == 'сериал' ? 'эфир' : 'прокат')+'.');
                return;
            }

            $('#btn_null_vote, #star_null_vote').toggle();

            var now = new Date();
            $.get('/handler_vote.php', {id_film: id_film, act: ($(this).hasClass('el_2_act') ? 'delete' : 'add'), rnd: now.getTime()}, function(data) {
                $('#btn_null_vote, #star_null_vote').toggle();
                if (data == 'ok') {
                    $('#btn_null_vote')
                        .toggleClass('el_2_act')
                        .attr('title', $('#btn_null_vote').hasClass('el_2_act') ? 'Убрать отметку о просмотре' : 'Пометить '+getObjTitle()+' как просмотренный');

                    // если глазик снят, то фильм не может быть в папке ЛюбимыхФильмов
                    if (!$('#btn_null_vote').hasClass('el_2_act') && $('#btn_fav_film').hasClass('el_1_act')) {
                        $('#btn_fav_film').click();
                    }
                } else if (data == 'REVIEW_EXISTS') {
                    alert('Нельзя снять пометку о просмотре, т.к. у вас есть опубликованная рецензия на этот фильм.');
                }
            }).fail(function(){
                $('#btn_null_vote').show();
                $('#star_null_vote').hide();
                alert(unavailableMessage);
                return;
            });
        });
    }

	$(window).resize(function(){
		var monitor = findDimensions();
		$("#photo_popup_container img").css({'max-height':(monitor['height'] - 100)});
	});
});

function openImgPopup(url)
{
	var monitor = findDimensions();
	if($('#photo_popup').length == 0) {
		html = 	'<div class="darkScreen" id="photo_popup" onclick="closeImgPopup()"></div>' +
				'<table class="popupNew" id="photo_popup_container" ><tr><td style="text-align: center;" onclick="closeImgPopup()">' +
				' 	<img src='+url+' style="max-height:'+(monitor['height'] - 100)+'px" onload="$(\'#photo_popup_container .close_button\').css(\'display\',\'inline\');"><div class="close_button" onclick="closeImgPopup()"></div>' +
				'</td></tr></table>';
		$("body").prepend(html);
	}
	$("#photo_popup_container img").css({'max-height':(monitor['height'] - 100)});
	$("#photo_popup").fadeIn();
	$("#photo_popup_container").fadeIn();
	return false;
}

function closeImgPopup()
{
	$("#photo_popup").fadeOut();
	$("#photo_popup_container").fadeOut();
}


/**
 *  Ожидание. Смена состояния
 */
function sendAwaitData(await)
{
    $('#await_star').css('display', 'block');
    $.get('/handler_await.php', {id_film: id_film, await: await}, function (data) {
        if (data == 'error_access' || data == 'auth_error') {
            $.app.notice($.app.notices.authRequired);
            return false;
        }
        if (data == 'error_film') {
            alert('Фильм указан неверно');
            return false;
        }
        if (data == 'error_await') {
            alert('Ответ неверный');
            return false;
        }

        $('#await_star').css('display', 'none');
        $('#await_message').css('visibility', 'visible');

        return true;
    }).fail(function(data){
        if (data.status == 401) {
            $.app.notice($.app.notices.authRequired);
            return false;
        }
        if (data.status == 400 && data.responseText == 'error_film') {
            alert('Фильм указан неверно');
            return false;
        }
        if (data.status == 400 && data.responseText == 'error_await') {
            alert('Ответ неверный');
            return false;
        }

        $('#await_star').css('display', 'none');
        $('#await_message').css('visibility', 'visible');
        alert(unavailableMessage);
        return false;
    });
}


/**
 *  Оценка фильма
 */
function vote(vote)
{
    if (isGuest()) {
        $.app.notice($.app.notices.authRequired);
        return false;
    }

    if (noAccess()) {
        alert('Для голосования необходимо заполнить дату рождения и пол в <a href="/level/78/edit_main/" class="all">профиле</a> пользователя.');
        return false;
    }

    // звёздочки
    $('#starbar').attr('className', 'user');
    $('#starbar').css('width', vote * 22);

    // шапка
    $('#my_vote_block').css('display', 'inline');
    $('#my_vote_text').text(vote+'/10');

    // подвал
    $('#ajax_star').css('display', 'inline');
    $('#mess_after_vote').css('display', 'none');
    $('#btn_delete_vote').css('display', 'none');

    $.get('/handler_vote.php', {id_film: id_film, vote: vote, act: 'vote'}, function(data) {
        $('#ajax_star').css('display', 'none');
        $('#mess_after_vote').css('display', 'inline');
        $('#btn_delete_vote').css('display', 'inline');
        if (data == 'Invalid ID') {
            // кривая идешка фильма
        } else if (data == 'Is guest') {
            // гость
        } else if (data == 'No access') {
            // не указан пол или дата рождения
        } else if (data == 'Impossible vote') {
            // фильм не вышел, голосовать нельзя
        } else if (data == 'error') {
            $('#mess_after_vote').css('display', 'none');
            $('#btn_delete_vote').css('display', 'none');
            alert('Ошибка');
        } else if (data == 'Ok') {
            // оценка принята
        } else {
            if (showErrors()) {
                alert(data);
            }
        }
    });

    return false;
}


/**
 *
 */
function updateHideBlockCookie(flag, status)
{
    //trace('current hideBlocks='+hideBlocks);
    if (status) {
        var new_value = hideBlocks | flag;
    } else {
        var new_value = hideBlocks & ~flag;
    }

    // unset old value
    $.cookie('hideBlocks', 0, {expires: -1, path: '/'});

    //trace('new_value='+new_value);
    if (hideBlocks != new_value) {
        hideBlocks = new_value;
        if (hideBlocks > 0) {
            //trace('set');
            $.cookie('hideBlocks', hideBlocks, {expires: 365, path: '/', domain: '.kinopoisk.ru'});
        } else {
            //trace('unset');
            $.cookie('hideBlocks', 0, {expires: -1, path: '/', domain: '.kinopoisk.ru'});
        }
    }

    return hideBlocks;
}

function showPopupDiv(id)
{
   var $modal = $('<div class="darkScreen" id="boxesModal" onclick="hidePopupDiv()"></div>');
    $("body").prepend($modal);
    $modal.css({'zIndex':900, 'cursor' : 'pointer'}).fadeIn();

    $('#div_usa_box, #div_world_box, #div_rus_box, #div_world_prem, #div_rus_prem, #div_rus_rerelease_prem').hide();

    $("body").append('<div id="_'+id+'_" class="div_popup">'+$('#'+id).html()+'</div>');
    $('#'+id).remove();
    $('#_'+id+'_').attr('id', id);

    var div = $('#'+id);
    var dim = findDimensions();
    var left = dim['width']/2 - parseInt(div.outerWidth())/2;
    var top = dim['height']/2 - parseInt(div.outerHeight())/2 + getBodyScrollTop();
    div.css({'left': left, 'top': top, 'zIndex':901});
}

function hidePopupDiv(){
    $('#div_usa_box, #div_world_box, #div_rus_box, #div_world_prem, #div_rus_prem, #div_rus_rerelease_prem').hide();
    $('#boxesModal').fadeOut();
}

$('#boxesModal').bind("click", function(){
    $('#div_usa_box, #div_world_box, #div_rus_box, #div_world_prem, #div_rus_prem, #div_rus_rerelease_prem').hide();
    $('#boxesModal').fadeOut();
});

function getBodyScrollTop()
{
    return self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop);
}

// считаем разрешение экрана
function findDimensions(){
	var width = 0, height = 0;
	if(window.innerWidth){
		width = window.innerWidth;
		height = window.innerHeight;
	}
	else if(document.body && document.body.clientWidth){
		width = document.body.clientWidth;
		height = document.body.clientHeight;
	}
	if(document.documentElement && document.documentElement.clientWidth){
		width = document.documentElement.clientWidth;
		height = document.documentElement.clientHeight;
	}
	var ret=new Array();
		ret['width']=width;
		ret['height']=height;
		return ret;
}

/**
 *  Рецензии
 */
$(function(){
    var reviewParams = {
        title: null,
        text: null,
        status: null
    };

    // предварительный просмотр
    $('#btn_review_preview').click(function(){
        if (!validReviewText()) {
            return;
        }

        reviewBtnsOff();
        $('#btn_preview_approve').unbind('click');

        var $title = $('#review_title').val();
        var $text = $('#review_text').val();
        var $status = $('#sb_review_status').val();

        reviewParams.title = $title;
        reviewParams.text = $text;
        reviewParams.status = $status;

        var data = {
            preview: 1,
            id_film: id_film,
            title: $title,
            text: $text,
            status: $status,
            rnd: (new Date()).getTime()
        };

        $.post('/handler_review.php', data, function(resp){
            reviewBtnsOn();
            if (resp && resp.status == 'ok') {
                $('#tbl_preview').show();
                $('#preview_title').html(resp.title);
                $('.preview_textWrap').html(resp.text);

                scrollTo(getElementTop('tbl_preview'));

                // автора устроил "предварительный просмотр"
                $('#btn_preview_approve').click(function(){
                    addReview(reviewParams);
                });
            } else {
                alert('Возникла ошибка. Попробуйте позже.');
            }
        }, 'json').fail(function(resp){
            reviewBtnsOn();
            if(resp == 'auth_required')
            {
                $.app.notice($.app.notices.authRequired);
            }else{
                $.app.notice($.app.notices.unavailable);
            }
            return false;
        });
    });

    $('#btn_review_add').click(function(){

        // Cообщение для read-only
        if (dbUnavailable === true) {
            alert(unavailableMessage);
            return false;
        }

        if (!validReviewText()) {
            return;
        }

        var $title = $('#review_title').val();
        var $text = $('#review_text').val();
        var $status = $('#sb_review_status').val();

        reviewParams.title = $title;
        reviewParams.text = $text;
        reviewParams.status = $status;

        addReview(reviewParams);
    });

    $('#btn_review_rules').click(function(){
        rules();
        return false;
    });

    var user_vote_init = false;
    $('#review_text').click(function(){
        if (!user_vote_init && getUserVote()) {
            $(this).val($(this).val() + "\n\n"+getUserVote());
            user_vote_init = true;
        }
    });

    // BB-code рецензий
    $('#review_text').selectableText();
    $('#bb_code_b').click(function(){
        setBBCode($('#review_text'), 'B', $('#review_text').selectableText('getPos'));
    });
    $('#bb_code_i').click(function(){
        setBBCode($('#review_text'), 'I', $('#review_text').selectableText('getPos'));
    });

    // АвтоСейв текста рецензии
    var autoSaveTimer, amplifyLoadTimer, amplifyLoadTimeout;
    $('#review_text').scrollReached({one: true}, function(){
        var js = document.createElement('script');
        js.src = 'https://st.kp.yandex.net/js/amplify.min.js?v=20120806';
        (document.getElementsByTagName('head')[0]).appendChild(js);

        amplifyLoadTimer = setInterval(function(){
            if (typeof amplify != 'undefined') {
                clearInterval(amplifyLoadTimer);

                var myLastReview = amplify.store('myLastReview'+id_film);
                if (myLastReview) {
                    if (myLastReview.title && !$('#review_title').val()) {
                        $('#review_title').val(myLastReview.title);
                    }
                    if (myLastReview.text && !$('#review_text').val()) {
                        $('#review_text').val(myLastReview.text);
                    }
                    if (myLastReview.status && !$('#sb_review_status').val()) {
                        $('#sb_review_status').val(myLastReview.status);
                    }
                }

                $('#review_title, #review_text, #sb_review_status').change(function(){
                    if (autoSaveTimer) {
                        clearTimeout(autoSaveTimer);
                    }

                    autoSaveTimer = setTimeout(function(){
                        amplify.store('myLastReview'+id_film, {
                            'title': $('#review_title').val(),
                            'text': $('#review_text').val(),
                            'status': $('#sb_review_status').val()
                        });
                    }, 2000);
                });
            }
        }, 500);

        amplifyLoadTimeout = setTimeout(function(){
            if (amplifyLoadTimer) {
                clearInterval(amplifyLoadTimer);
            }
        }, 5000);
    });
});


function reviewBtnsOff()
{
    $('#btn_review_add, #btn_review_preview, #btn_preview_approve, #sb_review_status').prop({'disabled': true});
}


function reviewBtnsOn()
{
    $('#btn_review_add, #btn_review_preview, #btn_preview_approve, #sb_review_status').prop({'disabled': false});
}


function validReviewText()
{
    var $text = $('#review_text').val();

    if (!$text) {
        alert('Текст рецензии отсутствует');
        return false;
    }

    var $count_word = getCountWord($text);

    if ($count_word > 1000) {
        alert('Объем рецензии превышает предел в <b>1000</b> слов ('+$count_word+')... Пожалуйста уменьшите количество текста, оставив самое главное...');
        return false;
    }

    if ($text.length <= 20) {
        alert('Слишком короткая рецензия... Попробуйте еще раз и у вас всё получится!');
        return false;
    }

    if (getBoldLengthPercent($text, 30) > 30) {
        alert('Слишком много текста, написанного жирным шрифтом. Постарайтесь исправить это.');
        return false;
    }

    if (!$('#sb_review_status').val()) {
        alert('Необходимо выбрать тип рецензии');
        return false;
    }

    return true;
}


function addReview(reviewParams)
{
    reviewBtnsOff();

    reviewParams.answers = [];
    reviewParams.id = 0;

    var data = {
        test: 1,
        id_film: id_film,
        rnd: (new Date()).getTime()
    };

    $.post('/handler_review.php', data, function(resp){
        if(resp && resp == 'auth_required')
        {
            $.app.notice($.app.notices.authRequired);
        }
        else if (resp && resp.status == 'ok')
        {
            reviewParams.id = resp.id;

            if (resp.questions.length) {
                // попап окно вопросов/ответов
                var bgGray = $('#review_test_bg');
                var testTbl = $('#review_test_tbl');
                var qTbl = testTbl.find('.reviewConfirm');
                var qSelectors = testTbl.find('.reviewConfirmDots');

                bgGray.show();
                testTbl.css({'display': 'table'});

                // таблица со всеми вопросами/ответами
                var qIds = questionsTableCreate(qTbl, resp.questions);

                // навигатор по вопросам
                var html = '';
                for (var q = 0; q < resp.questions.length; q++) {
                    qId = resp.questions[q]['id'];
                    html += '<div class="item" id="show_review_q_' + qId + '"></div>';
                }
                qSelectors
                    .html(html)
                    .find('div').click(function () {
                    var qId = $(this).attr('id').replace(/^show_review_q_/, '');
                    reviewShowQuestion(qTbl, qSelectors, qId);
                });

                // выбираем сразу первый вопрос
                reviewShowQuestion(qTbl, qSelectors, qIds[0]);

                // клик в ответы
                var answers = [];
                qTbl.find('input[name^="review_a_"]').click(function () {
                    // формируем набор ответов (пары вопрос:ответ)
                    answers = [];
                    qTbl.find('input[name^="review_a_"]:checked').each(function () {
                        var $this = $(this);
                        var qId = $this.attr('name').replace(/^review_a_/, '');
                        var aId = $this.val();
                        answers[answers.length] = qId + ':' + aId;
                    });

                    // получены ответы на все вопросы - отправляем их на проверку
                    if (answers.length == resp.questions.length) {
                        bgGray.hide();
                        testTbl
                            .hide()
                            .find('.close').unbind('click');
                        qTbl.html('');
                        qSelectors.html('');

                        reviewParams.answers = answers;
                        doAddReview(reviewParams);
                        // иначе переходим к вопросу без ответа
                    } else {
                        for (var q = 0; q < qIds.length; q++) {
                            qId = qIds[q];
                            if (!qTbl.find('input[name="review_a_' + qId + '"]:checked').length) {
                                reviewShowQuestion(qTbl, qSelectors, qId);
                                break;
                            }
                        }
                    }
                });
            } else {
                doAddReview(reviewParams);
            }
        } else {
            reviewBtnsOn();
            alert('Возникла ошибка. Попробуйте позже.');
        }
    }, 'json').fail(function(resp){
        reviewBtnsOn();
        if(resp == 'auth_required')
        {
            $.app.notice($.app.notices.authRequired);
        }else{
            $.app.notice($.app.notices.unavailable);
        }

    });
}


function reviewShowQuestion(qTbl, qSelectors, qId)
{
    qTbl
        .find('tr').hide().end()
        .find('.review_q_'+qId).show();

    qSelectors
        .find('div').removeClass('active').end()
        .find('#show_review_q_'+qId).addClass('active');
}


function doAddReview(reviewParams)
{
    var data = {
        id_film: id_film,
        id: reviewParams.id,
        title: reviewParams.title,
        text: reviewParams.text,
        status: reviewParams.status,
        answers: reviewParams.answers.join(),
        rnd: (new Date()).getTime()
    };

    $.post('/handler_review.php', data, function(resp){
        reviewBtnsOn();

        if(resp && resp == 'auth_required')
        {
            $.app.notice($.app.notices.authRequired);
        }
        else if (resp && resp.status == 'ok')
        {
            $('#tbl_preview').hide();
            $('#review_text').val('');
            $('#sb_review_status').val('');
            $('#review_title').val('');
            alert(
                'Рецензия добавлена и доступна в <a href="'+resp.url_profile+'" class="all">вашем профиле</a>.<br /><br />'+
                'Пока текст не прошел модерацию, вы можете успеть его <a href="'+resp.url_review+'" class="all">отредактировать</a>.<br /><br />'+
                'Напоминаем, что на страницу фильма попадают только рецензии, полностью соответствующие правилам публикации.'
            );

            if (typeof amplify != 'undefined') {
                amplify.store('myLastReview'+id_film, {});
            }
        } else {
            alert('Возникла ошибка. Попробуйте позже.');
        }
    }, 'json').fail(function(resp){
        reviewBtnsOn();
        if(resp == 'auth_required')
        {
            $.app.notice($.app.notices.authRequired);
        }else{
            $.app.notice($.app.notices.unavailable);
        }
    });
}


function questionsTableCreate(qTbl, questions)
{
    var html = '';
    var qIds = [];
    var qId, aId, Q, A;

    for (var q = 0; q < questions.length; q++) {
        qId = questions[q]['id'];
        Q = questions[q]['q'];

        qIds[qIds.length] = qId;

        html += '<tr class="review_q_'+qId+'"><th>'+Q+'</th></tr>';
        for (var a = 0; a < questions[q]['ans'].length; a++) {
            aId = questions[q]['ans'][a]['id'];
            A = questions[q]['ans'][a]['a'];
            html += '<tr class="review_q_'+qId+'"><td><label><input type="radio" name="review_a_'+qId+'" value="'+aId+'" />'+A+'</label></td></tr>';
        }
    }

    qTbl
        .html(html)
        .find('tr').hide().end();

    return qIds;
}


/**
 *
 */
(function($){
    var id_film;
    var user_id;
    var limit;
    var fName;
    var total_recs;

    var films = [];
    var agreeIds = [];
    var showAllRecom = 'yes';
    var lastQuery;
    var lastResult;
    var change = false;

    // DOM
    var film_recom;
    var title;
    var loader;
    var btnToggle;
    var btnOpenRecomsSearch;
    var div_recommend;
    var btnClose;
    var btnCloseRecomsSearch;

    $.extend({
        recoms: function(opts){
            id_film = opts.id_film;
            user_id = opts.user_id;
            limit = opts.limit;
            fName = opts.fName;

            film_id = id_film;

            film_recom = $('#film_recom');
            title = film_recom.find('dt.show_items');
            loader = film_recom.find('.recomLoader');
            btnToggle = film_recom.find('.btnToggle');
            btnOpenRecomsSearch = film_recom.find('.last a:first');
            div_recommend = $('#div_recommend');
            btnClose1 = div_recommend.find('.btnClose');
            btnClose2 = div_recommend.find('#btnCloseRecomsSearch');

            showAllRecom = $.cookie('showAllRecom') ? $.cookie('showAllRecom') : showAllRecom; // [no|yes]

            updateBtnToggle();

            $('#film_name').html(fName);

            regData(opts.data);
            createHtml();

            btnToggle.click(function(evt){
                evt.preventDefault();

                if (isGuest()) {
                    $.app.notice($.app.notices.authRequired);
                    return;
                }

                showAllRecom = showAllRecom == 'yes' ? 'no' : 'yes';
                $.cookie('showAllRecom', showAllRecom, {expires: 365, path: '/'});

                updateBtnToggle();
                rebuildHtml();
            });

            $('#btnShowMyHiddenRecoms').click(function(evt){
                evt.preventDefault();
                btnToggle.click();
            });

            btnOpenRecomsSearch.click(function(evt){
                evt.preventDefault();

                if (isGuest()) {
                    $.app.notice($.app.notices.authRequired);
                    return;
                }

                var $modal = $('<div class="darkScreen" id="recomModal" onclick="closeRecomSearch()"></div>');
                $("body").prepend($modal);
                $modal.css({'zIndex':50, 'cursor' : 'pointer'}).fadeIn();

                div_recommend
                    .show()
                    .css({
                        top: Math.floor(getBodyScrollTop() - TopContentPoint / 2) + 100,
                        margin: 0,
                        marginLeft: -350
                    });

                $('#keyword').autocomplete({
                    minLength: 2,
                    source: function(request, response){
                        $.getJSON('/handler_recommendation.php', {id_film: id_film, term: request.term, rnd: (new Date()).getTime()}, response);
                    },
                    select: function(event, ui){
                        addRecom(ui.item.id);
                    }
                }).autocomplete('widget').addClass('recoms');

                refreshRecoms();
            });

            $([btnClose1, btnClose2]).each(function(i, obj){
                obj.click(function(evt){
                    evt.preventDefault();

                    div_recommend.hide();

                    if (change) {
                        change = false;

                        loader.show();
                        $.get('/handler_recommendation.php', {mode: 'list', id_film: id_film, rnd: (new Date()).getTime()}, function(resp){
                            loader.hide();
                            regData(resp);
                            rebuildHtml();
                        }, 'json');
                    }
                    $('#recomModal').fadeOut();
                });
            });
        }
    });


    function refreshRecoms()
    {
        $('#ajax_star').show();
        $.get('/handler_recommendation.php', {
            mode: 'my', 
            id_film: id_film,
            agreeIds: agreeIds.join(), 
            rnd: (new Date()).getTime()
        }, function (resp) {
            $('#ajax_star').hide();

            if (resp.filmsAgree) {
                $('#agree_recoms')
                    .html(getAgreeHtml(resp.filmsAgree))
                    .find('.btnAddRecom').click(function(){
                        var fid = parseInt($(this).attr('fid'));
                        addRecom(fid);
                    });
            }

            if (resp.filmsMy) {
                $('#my_recoms')
                    .html(getMyRecomsHtml(resp.filmsMy))
                    .find('.btnDelRecom').click(function(){
                        if (isGuest()) {
                            $.app.notice($.app.notices.authRequired, {"action":"добавления рекомендаций"});
                            return;
                        }

                        var fid = parseInt($(this).attr('fid'));
                        $('#ajax_star').show();
                        $.get('/handler_recommendation.php', {mode: 'del', id_film: id_film, id_film_del: fid, rnd: (new Date()).getTime()}, function(resp){
                            $('#ajax_star').hide();
                            refreshRecoms();
                            change = true;
                        });
                    });
            }

            $('#keyword').val('').focus();
        }, 'json');
    }

    function addRecom(fid)
    {
        if (isGuest()) {
            $.app.notice($.app.notices.authRequired, {'action':'добавления рекомендаций'});
            return;
        }

        $('#ajax_star').show();
        $.get('/handler_recommendation.php', {mode: 'add', id_film: id_film, id_film_add: fid, rnd: (new Date()).getTime()}, function(resp){
            $('#ajax_star').hide();
            refreshRecoms();
            change = true;
        });
    }

    function getAgreeHtml(films)
    {
        var html = '';

        if (films.length) {
            html +=
                '<b style="color: #333">Фильмы, рекомендуемые другими пользователями:</b><br /><br />'+
                '<table cellspacing="0" cellpadding="0" border="0" width="100%">';
            for (var i = 0, film; i < films.length; i++) {
                film = films[i];
                html +=
                    '<tr>'+
                        '<td width="87%" class="news">&mdash;&nbsp;<a href="/level/1/film/'+film.id_film+'/" target="_blank" class="all">'+getFilmTitle(film)+'</a></td>'+
                        '<td width="10%" class="news"><input class="btnAddRecom" type="button" value="согласен" fid="'+film.id_film+'" /></td>'+
                    '</tr>';
            }
            html += '</table>';
        }

        return html;
    }

    function getMyRecomsHtml(films)
    {
        var html = '';

        if (films.length) {
            html +=
                '<b style="color: #333">Фильмы, которые вы рекомендуете:</b><br /><br />'+
                '<table cellspacing="0" cellpadding="0" border="0" width="100%">';
            for (var i = 0, film; i < films.length; i++) {
                film = films[i];
                html +=
                    '<tr>'+
                        '<td width="87%" class="news">&mdash;&nbsp;<a href="/level/1/film/'+film.id_film+'/" target="_blank" class="all">'+getFilmTitle(film)+'</a></td>'+
                        '<td width="10%" class="news"><input class="btnDelRecom" type="button" value="удалить фильм" fid="'+film.id_film+'" /></td>'+
                    '</tr>';
            }
            html += '</table>';
        }

        return html;
    }

    function getFilmTitle(film)
    {
        return film.rus +
            (film.extInfo ? ' ('+film.type+(film.year ? film.year : '')+((film.year && film.country) ? ', ' : '')+film.country+(film.country_more_one ? '...' : '')+')' : '') +
            (film.director ? ' реж. '+film.director+(film.director_more_one ? '...' : '') : '');
    }

    function updateBtnToggle()
    {
        btnToggle
            .html((showAllRecom == 'yes' ? 'скрыть' : 'показать') + ' оцененные фильмы')
            .removeClass(showAllRecom == 'yes' ? 'show' : 'hide')
            .addClass(showAllRecom == 'yes' ? 'hide' : 'show');
    }

    function rebuildHtml()
    {
        film_recom.find('dd.show_items').remove();
        createHtml();
    }

    function regData(data)
    {
        films = data.films;
        agreeIds = data.agreeIds;
        total_recs = data.total_recs;

        if (films.length) {
            title.show();
        }
        if (total_recs > limit || films.length > limit) {
            $('#linkAllRecoms').show();
        } else {
            $('#linkAllRecoms').hide();
        }

        $('#btn_recom_open1 span, #linkAllRecoms span:first').html(data.item_type);
        $('#linkAllRecoms span:last').html(total_recs);
        title.find('.type').html(data.item_type);
    }

    function createHtml()
    {
        if (film_recom.hasClass('film_recom_empty') && films.length) {
            film_recom.removeClass('film_recom_empty');
            title.show();
        }
        if (!film_recom.hasClass('film_recom_empty') && !films.length) {
            film_recom.addClass('film_recom_empty');
        }

        var num = 0;
        if (films.length) {
            var html = '';
            for (var i = 0, film; i < films.length; i++) {
                film = films[i];

                // пропускаем оценённые фильмы, если так пожелал пользователь
                if (showAllRecom == 'no' && film.i_see) {
                    continue;
                }

                num++;

                html +=
                    '<dd class="show_items">'+
                        '<a href="'+film.link+'"'+
                            (film.i_see && film.my_recom  ? ' class="seen_recom"' : '')+
                            (film.i_see && !film.my_recom ? ' class="seen"' : '')+
                            (!film.i_see && film.my_recom ? ' class="recom"' : '')+
                        '>'+
                            '<img src="'+film.image+'" alt="'+film.name+(film.name_en ? ' ('+film.name_en+')' : '')+'" />'+
                        '</a>'+
                        '<a href="'+film.link+'"'+(film.name_full ? ' title="'+film.name_full+'"' : '')+'>'+film.name+'</a>'+(film.name_en ? '<i>'+film.name_en+'</i>' : '')+
                    '</dd>';

                if (num == limit) {
                    break;
                }
            }
        }

        var numMy = 0;
        if (films.length) {
            for (var i = 0; i < films.length; i++) {
                numMy += films[i].i_see ? 1 : 0;
            }
        }
        btnToggle.toggle(numMy > 0);

        film_recom.toggleClass('film_recom_empty', !num);

        if (num) {
            $('#btnShowMyHiddenRecoms').hide();
            title.show().after(html);

            if (total_recs > limit || films.length > limit) {
                $('#linkAllRecoms').show();
            }
        } else {
            if (numMy) {
                $('#linkAllRecoms').hide();
                $('#btnShowMyHiddenRecoms').show().find('span').html(numMy);
            }
            title.hide();
        }
    }
})(jQuery);


function closeRecomSearch(){
    $('#div_recommend .btnClose').click();
}

function showPopupDivevent(select){
    $('#'+ select + '_td1, #' +select + '_td2').click(function(event) {
        if (event.target.nodeName != 'A') {
            showPopupDiv(select);
        }
    });
}

function showPopupDiveventImg(select){
    $('#'+ select + '_td1, #' +select + '_td2').click(function(event) {
        if (event.target.nodeName != 'A' && event.target.nodeName != 'IMG') {
            showPopupDiv(select);
        }
    });
}


function my_folders(open) {
    if (open) {
        $('#div_my_folders').css('display', 'block');
    } else {
        $('#div_my_folders').css('display', 'none');
    }
}

function getThisDate() {
    var date = new Date();
    if (typeof(date.toLocaleFormat) == "function") {
        return date.toLocaleFormat("%Y%m%d");
    } else {
        var year = date.getYear()+1900;
        var month = ((date.getMonth()+1 < 10) ? '0' : '') + (date.getMonth()+1);
        var day = ((date.getDate() < 10) ? '0' : '') + date.getDate();
        return ''+year+month+day;
    }
}

var today = getThisDate();

function initAddPopup() {
    $('.prem_ical').click(function(event) {
        event.stopPropagation();
        openAddPopup(this);
    });

    $('.prem_ical').each(function(){
        var data = $(this).data();
        if (data.datePremierStartLink > today) {
            $(this).parents('.calendar').addClass('calendar_red');
        }
    });
}
var ical_title_sub = {
    'world' : 'Мировая премьера фильма',
    'rus'   : 'Российская премьера фильма',
    're-rus': 'Российский ре-релиз фильма',
    'ua'    : 'Украинская премьера фильма',
    'dvd'   : 'Релиз на DVD фильма',
    'bluray': 'Релиз на Blu-Ray фильма'
};


function openAddPopup(link){
    var data = $(link).data();

    $('.popupNewrel').remove();
    var html = '<div class="popupNewrel">' +
        '   <div class="block">' +
        '      <div class="title">Добавление в календарь</div>' +
        '      <span class="title_sab"><span>' + ical_title_sub[data.icalType] + '</span><b>«' + name_film_html + '»</b>, ' + data.icalDate + '</span>' +
        '      <p class="iCal_text">Для добавления этого события в свой календарь воспользуйтесь кнопками ниже или добавьте его вручную при помощи iCal-ссылки</p>' +
        '      <div class="add_ical_button"><input type="text" value="/view_export.php?id_film=' + id_film + '&type=' + data.icalType + '&rerelease=' + data.icalRerelease + '" /><i></i></div>' +
        '      <div class="ical_button clearfix">' +
        '      <a class="ical_google" href="//www.google.com/calendar/event?action=TEMPLATE' +
                    '&text=' + encodeURIComponent(ical_title_sub[data.icalType] + ' «' + name_film_html + '»') +
                    '&dates=' + data.datePremierStartLink + '/' + data.datePremierStopLink +
                    '&details=' + encodeURIComponent(ical_title_sub[data.icalType] + ' «' + name_film_html + '» на КиноПоиске: https://www.kinopoisk.ru/film/' + id_film + '/') +
                    '&trp=false&sprop=www.kinopoisk.ru&sprop=name:kinopoisk" target="_blank"></a>' +
        '      </div><div id="close" class="close"></div>' +
        '   </div>' +
        '</div>';
    $('body').prepend(html);
    $('.popupNewrel').css('display', 'block');
    $('.popupNewrel .close, .popupNewrel').click(function(event){
        event.preventDefault();
        $('.popupNewrel').css('display', 'none');
        $('.popupNewrel').remove();
    });
    $(document).bind('keyup.popupNowrel', function(event){
        if(event.keyCode==27){
            event.preventDefault();
            $('.popupNewrel').css('display', 'none');
            $('.popupNewrel').remove();
            $(document).unbind('keyup.popupNowrel');
        }
    });

    $(".popupNewrel .add_ical_button input").focus(function(){
        this.select();
    });
    $(".popupNewrel .add_ical_button i").click(function(){
        $(".popupNewrel .add_ical_button input").focus().select();
    });
    $('.popupNewrel .block').click(function(event){
        event.stopPropagation();
    });
}
function popupsShowInit() {
    if (typeof(is_usa_box_popup) != 'undefined' && is_usa_box_popup) {
        $('#div_usa_box_td1, #div_usa_box_td2').click(function(event) {
            if (event.target.nodeName != 'A') {
                showPopupDiv('div_usa_box');
            }
        });
    }
    if (typeof(is_world_box_popup) != 'undefined' && is_world_box_popup) {
        $('#div_world_box_td1, #div_world_box_td2').click(function(event) {
            if (event.target.nodeName != 'A') {
                showPopupDiv('div_world_box');
            }
        });
    }
    if (typeof(is_rus_box_popup) != 'undefined' && is_rus_box_popup) {
        $('#div_rus_box_td1, #div_rus_box_td2').click(function(event) {
            if (event.target.nodeName != 'A') {
                showPopupDiv('div_rus_box');
            }
        });
    }
    if (typeof(is_world_popup) != 'undefined' && is_world_popup) {
        $('#div_world_prem_td1, #div_world_prem_td2').click(function(event) {
            if (event.target.nodeName != 'A') {
                showPopupDiv('div_world_prem');
            }
        });
    }
    if (typeof(is_rus_popup) != 'undefined' && is_rus_popup) {
        $('#div_rus_prem_td1, #div_rus_prem_td2').click(function(event) {
            if (event.target.nodeName != 'A' && event.target.nodeName != 'IMG') {
                showPopupDiv('div_rus_prem');
                event.stopPropagation();
            }
        });
    }
    if (typeof(is_rus_rerelease_popup) != 'undefined' && is_rus_rerelease_popup) {
        $('#div_rus_rerelease_prem_td1, #div_rus_rerelease_prem_td2').click(function(event) {
            if (event.target.nodeName != 'A' && event.target.nodeName != 'IMG') {
                showPopupDiv('div_rus_rerelease_prem');
            }
        });
    }
    if (typeof(is_ua_popup) != 'undefined' && is_ua_popup) {
        $('#div_ua_prem_td1, #div_ua_prem_td2').click(function(event) {
            if (event.target.nodeName != 'A' && event.target.nodeName != 'IMG') {
                showPopupDiv('div_ua_prem');
            }
        });
    }
}

function ChangeEpisode(obj,vod_id,ep){
        $(".vod_series_list li").removeClass("active_episode");
        $(obj).parent("li").addClass("active_episode");
        var embed_url = vodLoaded[vod_id][ep].embed_url;
        if(embed_url.indexOf("/handler_vonline") > -1) {
            embed_url = embed_url + "&token=" + xsrftoken;
        }


        $("#vod_frame_iframe").get(0).src = embed_url;
        AddHit(vod_id,FILM_ID);
}

function AddHit(vod,film) {
    $.post("/handler_vonline.php", {film: film, vod : vod, st : 1}, function(data){},"json");
}

function ShowVodFrame(vod_id,ep)
{
    if(!ep) ep = 0;
    if(vod_id == 5)  {
        var monitor = findDimensions();
        var nw = window.open("/handler_vonline.php?film="+FILM_ID+"&act=redirect&vod_id="+vod_id+"&token="+xsrftoken, "vod_frame","resizable=no,width=820,height=461,top=" + ((monitor.height - 461) / 2) + ",left="+((monitor.width - 820) / 2));
        nw.focus();
        return ;
    }
    if(!vodLoaded && FILM_ID) {
        $.post("/handler_vonline.php", {film: FILM_ID, vod : vod_id}, function(data){
            vodLoaded = data;
            ShowVodFrame(vod_id);
        },"json");
        return false;
    }

    if(vodLoaded) {
        AddHit(vod_id,FILM_ID);
    }

    // hide right banner
    $('#loadb_').find('div[id^="ad_ph_"]').css({'display': 'none'});

    var movie_data = vodLoaded[vod_id][ep];
    var embed_url = movie_data.embed_url;
    var dimension = movie_data.dimension;
    var is_serial = vodLoaded[vod_id].length > 1;

    if(dimension == '0x0' || dimension == '') {
        dimension = '720x540';
    }
    var size = [800, 334];
    if(dimension && dimension.indexOf("x")) {
        size = dimension.split("x");
        size[0] = parseInt(size[0]);
        size[1] = parseInt(size[1]);
        if(size[0] > 600 && is_serial) {
            size[1] = size[1] * 600 / size[0];
            size[0] = 600;
        } else
        if(size[0] > 850 && !is_serial) {
            size[1] = size[1] * 850 / size[0];
            size[0] = 850;
        }
    }
    size[0] = Math.round(size[0]);
    size[1] = Math.round(size[1]);

    var monitor = findDimensions();
    var frameSize = [size[0],size[1]];
    var series_html = '';
    var series_li = [];

    if(is_serial) {
        for(var i in vodLoaded[vod_id]) {
            var s = vodLoaded[vod_id][i];
            series_li.push("<li class='"+(i == 0 ? "active_episode" : "")+""+(i%2 ? " odd" : " even")+"'><s href='#' onclick='ChangeEpisode(this,"+vod_id+","+i+")'>"+
                (s.season > 0 ? s.season + ". ": "") +  (s.episode > 0 ? s.episode + ". " : "" ) + (s.episode_name.length > 2 ?  s.episode_name : "")+"</s></li>");
        }
        frameSize[0] = frameSize[0] + 200;
        series_html = "<ul class='vod_series_list' style='height:"+frameSize[1]+"px;'>"+series_li.join("")+"</ul>";
    }

    var margin = -1 * (frameSize[0] + 13)/2;

    $('.dark_trailer, .dark_trailer .container').css({'width': frameSize[0],'height': frameSize[1], 'top': (monitor.height - frameSize[1]) / 2, 'margin-left': margin});
    $('#dark_trailer').css({'display':'block'});
    $('.dark_trailer .container').css({'background':'#000'});
    if(embed_url.indexOf("/handler_vonline") > -1) {
        embed_url = embed_url + "&token=" + xsrftoken;

    }
    $('#container').html("<a class='png' href='#' onclick='HideVodFrame(); return false;'></a> <iframe frameborder=0 id='vod_frame_iframe' scrolling='no' style='overflow: hidden; width:"+size[0]+"px; height:"+size[1]+"px; float:left;'  src='"+embed_url+"' border=0  webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>" + series_html);
    $('.dark').css({'display':'block'}).animate({'opacity':0.7});
}

function HideVodFrame()
{
    $('body').css({'overflow':'auto'});
    $('.dark').animate({'opacity':0.6},function(){ $('.dark').css({'display':'none'}); });
    $('#dark_trailer').css({'display':'none'});
    $('#container').html("");

    // show right banner
    $('#loadb_').find('div[id^="ad_ph_"]').css({'display': 'block'});
}

function my_folders(open)
{
    if (open) {
        $('#div_my_folders').css('display', 'block');
    } else {
        $('#div_my_folders').css('display', 'none');
    }
}

$(function(){
    $('.mod').hover(
    function(){
      $(this).parents('.userReview').find('.one_review').hide();
    },
    function(){
      $(this).parents('.userReview').find('.one_review').show();
    });
});

// Тривии
Trivs = (function(){
    var shareralt,
        sharerlink,
        sharerimg,
        selectedText = '';

    function init(){
        var soc_title = window.soc_title||'';
        shareralt = encodeURIComponent(soc_title);
        sharerlink = encodeURIComponent(location.href);
        sharerimg = $('.film-img-box img').attr('src');

        $('#trivia_fact').click(function(evt){
            evt.preventDefault();

            var $this = $(this);
            if (!$this.hasClass('main_line_hiden')){
                $this.addClass('main_line_hiden');
                $('.triviaBlock.fact').find('ul.trivia_slide').hide();
                updateHideBlockCookie(CONST_BLOCK_TRIV_FACT, true);
            } else {
                $this.removeClass('main_line_hiden');
                $('.triviaBlock.fact').find('ul.trivia_slide').show();
                updateHideBlockCookie(CONST_BLOCK_TRIV_FACT, false);
            }
        });

        $('#trivia_blooper').click(function(evt){
            evt.preventDefault();

            var $this = $(this);
            if (!$this.hasClass('main_line_hiden')){
                $this.addClass('main_line_hiden');
                $('.triviaBlock.blooper').find('ul.trivia_slide').hide();
                updateHideBlockCookie(CONST_BLOCK_TRIV_BLOOPER, true);
            } else {
                $this.removeClass('main_line_hiden');
                $('.triviaBlock.blooper').find('ul.trivia_slide').show();
                updateHideBlockCookie(CONST_BLOCK_TRIV_BLOOPER, false);
            }
        });

        $('#soundtracks_table').click(function(evt){
            evt.preventDefault();

            var $this = $(this);
            if (!$this.hasClass('main_line_hiden')){
                $this.addClass('main_line_hiden');
                $('#soundtracks_body').hide();
                updateHideBlockCookie(CONST_BLOCK_FILM_SOUNDTRACKS, true);
            } else {
                $this.removeClass('main_line_hiden');
                $('#soundtracks_body').show();
                updateHideBlockCookie(CONST_BLOCK_FILM_SOUNDTRACKS, false);
            }
        });

        var $triviaBlock = $('.triviaBlock');
        var liFirst = $triviaBlock.find('.trivia li:first');
        $triviaBlock
        .find('li.trivia')
            .mouseenter(function(){
                $('.link_edit_trivia_box').remove();
                liFirst.css({'border-top': 'none'});
                var $li = $(this);
                var html = $(
                    '<span class="link_edit_trivia_box">'+
                    '<span class="link_edit_trivia">'+
                        '<ul class="addToTrivia clearfix">'+
                          '<li class="vk" title="Добавить в ВКонтакте"><a href="#" onclick="return Trivs.Vk(this)" class="vks"></a></li>'+
                          '<li class="fb" title="Добавить в Facebook"><a href="#" onclick="return Trivs.Fb(this)" class="fbs"></a></li>'+
                          '<li class="tw" title="Добавить в Twitter"><a href="#" onclick="return Trivs.Tw(this)" class="tws"></a></li>'+
                          '<li class="lj" title="Добавить в ЖЖ"><a href="#" onclick="return Trivs.Lj(this)" class="ljs"></a></li>'+
                       '</ul>'+
                       '<a onclick="return Trivs.Spoiler(this)" class="contains_spoiler'+($li.hasClass('spoiler_active') || $li.hasClass('spl') || $li.hasClass('show') ? ' hide' : '')+'" href="#" title="Пожаловаться на спойлер"><i></i>спойлер</a>'+
                       '<a class="report_error" onclick="return Trivs.Error(this)" href="#" title="Сообщить об ошибке"><i></i>ошибка</a>'+
                       '<span class="triangle"></span>'+
                   '</span>'+
                   '</span>'
                );
                $li.append(html);
            }).mousedown(function(){
                selectedText = '';
            }).mouseup(function(){
                selectedText = '';
                if (document.getSelection) {
                    selectedText = document.getSelection().toString();
                } else if (document.selection && document.selection.createRange) {
                    var range = document.selection.createRange();
                    selectedText = range.text;
                }
            }).end()
        .find('ul.trivia_slide li.add_spoiler').click(function(event){
            event.preventDefault();
            $(this)
                .closest('ul')
                    .find('li.dop_spoiler')
                        .show()
                        .end()
                    .end()
                .remove();
        });
    }

    function Vk(btn)
    {
        var $li = $(btn).closest('li.trivia'),
            txt = $.trim($li.find('.trivia_text').text()),
            typePrefix = $li.closest('div.triviaBlock').hasClass('fact') ? 'Знаете ли вы, что... #kinopoisk' : 'Ошибка в фильме:';
        if (txt.length > 500) {
            txt = txt.substr(0, 500)+'...';
        }
        txt = encodeURIComponent(txt);
        PopupCenter('https://vk.com/share.php?title='+shareralt+encodeURIComponent('. '+typePrefix)+'&description='+txt+'&url='+sharerlink+'&image='+sharerimg, 'vkontakte', 520, 340);
        return false;
    }

    function Fb(btn)
    {
        var $li = $(btn).closest('li.trivia'),
            txt = $.trim($li.find('.trivia_text').text()),
            typePrefix = $li.closest('div.triviaBlock').hasClass('fact') ? 'Знаете ли вы, что...' : 'Ошибка в фильме:';

        txt = encodeURIComponent(txt);

        PopupCenter('https://www.facebook.com/dialog/feed?app_id=' + window.KP.FACEBOOK_APP_ID + 
            '&display=popup&caption=' + shareralt+encodeURIComponent('. ' + typePrefix) + 
            '&description=' + txt + '&link=' + sharerlink + 'picture=' + sharerimg, 'facebook', 520, 340);
        return false;
    }

    function Tw(btn)
    {
        var txt = soc_title + '. ' + $.trim($(btn).closest('li.trivia').find('.trivia_text').text());
        var ellipsis = '...';
        var twitMaxLength = 140 - ellipsis.length;

        if (txt.length > twitMaxLength) {
            txt = txt.substr(0, twitMaxLength).split(' ').slice(0, -1).join(' ') + ellipsis;
        }

        PopupCenter('https://twitter.com/?status='+encodeURIComponent(txt), 'twitter', 520, 340);
        return false;
    }

    function Lj(btn)
    {
        var $li = $(btn).closest('li.trivia'),
            txt = $.trim($li.find('.trivia_text').text()),
            typePrefix = $li.closest('div.triviaBlock').hasClass('fact') ? 'Знаете ли вы, что...' : 'Ошибка в фильме:';
        var ljForm = $(
            '<form class="lj_hidden_form" method="post" accept-charset="utf-8" name="lj_hidden_form" action="https://www.livejournal.com/update.bml" target="_blank">'+
                '<input value="" name="event" type="hidden" />'+
                '<input value="" name="subject" type="hidden" />'+
            '</form>'
        );
        $('body').append(ljForm);
        ljForm
            .find('input[name=subject]').val(soc_title+'. '+typePrefix).end()
            .find('input[name=event]').val(txt).end()
            .submit()
            .remove();
        return false;
    }

    function Error(btn)
    {
        var li = $(btn).closest('li.trivia');
        var popupErr = $(
            '<table class="popupNewerr"><tr><td>'+
                '<div class="block">'+
                    '<div class="title">Сообщить об ошибке</div>'+
                    '<label>Введите описание ошибки</label>'+
                    '<textarea name="notice" class="report_error_notice" autofocus>'+selectedText+'</textarea>'+
                    '<div class="report_error_button"><input type="button" value="Отправить" /></div>'+
                    '<div id="close" class="close"></div>'+
                '</div>'+
            '</td></tr></table>'
        );

        $('body').prepend(popupErr);

        popupErr
            .css({'display': 'table'})
            .find('.close').click(function(){
                popupErr.hide().remove();
                popupErr = null;
            }).end()
            .find('.report_error_button').click(function(){
                var err = popupErr.find('.report_error_notice').val();
                if (err.length) {
                    $.post('/handler_info.php', {obj_type: 'film', obj_id: id_film, err: err, id: li.data('id'), rnd: (new Date()).getTime()}, function(resp){
                        popupErr.find('.close').click();
                        li.addClass('error_active')
                            .append('<span class="error_active_icon"></span>');
                        alert('Спасибо! Ошибка будет исправлена после проверки администрацией.');
                    });
                } else {
                    popupErr.find('.close').click();
                }
            }).end()
            .find('.report_error_notice').focus();
        return false;
    }

    function Spoiler(btn)
    {
        if (!confirm('Вы уверены, что данный факт содержит спойлер?\n\n(Спойлеры — это важная информация о сюжете фильма, событиях в нем происходящих, развязке, концовке и т.д.\nТакая информация может испортить впечатление от просмотра людям, еще не смотревшим фильм).')) {
            return false;
        }

        var li = $(btn).closest('li.trivia');
        $.post('/handler_info.php', {spoiler: li.data('id'), rnd: (new Date()).getTime()}, function(resp){
            li.addClass('spoiler_active')
                .append('<span class="spoiler_active_icon"></span>')
                .find('.contains_spoiler').remove();
            alert('Спасибо! Администрация проверит наличие спойлера в этом факте.');
        });
        return false;
    };

    return {
        init: init,
        Vk: Vk,
        Fb: Fb,
        Tw: Tw,
        Lj: Lj,
        Error: Error,
        Spoiler: Spoiler
    };
}());

$(function(){
    Trivs.init();
    $('.formReviewAncor').on("click", function(evt){
        evt.preventDefault();
        var topNum = $('#forma').offset().top;
        $('html, body').animate({scrollTop: topNum}, 500);
    });
})
