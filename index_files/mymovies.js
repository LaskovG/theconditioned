var request_mustsee;

function mustsee(mode, id_film, to_folder)
{
    old_content = $('#div_mustsee_main').html();

    // крутилка
    $('#div_mustsee_main').html(
        '<div class="add_my remove_my add_my_img" id="img_mustsee">' +
            '<u></u>' +
            '<div></div>' +
        '</div>'
    );

    var now = new Date();

    $.get(
        '/handler_mustsee.php',
        {mode: mode, id_film: id_film, rnd: now.getTime(), to_folder: to_folder},
        function (data)
        {
            if (data == 'is_guest') {
                $.app.notice($.app.notices.authRequired, {"action":"использования сервиса &laquo;Мои фильмы&raquo;"});
            } else if (data.indexOf('<!-- impossibleAlert:') > 1) {
                alert(
                    'Вы добавляете фильм в папку, в которой не могут находится оцененные фильмы.<br />'+
                    'Свойства папки можно изменить в разделе <a href="/level/78/movies/list/type/'+to_folder+'/" class="all">Мой КиноПоиск</a>.'
                );
                $('#div_mustsee_main').html(old_content);
            } else {
                $('#div_mustsee_main').html(data);
            }
        }
    ).fail(function(){
        alert("Произошла ошибка. Попробуйте позже.");
    });
}


function delFromFolder(id_film, folder)
{
    if (!id_film || !folder) {
        return false;
    }

    $.get(
        '/handler_mustsee.php',
        {mode: 'del_film', id_film: id_film, from_folder: folder},
        function (data, status)
        {
            mustsee('id_film', id_film);
        }
    ).fail(function(){
        alert("Произошла ошибка. Попробуйте позже.");
    });
}


function help_my_movies()
{
var txt = '<table  bgcolor="#ffffff" cellpadding=0 cellspacing=0 border=0>' +
'<tr><td valign=top style="color:#444">' +
'<img src="/images/logonew2.gif" vspace=15 hspace=25 width=210 height=55 alt="Правильные оценки на КиноПоиске">' +
'</td><td width=50% style="text-align: right; padding-right:20px"><input style="width: 120px; text-align: center" type="button" value="закрыть" onclick="javascript:close_alert_window(); return false;"></td></tr><tr><td colspan=2 height=50>' +
'<H2 class="chapter" style="font-size:14px;padding:5px;padding-left:25px;border-bottom:1px solid #ccc;border-top:1px solid #ccc">&laquo;Мои фильмы&raquo; &mdash; Сервис КиноПоиска</H2>' +
'</td></tr>' +
'<tr><td colspan="2" valign=top style="padding:0px 10px 0px 25px" class="news"><br />' +
'Посетителям сайта больше нет необходимости запоминать сотни названий различных фильмов &#151; сервис <span style="color:#f00">&laquo;Мои фильмы&raquo;</span> позволяет хранить всё необходимое &laquo;под рукой&raquo;, на расстоянии пары кликов&#133;<img src="/images/movies/help_button.jpg" width=147 height=56 align=right vspace=20 hspace=10 style="border:5px solid #dfdfdf"><br /><br />' +

'С помощью данного сервиса каждый посетитель КиноПоиска может добавлять в свой персональный Профиль любой из фильмов, встретившийся ему на сайте. Для этого достаточно просто выбрать папку из выпадающего списка, который располагается на странице каждого фильма прямо под постером.<img src="/images/movies/help_folders.gif" width=153 height=118 align=left vspace=20 style="margin-right:20px;border:5px solid #dfdfdf"><br /><br />' +

'Такие избранные фильмы можно легко раскладывать <span style="color:#f00">по удобным папкам</span>, например: <i>Посмотреть в кино, Купить на DVD, Взять в прокате, Скачать в Интернете</i> и т.д&#133; Количество и многообразие папок ограничено только фантазией владельца профиля. Посетители сайта могут пользоваться папками, представленными в системе по умолчанию, либо <span style="color:#f00">создавать свои уникальные папки</span> (например: <i>&laquo;Фильмы, отданные соседу Васе Пупкину&raquo;</i>).<img src="/images/movies/help_onoff2.gif"  align=right vspace=20 hspace=10 style="border:5px solid #dfdfdf" width=126 height=66><br /><br />' +

'Любую папку можно сделать <span style="color:#f00">доступной для всех</span> пользователей, либо оставить <span style="color:#f00">скрытой</span> от чужих глаз. Например, Вы можете собрать 10 любимых фильмов в папке <i>&laquo;Хочу в подарок на День Рождения&raquo;</i>, и скинуть ссылку на эту папку родителям/друзьям/мужу/жене&#133; Только не переборщите с количеством &#151; чтобы стоимость подарка не превысила федеральный бюджет России&#133;<br /><br />' +

'Таким же способом вы можете познакомить своих друзей с вашей версией <i>Лучших/худших фильмов всех времен и народов</i>; ' +
'или со списком фильмов, которые давно и упорно хотите разыскать&#133;<br /><br />' +

'Кроме создания папок с фильмами сервис дает возможность отслеживать рецензии на выбранные фильмы. По аналогии с <i>Лентой друзей</i>, теперь есть возможность сформировать неограниченное количество <span style="color:#f00">Лент рецензий на избранные фильмы</span>. Например, в отдельные ленты можно собрать все рецензии на фильмы Люка Бессона, или все рецензии на тетралогию Чужие, или все рецензии на фильмы из рейтинга Топ-250 и т.д&#133;<br /><br />' +

'Также сервис дает возможность подписаться на обновления одновременно ко всем фильмам из любой вашей папки. Например, вы собрали все свои самые любимые фильмы в папку <i>&laquo;Лучшие из лучших&raquo;</i>. Сделав всего один клик в блоке <span style="color:#f00">Подписка на обновления</span> в пункте <nobr>ТВ-программа</nobr>, вы больше никогда не пропустите телевизионные показы этих фильмов. КиноПоиск заранее напомнит об этом соответствующим письмом по почте.<br /><br />' +

'Для любой вашей папки с фильмами можно установить особое свойство, при котором из неё будут автоматически удаляться все оцененные или просмотренные вами фильмы.<br /><br />' +

'Сервис <i>&laquo;Мои фильмы&raquo;</i> доступен только для <a href="#/level/30/" class="all js-external-login-action" target="_blank">зарегистрированных пользователей</a> КиноПоиска.' +

'<br /><br />'+'<center><input class="button" type="button" style="margin:20px;" value="закрыть" onclick="javascript:close_alert_window(); return false;"/></center>' +'</td></tr></table>';
alert_popup(txt, 'popup_div', 800, ($(window).height()/100)*80);
}
