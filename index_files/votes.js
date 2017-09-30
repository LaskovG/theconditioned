if (typeof(KP) == 'undefined') {
    var KP = {};
}


KP.Stars={
    block_exit: false,
    block_inited: false,
    timers: new Array(),
    votes: new Array(),
    eye: new Array(),
    codes: new Array(),
    callback: function() {},
    // дефолтные настройки
    settings: {
        "divcontainer":".WidgetStars",
        "type":"single",
        "noaccess":false,
        "hideStars":false
    },

    EXPORT: {
        "vk":-1,
        "fb":-1,
        "tw":-1,
        "lj":-1
    },

    initBlock: function(){
        if(this.block_inited)
            return false;
        $(function(){
            $(window).unload(function(){
                if(KP.Stars.block_exit) {
                    original_alert("Вы покидаете страницу, не дождавшись сохранения оценки. Есть вероятность, что оценка не сохранена. Пожалуйста, вернитесь и поставьте оценку еще раз");
                }
            });
        });
        this.block_inited = true;
    },

    widget: function(args) {
        KP.Stars.initBlock();
        if (args && args.divcontainer)
            divcontainer=args.divcontainer;
        else
            divcontainer=KP.Stars.settings.divcontainer;

        if (args && args.increment) {
            // служит для корректной работы двух одинаковых блоков на странице (например на странице случайного фильма)
            divcontainer = divcontainer+'_'+args.increment;
        }        

        if (args && typeof(args.hideStars) != 'undefined') {
            KP.Stars.settings.hideStars = args.hideStars;
        }

        if (args && args.type) {
            KP.Stars.settings.type = args.type;
        }
        if (args && args.noaccess) {
            KP.Stars.settings.noaccess = args.noaccess;
        }
        if (args && args.user_id) {
            KP.Stars.settings.user_id = args.user_id;
        }
        if (args && args.guest) {
            KP.Stars.settings.guest = args.guest;
        }
        if (!args.filmId) {
            return false;
        }
        var $div = $(divcontainer);
        var built_rating=$div.attr("value");
        if (!args.rating && built_rating)
            args.rating=built_rating;
        //if(!args.rating) return false;
        if (!args.filmId)
            return false;
        var id_film=args.filmId;
        
        if (args && args.cache_vote && typeof(KP.Stars.votes[id_film]) !== 'undefined') {
            // значение измененно виджитом который появился раньше
        } else {
            KP.Stars.votes[id_film] = args.myVote;
        }
        var rating=args.rating;
        if (args.external && !KP.Stars.EXPORT_DONE)
            KP.Stars.setExport(args.external);

        var rating_style="";
        if (rating) {
            rating_style="style='width:'";
            if (typeof(KP.FILMS)=='undefined')
                KP.FILMS={}
            KP.FILMS[id_film]=rating;
        }

        KP.Stars.settings.vote_date = (args && args.vote_date) ? args.vote_date : null;
        KP.Stars.codes[id_film] = args.user_code;
        KP.Stars.settings.level1 = (args && args.level1) ? true : false;

        var dom_ids = {
            eye_id : '#film_eye_'+id_film,
            user_vote_id : '#user_vote_'+id_film,
            my_vote_block_id: '#my_vote_block_'+id_film
        };
        if (args && args.increment) {
            dom_ids.eye_id = dom_ids.eye_id+'_'+args.increment;
            dom_ids.user_vote_id = dom_ids.user_vote_id+'_'+args.increment;
            dom_ids.my_vote_block_id = dom_ids.my_vote_block_id+'_'+args.increment;
        }

        // при создании нового блока с оценками берём значение предыдущего (если данная настройка включена)
        if (args && args.cache_vote && typeof(KP.Stars.votes[id_film]) !== 'undefined') { // значит оценку ставили ранее на этой странице
            if (KP.Stars.votes[id_film]) {
                $(dom_ids.user_vote_id).find('p').html(KP.Stars.votes[id_film])
                $(dom_ids.user_vote_id).show();
                $(dom_ids.eye_id).hide();
                $(dom_ids.my_vote_block_id).show();
            } else {
                $(dom_ids.user_vote_id).hide();
                $(dom_ids.my_vote_block_id).hide();
                if (KP.Stars.eye[id_film]) {
                    $(dom_ids.eye_id).addClass('eye_act');
                } else {
                    $(dom_ids.eye_id).removeClass('eye_act');
                }
                $(dom_ids.eye_id).show();
            }
        }

        if (!KP.Stars.settings.hideStars) {
            var html=
            '<div class="starbar">'+
                '<div class="outer" onmouseover="KP.Stars.showExportString('+id_film+')">'+
                    '<div class="starbar_w" '+(($.cookie('hideBlocks') & 2) || !KP.Stars.votes[id_film] ? "style='display: none'":"")+'></div>'+
                    '<a href="#" class="s10" data-title="10"></a>'+
                    '<a href="#" class="s9" data-title="9"></a>'+
                    '<a href="#" class="s8" data-title="8"></a>'+
                    '<a href="#" class="s7" data-title="7"></a>'+
                    '<a href="#" class="s6" data-title="6"></a>'+
                    '<a href="#" class="s5" data-title="5"></a>'+
                    '<a href="#" class="s4" data-title="4"></a>'+
                    '<a href="#" class="s3" data-title="3"></a>'+
                    '<a href="#" class="s2" data-title="2"></a>'+
                    '<a href="#" class="s1" data-title="1"></a>'+
                '</div>'+
            '</div>'+
            '<div class="vote_export_block" style="display:none">'+
            '<div class="vote_export">'+
            '   <span class="title">Экспорт оценки</span>'+
            '   <div class="list">'+
            '      <div class="item vk'+(KP.Stars.EXPORT.vk==1?"_off":"")+'" onclick="KP.Stars.toggleExport(\'vk\'); return false;" title="ВКонтакте"><a href="#"></a></div>'+
            '      <div class="item fb'+(KP.Stars.EXPORT.fb==1?"_off":"")+'" onclick="KP.Stars.toggleExport(\'fb\'); return false;" title="Facebook"><a href="#"></a></div>'+
            '      <div class="item tw'+(KP.Stars.EXPORT.tw==1?"_off":"")+'" onclick="KP.Stars.toggleExport(\'tw\'); return false;" title="Twitter"><a href="#"></a></div>'+
            '      <div class="item lj'+(KP.Stars.EXPORT.lj==1?"_off":"")+'" onclick="KP.Stars.toggleExport(\'lj\'); return false;" title="ЖЖ"><a href="#"></a></div>'+
            '   </div>'+
            '   <a class="settings_share" title="Настройки" href="/level/78/edit_main/#export_l"></a>'+
            '   <div class="close"><a href="#"></a></div>'+
            '   <div class="text_share_limit_bg"></div>' +
            '   <textarea class="text_share_limit" maxlength="100" cols="24" rows="5" onclick="$(this).data(\'active\',1)">Добавить комментарий к оценке</textarea>'+
            '   <div class="text_chars_limit">100</div>'+
            '   <a class="add_votes_share" href="#"><span></span>Поставить <i>4</i> и опубликовать</a>'+
            '</div>'+
            '</div>'+
            '<div class="rating_bottom">'+
            '    <span style="display: none; text-decoration: underline; cursor: pointer;  margin-right:5px;" class="btn_show_export" onmouseover="KP.Stars.showExportString('+id_film+')" onclick="$(\'.VF'+id_film+' .vote_export_block\').show(); KP.Stars.expBGColor('+id_film+'); KP.Stars.toggleExportView(); return false;">экспорт оценки</span>'+
            '    <span style="display: none; text-decoration: underline; cursor: pointer" class="btn_delete_vote remove">удалить оценку</span>'+
            '    <span style="display: none" class="mess_after_vote">[рейтинг скоро обновится]</span>'+
            (KP.Stars.settings.vote_date
                ? '    <span style="color: #999; position: absolute; left: 159px" id="vote_date">'+KP.Stars.settings.vote_date+'</span>'
                : ''
            ) +
            '    <span style="display: none" class="ajax_star">[...сохранение оценки...] <i class="loader"></i></span>'+
            '<span>&nbsp;</span></div>'
            ;
            $div.html(html);
            $div.addClass("VF"+id_film);
            $div.mouseout(function(){KP.Stars.hideExportString(id_film)});
            (function($) {
                $div.find('.text_share_limit').on("keyup keypress", function(event) {
                    $(this).data('edited',1);
                    var txt = $(this).val();
                    txt2 = txt.replace(/\s{2,}/g,' ').replace(/\n/g,'');
                    if(txt2!=txt) {
                        $(this).val(txt2);
                    }

                    var chars = $(this).val().length;
                    if (chars > 100) {
                        var txt = $(this).val().substr(0, 100);
                        $(this).val(txt);
                        $div.find(".text_share_limit_bg").html(getFullText(txt,$div.find('.hoverstars').data('title')));
                        chars = 100;
                    }
                    $div.find('.text_chars_limit').html(100 - chars);
                    var txt = $(this).val();
                    $div.find(".text_share_limit_bg").html(getFullText(txt,$div.find('.hoverstars').data('title')));
                });
                $div.find('.close a').unbind('click').click(function(){
                    $(this).parents('.vote_export_block').hide();
                    KP.Stars.toggleExportView();
                    return false;
                });
                $div.find('.text_share_limit').bind("click", function(event) {

                    if(KP.Stars.EXPORT.vk!=1 && KP.Stars.EXPORT.fb!=1 && KP.Stars.EXPORT.tw!=1 && KP.Stars.EXPORT.lj!=1) {
                        alert("Вам необходимо включить экспорт хотя бы в одну социальную сеть.");
                        $(this).get(0).blur();
                        return false;
                    }

                    $div.find('.close a').unbind('click').click(function(){
                            var obj=$div.find(".vote_export_block");
                            obj.hide();
                            $div.find('.starbar a').removeClass('hoverstars');
                            $div.find('.starbar a').removeClass('opacitystem');
                            $div.find('.outer').removeClass('outerOver');
                            return false;
                    });

                    $(this).parents('.vote_export').removeClass('open_mess_share').addClass('open_mess_share');
                    $ta = $(this);
                    if(args.filmName) {
                        if(!$ta.data('edited') && KP.Stars.EXPORT.tw==1) {
                            $ta.val('"'+args.filmName+'"');
                            $div.find(".text_share_limit_bg").html(getFullText('"'+args.filmName+'"',$div.find('.hoverstars').data('title')));
                        } else {
                            $ta.val("");
                            $div.find(".text_share_limit_bg").html(getFullText("",$div.find('.hoverstars').data('title')));
                        }

                        var $ta = $div.find(".text_share_limit");
                        var chars = $ta.val().length;
                        if (chars > 100) {
                            var txt = $ta.val().substr(0, 100);
                            $ta.val(txt);
                            $div.find(".text_share_limit_bg").html(getFullText(txt,$div.find('.hoverstars').data('title')));
                            chars = 100;
                        }
                        $div.find('.text_chars_limit').html(100 - chars);
                    } else {
                        if(!$ta.data('edited')) {
                            $ta.val("");
                            $div.find(".text_share_limit_bg").html("");
                        }
                    }
                    $ta[0].focus();

/*

                    $(this).unbind("keyup").keyup(function(e){
                        if(e.keyCode == 13 && e.ctrlKey) {
                            var vote=$div.find('.hoverstars').data('title');
                            var ta = $div.find('textarea');
                            var comment = '';
                            if(ta.data('active')) {
                                comment = ta.val();
                            }
                            KP.Stars.setVote(id_film,vote,comment);
                        }

                        if(e.keyCode == 27) {
                            $div.find('textarea').get(0).blur();
                            $('.open_mess_share').removeClass('open_mess_share');
                            $('.text_share_limit').val('Добавить комментарий к оценке');
                            $('.text_share_limit').data('active',0);
                            $('.text_share_limit').data('edited',0);
                        }
                        return false;
                    });
*/

                });
            })(jQuery);
            if (KP.Stars.votes[id_film] || rating) {
                KP.Stars.drawVote(id_film, KP.Stars.votes[id_film], rating, false, dom_ids);
            }

            $div.find(".outer a").each(function(){
                var vote=$(this).data('title');

                $(this).click(function(){
                    var ta = $div.find('.vote_export_block').find('textarea');
                    var comment = '';
                    if(ta.data('active')) {
                        comment = $div.find('textarea').val();
                    }
                    KP.Stars.setVote(id_film, vote, comment, dom_ids);
                    return false;
                });
            });

            $div.find(".add_votes_share").click(function(){
                var vote=$div.find('.hoverstars').data('title');
                var ta = $div.find('textarea');
                var comment = '';
                if(ta.data('active')) {
                    comment = ta.val();
                }
                KP.Stars.setVote(id_film, vote, comment, dom_ids);
                return false;
            });

            $div.find('.starbar a').mouseover(function(){
                $div.find('.outer').addClass('outerOver');
                $(this).siblings().not('div').removeClass('hoverstars').addClass('opacitystem');
                $div.find('.vote_export_block i').text($(this).data('title'));
                var $ta = $div.find(".text_share_limit");
                if($div.find('.vote_export').hasClass('open_mess_share')) {
                    if(args.filmName) {
                        if(!$ta.data('edited')) {
                            var txt = '"'+args.filmName+'"';
                            $ta.val(txt);
                            $div.find(".text_share_limit_bg").html(getFullText(txt,$(this).data('title')));
                        } else {
                            var txt = $ta.val();
                            $div.find(".text_share_limit_bg").html(getFullText(txt,$(this).data('title')));
                        }

                    } else {
                        if(!$ta.data('edited')) {
                            $ta.val("");
                            $div.find(".text_share_limit_bg").html("");
                        }
                    }

                    $ta[0].focus();
                }

                $(this).addClass('hoverstars');
                if($.cookie("ExpView")) {
                    $(this).addClass('hoverstarsH');
                } else {
                    $(this).removeClass('hoverstarsH');
                }
            });
            $div.find(".starbar, .starbar_w, .vote_export_block, .btn_show_export").mouseover(function(event){
                // показываем настройку экспорта только если экспорта еще небыло.
                if (!KP.Stars.timers[id_film])
                    KP.Stars.timers[id_film] = false;
                clearTimeout(KP.Stars.timers[id_film]);
                handlers = this;
                KP.Stars.timers[id_film] = setTimeout(function(){
                    if (!$.cookie("ExpView")) {
                        obj = $(handlers).parent(".WidgetStars").find(".vote_export_block");
                        if (obj.css('display') == 'none') {
                            $(".vote_export_block").hide();
                            KP.Stars.expBGColor(id_film);
                            obj.show();
                        }
                    } else {
                        $(".VF"+id_film+" .btn_show_export").show();
                    }
                }, 100);
            });
            $div.mouseout(function(){
                if(!KP.Stars.timers[id_film])
                    KP.Stars.timers[id_film]=false;
                clearTimeout(KP.Stars.timers[id_film]);
                KP.Stars.timers[id_film]=setTimeout(function(){
                    if(!$.cookie("ExpView")){
                        if(!$div.find('.vote_export_block').find('textarea').data('active')) {
                            obj=$div.find(".vote_export_block");
                            obj.hide();
                            $div.find('.starbar a').removeClass('hoverstars');
                            $div.find('.starbar a').removeClass('opacitystem');
                            $div.find('.outer').removeClass('outerOver');
                        }
                    } else {
                        $div.find('.starbar a').removeClass('hoverstars');
                        $div.find('.starbar a').removeClass('opacitystem');
                        $div.find('.outer').removeClass('outerOver');
                        $(".VF"+id_film+" .btn_show_export").fadeOut();
                    }
                }, 100);
            });
        }

        KP.Stars.callback();

        var level = 0;
        if (typeof(getLevel) == 'function') {
            level = getLevel();
        }

        // глазик вместо оценки
        var eyeDisabled = KP.Stars.settings.hideStars || $(dom_ids.eye_id).hasClass('eyeDisabled');
        var noIMDb = !$('div._IMDB_'+id_film+'_').get(0);
        if (eyeDisabled) {
            if (noIMDb && (level == 10 || !level)) {
                $('#MyKP_Folder_'+id_film).css({'margin-top': '7px'});
            }
            $(dom_ids.eye_id).removeClass('eye').addClass('eyeDisabled');
        }
        var margin_top = level == '79list' ? '46' : (
            level == 83 ? '-25' : (
                (level == 47 || level == 52) ? '21' : (
                    level == 48 ? '16' : (
                        $('#tr_'+id_film).hasClass('_NO_HIGHLIGHT_') ? '10' : '16'
                    )
                )
            )
        );
        var margin_left = level == 83 ? '238' : ($('#tr_'+id_film).hasClass('_NO_HIGHLIGHT_') ? '180' : '190');
        var title = eyeDisabled
                    ? getObjTitle(id_film, true)+' ещё не вышел в '+(getObjTitle(id_film) == 'сериал' ? 'эфир' : 'прокат')
                    : (
                        $(dom_ids.eye_id).hasClass('eye_act')
                        ? 'Убрать отметку о просмотре'
                        : 'Пометить фильм как просмотренный'
                    );
        $(dom_ids.eye_id)
            .attr({'title': title})
            .after('<div class="eyeLoader" id="star_null_vote_'+id_film+'" style="position: absolute; display: none; background: url(/images/loaders/snake_f60_'+($('#tr_'+id_film).hasClass('active') ? 'ffe3d1' : 'fff')+'.gif); width: 16px; height: 16px; overflow: hidden; margin: '+margin_top+'px 0 0 '+margin_left+'px"></div>')
            .click(function(){
                if ($(dom_ids.eye_id).hasClass('eyeDisabled')) {
                    return false;
                }

                if (isGuest()) {
                    $.app.notice($.app.notices.authRequired, {"action":"того чтобы поставить пометку о просмотре"});
                    return false;
                }

                // флаг не кликабелен, если юзер оценил фильм
                if ($('#my_vote_block').length && $('#my_vote_block').css('display') != 'none') {
                    alert('Снять пометку о просмотре невозможно, т.к. вы поставили оценку этому фильму.');
                    return false;
                }

                // флаг не кликабелен, если юзер оценил фильм
                if ($(dom_ids.my_vote_block_id).length && $(dom_ids.my_vote_block_id).css('display') != 'none') {
                    alert('Снять пометку о просмотре невозможно, т.к. вы поставили оценку этому фильму.');
                    return false;
                }

                // нельзя увидеть фильм, если он ещё не вышел в прокат
                if (!$div.find('div.starbar').length && !$('#film_votes div.starbar').length) {
                    alert(getObjTitle(id_film, true)+' ещё не вышел в '+(getObjTitle(id_film) == 'сериал' ? 'эфир' : 'прокат')+'.');
                    return false;
                }

                $(dom_ids.eye_id+', #star_null_vote_'+id_film).toggle();

                var now = new Date();
                KP.Stars.block_exit = true;
                $.get('/handler_vote.php', {id_film: id_film, "c": KP.Stars.codes[id_film], act: ($(this).hasClass('eye_act') ? 'delete' : 'add'), rnd: now.getTime()}, function(data) {
                    KP.Stars.block_exit = false;
                    $(dom_ids.eye_id+', #star_null_vote_'+id_film).toggle();
                    if (data == 'ok') {
                        $(dom_ids.eye_id)
                            .toggleClass('eye_act')
                            .attr({'title': ($(dom_ids.eye_id).hasClass('eye_act') ? 'Убрать отметку о просмотре' : 'Пометить фильм как просмотренный')});
                        KP.Stars.eye[id_film] = ($(dom_ids.eye_id).hasClass('eye_act') ? true : false);
                        KP.Stars.votes[id_film] = false;
                        if ($('#tr_'+id_film).length) {
                            if (!$('#tr_'+id_film).hasClass('_NO_HIGHLIGHT_')) {
                                $('#tr_'+id_film).toggleClass('active');
                                $('#star_null_vote_'+id_film).css({'background-image': 'url("/images/loaders/snake_f60_'+($('#tr_'+id_film).hasClass('active') ? 'ffe3d1' : 'fff')+'.gif")'});
                            }
                        }
                    } else if (data == 'REVIEW_EXISTS') {
                        alert('Нельзя снять пометку о просмотре, т.к. у вас есть опубликованная рецензия на этот фильм.');
                    } else if (data == 'Limit') {
                        alert('Вы слишком быстро ставите оценки. Передохните чуть-чуть.');
                    }
                }).fail(function(){
                    KP.Stars.block_exit = false;
                    $('.VF'+id_film+' .ajax_star').css({'display': 'none'});
                    alert("Возникла ошибка. Попробуйте позже.");
                });
            })

        if(typeof(jsTestAddEvent) == "function")
            jsTestAddEvent("votes_inited");
    },

    /**
     *  Актуализирует класс дива с фоном поля экспорта в зависимости от наличия оценки
     */
    expBGColor: function(id_film){
        $('#tr_'+id_film+' div.vote_export').toggleClass('active', $('#tr_'+id_film).hasClass('active'));
    },

    showExportString: function(id_film){
        if($.cookie('ExpView') && KP.Stars.votes[id_film]) {
            clearTimeout(KP.Stars.timers['h'+id_film]);
            $('.VF'+id_film+' .btn_delete_vote').hide();
           // $('.VF'+id_film+' .btn_show_export').show();
        }
    },

    hideExportString: function(id_film){
        if($.cookie('ExpView') && KP.Stars.votes[id_film]) {
            clearTimeout(KP.Stars.timers['h'+id_film]);
            KP.Stars.timers['h'+id_film]=setTimeout(function(){
                $('.VF'+id_film+' .btn_delete_vote').show();
                $('.VF'+id_film+' .btn_show_export').hide();
            }, 200);
        }
    },

    setVote: function(id_film, vote, comment, dom_ids) {
        
        // Cообщение для read-only 
        if (dbUnavailable === true) {
            alert(unavailableMessage);
            return false;
        }

        // в лвл 1 скрываем дату оценки

        $('.VF'+id_film+' .starbar a').removeClass('hoverstars');
        $('.VF'+id_film+' .starbar a').removeClass('opacitystem');
        $('.VF'+id_film+' .outer').removeClass('outerOver');
        $('.VF'+id_film+' textarea').data('active',0);


        if (KP.Stars.settings.vote_date && KP.Stars.settings.level1) {
            $('#vote_date').hide();
        }

        if (KP.Stars.settings.guest) {
            $.app.notice($.app.notices.authRequired, {"action":"голосования"});
            return;
        }
        if( KP.Stars.settings.noaccess ) {
            alert('Для голосования необходимо заполнить дату рождения и пол в <a href="/level/78/edit_main/" class="all">профиле</a> пользователя.');
            return;
        }

        $('.VF'+id_film+' .vote_export_block').hide();
        $('.starbar a').removeClass('hoverstars');
        $('.VF'+id_film+' .mess_after_vote').hide();
        $('.VF'+id_film+' .btn_delete_vote').hide();
        $('.VF'+id_film+' .ajax_star').css({'display':'inline'});

        var now = new Date();
        VoteExportArray = new Array();
        for (var type in KP.Stars.EXPORT) {
            if(KP.Stars.EXPORT[type]==1 && KP.Stars.vkOld && type=="vk")
                    alert("Внимание! КиноПоиск обновил систему экспорта оценок в ВКонтакте. Пожалуйста настройте еще раз <a href='/level/78/edit_main/#export_l' class='all'>экспорт оценок в разделе Настройки</a>...");

            if(KP.Stars.EXPORT[type]==1 && !(KP.Stars.vkOld && type=="vk"))
                VoteExportArray[VoteExportArray.length]=type;
        }

        var VoteExport = VoteExportArray.join(",");
        KP.Stars.block_exit = true;
        $.get('/handler_vote.php', {id_film: id_film,"c": KP.Stars.codes[id_film], vote: vote, "export": VoteExport, "comment":comment, rnd: now.getTime()}, function(response) {
            KP.Stars.block_exit = false;
            $('.VF'+id_film+' .ajax_star').css({'display': 'none'});

            if ($('#tr_'+id_film).length) {
                $(dom_ids.user_vote_id).css({'display': 'inline'})
                    .find('a')
                        .html(vote)
                        .attr({'href': '/level/83/film/326/ord/date/vote/'+vote+'/#list'})
                $(dom_ids.user_vote_id).find('p').text(vote); // во всех местах теперь оценки без ссылок
                if (!$('#tr_'+id_film).hasClass('_NO_HIGHLIGHT_')) {
                    $('#tr_'+id_film).addClass('active');
                }
                $(dom_ids.eye_id).css({'display': 'none'});
            } else {
                $(dom_ids.eye_id).addClass('eye_act');
            }

            if (response == 'Ok') {
                $(".VF"+id_film+" .vote_export_block").hide();
                $('.starbar a').removeClass('hoverstars');
                $(".VF"+id_film+" .btn_show_export").hide();
                KP.Stars.drawVote(id_film, vote, false, true, dom_ids);
                KP.Stars.votes[id_film]=vote;
                KP.Stars.eye[id_film] = true;
            } else if (response=='No access')
            {
                //fixme: no birth| no sex| no film_id
                //fixme: vote.php:179, https://st.yandex-team.ru/KP-5071
                //todo@creamov: refactor to $.app.notice($.app.notices.
                alert('Для голосования необходимо заполнить дату рождения и пол в <a href="/level/78/edit_main/" class="all">профиле</a> пользователя.');
            }
            else if (response=='Is guest') {
                $.app.notice($.app.notices.authRequired, {"action":"голосования"});
            } else if (response == 'REVIEW_EXISTS') {
                alert('Нельзя снять пометку о просмотре, т.к. у вас есть опубликованная рецензия на этот фильм.');
            } else if (response == 'Limit') {
                alert('Вы слишком быстро ставите оценки. Передохните чуть-чуть.');
            } else if(response =='auth_error') {
                $.app.notice($.app.notices.authRequired, {"action":"голосования"});
            } else {
                alert("Возникла ошибка. Попробуйте позже.");
            }
        }).fail(function(){
            KP.Stars.block_exit = false;
            $('.VF'+id_film+' .ajax_star').css({'display': 'none'});
            alert("Возникла ошибка. Попробуйте позже.");
        });

        return false;
    },

    toggleExportView:function(){
        var ShowExport=$.cookie("ExpView");
        $('.open_mess_share').removeClass('open_mess_share');
        $('.text_share_limit').val('Добавить комментарий к оценке');
        $('.text_share_limit').data('active',0);
        $('.text_share_limit').data('edited',0);
        if(ShowExport){
            $.cookie("ExpView",null,{ expires: 365, path: '/', domain: '.kinopoisk.ru'}); // показывать экспорт
            $(".btn_show_export").hide();
        } else {
            $.cookie("ExpView",1,{ expires: 365, path: '/', domain: '.kinopoisk.ru' }); // скрывать экспорт
            $('.mess_after_vote').hide();
            $('.btn_delete_vote').hide();
           // $(".btn_show_export").show();
        }
    },

    delVote: function(id_film, dom_ids) {

        // Cообщение для read-only 
        if (dbUnavailable === true) {
            alert(unavailableMessage);
            return false;
        }
        
        // в лвл 1 скрываем дату оценки
        KP.Stars.block_exit = true;
        $.get('/handler_vote.php', {id_film: id_film, act: 'kill_vote'}, function(data) {
            KP.Stars.block_exit = false;
            KP.Stars.eye[id_film] = true;
            if (KP.Stars.settings.vote_date && KP.Stars.settings.level1) {
                $('#vote_date').hide();
            }

            $('.VF'+id_film+' .btn_delete_vote, .VF'+id_film+' .mess_after_vote, #my_vote_block').css('display', 'none');
            $('.VF'+id_film+' .ajax_star').css('display', 'inline');
            $('.VF'+id_film+' .starbar_w').removeClass('user');
            KP.Stars.votes[id_film]=false;

            $('.VF'+id_film+' .ajax_star').css('display', 'none');

            if ($('#tr_'+id_film).length) {
                $(dom_ids.user_vote_id).css({'display': 'none'}).find('a').html('');
                $(dom_ids.eye_id).css({'display': 'inline'}).addClass('eye_act');
            }
            KP.Stars.drawVote(id_film, false, KP.FILMS[id_film]);
            $('.VF'+id_film+' .btn_delete_vote').unbind("click");
        }).fail(function(){
            KP.Stars.block_exit = false;
            $('.VF'+id_film+' .ajax_star').css({'display': 'none'});
            alert("Возникла ошибка. Попробуйте позже.");
        });

        return false;
    },

    drawVote: function(id_film, vote, rating, newvote, dom_ids){
        if(($.cookie('hideBlocks') & 2)) var display="none";
        else  var display="block";
        if(!newvote && rating)
            $(".VF"+id_film+" .starbar_w").css({"width":22 * rating, "display":display});

        if (vote) {
            if (newvote) {
                $(".VF"+id_film+" .starbar_w").css({"width":22 * vote, "display":display}).addClass("user");
            }
            var bgpos = -(vote - 1) * 19 + 'px top';
            // только для одиночных звездобаров
            if (!$('#my_vote_block').html()) {

                $('.rating_title').append('<span id="my_vote_block"><i>&bull;</i> <a style="color: #999; text-decoration: underline" href="/level/79/user/'+KP.Stars.settings.user_id+'/votes/">моя оценка</a> <b id="my_vote_text" style="background-position:' +bgpos + '"></b></span>');
                    $('#btn_null_vote').addClass('el_2_act').attr({'title': 'Вы смотрели этот фильм'});
            } else if ($('#my_vote_block').css('display') == 'none') {
                $('#my_vote_block').css('display', 'inline').find('#my_vote_text').css('background-position', bgpos);
                $('#btn_null_vote').addClass('el_2_act').attr({'title': 'Вы смотрели этот фильм'});
            } else {
                $('#my_vote_text').css('background-position', bgpos);
            }
            $('.VF'+id_film+' .ajax_star').hide();
            $('.VF'+id_film+' .btn_show_export').css('display', 'none');
            $('.VF'+id_film+' .btn_delete_vote').show();
            $('.VF'+id_film+' .btn_delete_vote').click(function(){ KP.Stars.delVote(id_film, dom_ids);});

            if (newvote) { // для новых оценок показываем "рейтинг скоро обновится"
                $('.VF'+id_film+' .mess_after_vote').show();
                KP.Stars.ShowRating();
            }
            // ------------------------------
        }
    },

    toggleExport: function(what){
        if(KP.Stars.settings.guest){
            $.app.notice($.app.notices.authRequired, {"action":"голосования и экспорта оценок"});
            return false;
        }
        var External_name=new Array();
        External_name['vk']="ВКонтакте";
        External_name['fb']="Facebook";
        External_name['tw']="Twitter";
        External_name['lj']="ЖЖ";
        if(KP.Stars.EXPORT[what]==-1) {
            alert("Экспорт оценок в "+External_name[what]+" не подключен. Вам необходимо включить его <a href='/level/78/edit_main/#export_l' class='all'>в настройках</a>.");
            return ;
        }

        KP.Stars.EXPORT[what]=(KP.Stars.EXPORT[what]==1?0:1);
        if(KP.Stars.EXPORT[what]!=1)
            $(".vote_export ."+what+"_off")
                .addClass(what)
                .removeClass(what+"_off");
        else
            $(".vote_export ."+what)
                .addClass(what+"_off")
                .removeClass(what);


        if(KP.Stars.EXPORT['vk'] != 1 && KP.Stars.EXPORT['fb'] != 1 && KP.Stars.EXPORT['tw'] != 1 && KP.Stars.EXPORT['lj'] != 1) {
            $('.open_mess_share').removeClass('open_mess_share');
            $('.text_share_limit').val('Добавить комментарий к оценке');
            $('.text_share_limit').data('active',0);
            $('.text_share_limit').data('edited',0);
        }
    },

    setExport: function(types){
        if(KP.Stars.settings.guest){
            KP.Stars.EXPORT_DONE=true;
            for(var what in KP.Stars.EXPORT)
                KP.Stars.EXPORT[what]=1;
        } else {
            KP.Stars.EXPORT_DONE=true;
            for (var what in types) {
                if(types[what]=="vk_old"){
                    KP.Stars.vkOld=true;
                    types[what]="vk";
                }
                KP.Stars.EXPORT[types[what]]=1;
            }
        }
    },

    ShowRating: function(){
        $('#btn_rating_close').css('display', 'block');
        $('#starbar').css('display', 'block');
        $('.starbar_w').css('display', 'block');
        $('#block_rating_close').css('display', 'none');
        $('#block_rating').css('display', 'block');
        $('#btn_rating_open_pls').css('display', 'none');
    }
};

function getFullText(text,vote){
    if(!text){
        return '';
    }
    return text + " <span>"+vote+" из 10</span>";

}
