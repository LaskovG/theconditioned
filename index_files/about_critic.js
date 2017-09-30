function about_critic()
{
var critic = '<table style=\'text-align: left\' bgcolor=\'#ffffff\' cellpadding=0 cellspacing=0 border=0>' +
'<tr><td>' +
'<table width=100% bgcolor=\'#ffffff\' cellpadding=0 cellspacing=0 border=0>' +
'<tr><td valign=top>' +
'<img src=\'/images/logonew2.gif\' vspace=15 hspace=20 width=210 height=55 alt=\'Рейтинг кинокритиков\'>' +
'</td><td width=50% align=right style=\'padding-right:20px\'><input type=\'button\' value=\'закрыть\' style=\'width:120px\' onclick=\'javascript:close_alert_window(); return false;\'></td></tr><tr><td height=50 colspan=2>' +
'<H2 class=\'chapter\' style=\'font:100 25px tahoma,verdana;padding-top:10px;padding-left:25px;border-top:1px solid #ccc\'>Рейтинг кинокритиков</H2>' +
'</td></tr>' +
'<tr><td colspan=2 valign=top style=\'padding:0px 5px 0px 25px\' class=\'news\'><br><br>' +
'<h3 style=\'font-weight:100;color:#007\'>Введение</h3>' +
'Рейтинг кинокритиков &mdash; это отношение числа положительных рецензий на фильм к общему числу рецензий. ' +
'Рейтинг кинокритиков выражается в процентах:<br><br>' +
'<img src=\'/images/rotten.gif\' width=399 height=76 style=\'border:1px solid #ccc\'><br><br>' +
'Рейтинг кинокритиков основан на рецензиях, публикуемых на англоязычном сайте ' +
'<a href=\'http://www.rottentomatoes.com/\' class=\'all\' style=\'color:#555\' target=\'_blank\'>rottentomatoes.com</a>. ' +
'Поэтому данный рейтинг охватывает только фильмы, прошедшие в американском кинопрокате.' +
'<br><br><br><h3 style=\'font-weight:100;color:#007\'>Что означают все эти цифры?</h3>' +
'<img src=\'/images/rotten2.gif\' width=431 height=247 style=\'border:1px solid #ccc\'><br><br>' +
'Для фильмов-новинок рейтинг обновляется в ежедневном режиме.'+ '<br /><center><input class="button" type="button" style="margin:20px;" value="закрыть" onclick="javascript:close_alert_window(); return false;"/></center>' +
'</td></tr>' +
'</table>' +
'</td></tr>' +
'</table>';
alert_popup(critic, 'popup_div', 800, ($(window).height()/100)*80);
}