LockTimer=false;
LockTimeOut=false;
var FolderSelectTitles=new Array();
var Objects=new Array();
var ObjType=null;
var settings=new Array();
var result={};
var FirstTime=new Array();
var ReCountFolders=false;
var SelType= '#';
settings['film']=new Array();
settings['film']['handler']='mustsee';
settings['film']['name']='film';
settings['film']['id_name']='id_film';
settings['film']['liid']='film_';
settings['film']['id_names']='id_films';
settings['film']['rus']='Мои фильмы';
settings['stars']=new Array();
settings['stars']['handler']='stars';
settings['stars']['name']='actor';
settings['stars']['liid']='people_';
settings['stars']['id_name']='id_actor';
settings['stars']['id_names']='id_actors';
settings['stars']['rus']='Мои звезды';
var noHTMLchange=false;

function MyMoviesInit(){
    $('.MyKP_Folder_Select').each(function(){
        if($(this).hasClass('recountfolders')) ReCountFolders=true;
        var id='';
        if( $(this).attr('id') ) {
            id = $(this).attr('id').replace('MyKP_Folder_', '');
            SelType='#';
        } else {
            id = $(this).attr('objId');
            SelType=".";
        }
		if($(this).attr('type')){
			ObjType = $(this).attr('type'); // film | stars
		} else{
			ObjType = $(this).attr('data'); // film | stars
        }
        Objects[Objects.length]=id;
        clearTimeout(LockTimeOut);
        LockTimeOut=setTimeout(function(){ InitFoldersData('multiple'); },100);
    });
    $('.MyKP_Folder_Select_Single').each(function(){
        var id=$(this).attr('id').replace('MyKP_Folder_','');
        Objects[Objects.length]=id;
		if($(this).attr('type')){
			ObjType = $(this).attr('type'); // film | stars
		} else{
			ObjType = $(this).attr('data'); // film | stars
        }
        var mode = $(this).attr('data-tmpl');
        clearTimeout(LockTimeOut);
        LockTimeOut=setTimeout(function(){ InitFoldersData(mode ? mode : 'single'); },100);
    });
}

$(MyMoviesInit);

function InitFoldersData(mode)
{
    if (Objects.length==0) {
        return;
    }
    if (ObjType == 'stars') {
        result = {"folders":{
            "1":{"name":"\u0418\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0435","icon":"public-folder","id":1},
            "2":{"name":"\u0410\u043a\u0442\u0451\u0440\u044b","icon":"public-folder","id":2},
            "3":{"name":"\u0410\u043a\u0442\u0440\u0438\u0441\u044b","icon":"public-folder","id":3},
            "4":{"name":"\u0420\u0435\u0436\u0438\u0441\u0441\u0451\u0440\u044b","icon":"public-folder","id":4},
            "5":{"name":"\u041b\u044e\u0431\u0438\u043c\u044b\u0435 \u0437\u0432\u0451\u0437\u0434\u044b","icon":"public-folder","id":745}
        },"is_guest":1,"objFolders":[]};
    }
    if (ObjType == 'film') {
        result = {"folders":{
            "1":{"name":"\u0411\u0443\u0434\u0443 \u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c","icon":"public-folder","id":3575},
            "2":{"name":"\u0418\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0435","icon":"public-folder","id":1},
            "3":{"name":"\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u0432 \u043a\u0438\u043d\u043e","icon":"public-folder","id":2},
            "4":{"name":"\u041d\u0430\u0439\u0442\u0438 \u0432 \u0418\u043d\u0442\u0435\u0440\u043d\u0435\u0442\u0435","icon":"public-folder","id":3},
            "5":{"name":"\u041a\u0443\u043f\u0438\u0442\u044c \u043d\u0430 DVD","icon":"public-folder","id":4},
            "6":{"name":"\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u043d\u0430 \u0422\u0412","icon":"public-folder","id":5},
            "7":{"name":"\u041b\u044e\u0431\u0438\u043c\u044b\u0435 \u0444\u0438\u043b\u044c\u043c\u044b","icon":"public-folder","id":6}
        },"is_guest":1,"objFolders":[]};
    }

    for (var i = 0, max = Objects.length; i < max; i++) {
        var html='';
        var obj_id = Objects[i];
        var name=$(SelType+'MyKP_Folder_'+obj_id).attr('name');
        if(!name) name='Мои фильмы';
        FolderSelectTitles[obj_id]=name;
        if(mode=='single')
        {
            if(result.objFolders&&result.objFolders[obj_id]) var ac=' block_added';
            else ac='';
            html+='<div class="block_add'+ac+'">'+
                   '<div class="status"></div>'+
                   ((ObjType=='film')?'<div class="info"><a href="#"  onclick="help_my_movies(); return false;"></a></div>':'')+
                   '<span class="header">Добавить в</span>';
        }

        // тут папки
        var fol_num=0;

        if (mode == 'extended') {
            html += '<div class="block_add extended">';
            var first_folder = false;

            for(var folder_id in result.folders)
            {
                if(first_folder) continue;
                first_folder = result.folders[folder_id];
                var cl=' button_'+result.folders[folder_id].id;
                if(result.objFolders&&result.objFolders[obj_id]&&result.objFolders[obj_id][result.folders[folder_id].id]) cl+=' active';
            }
            //if(first_folder.name.length > 15)
            //    first_folder.name = first_folder.name.substr(0,15);
              html += '<div class="select" id="select_'+obj_id+'" title="добавить в '+settings[ObjType]['rus'] +'">'+
                '<span class="button '+cl+'" onclick="FavFolderClick('+first_folder.id+')"><div class="icon"></div><b>'+first_folder.name+'</b></span><span class="title '+cl+' no_text" onclick="ClickFolders(this)"><div class="icon"></div></span>'+
                '<div class="list_div"></div></div>';

        } else {
            html+='<div class="select" id="select_'+obj_id+'" title="добавить в '+settings[ObjType]['rus'] +'">'+
                  '<span class="title" onclick="ClickFolders(this)">'+FolderSelectTitles[obj_id]+' <b></b></span>'+
                  '<div class="list_div"></div></div>';
        }

        if(mode=='single')
        {
            html+='<div class="all"></div>';
            html+='</div>';
        }

        if (mode == 'extended'&&typeof(folders_link)!='undefined'&&typeof(folders_num)!='undefined') {
            html+='<div class="allFolders"><div class="dot"></div><div class="text"><a href="'+folders_link+'">все папки</a> ('+folders_num+')</div><div class="info" onclick="help_my_movies(); return false"></div></div>';
        }

        if(!noHTMLchange) $(SelType+'MyKP_Folder_'+obj_id).html(html);
        // $(SelType+'MyKP_Folder_'+obj_id+' .select .title, .select dd:not(.list_div)').click(function(){});
    }

    if(mode=='single'&&typeof(folders_link)!='undefined'&&typeof(folders_num)!='undefined')
        $('.block_add .all').html('<a href="'+folders_link+'">все папки ('+folders_num+')</a>');
}

function FavFolderClick(id){
    $.app.notice($.app.notices.authRequired, {'action':"использования сервиса &laquo;"+settings[ObjType]['rus']+"&raquo;"});
}

function ClickFolders(event_obj){
    var selid=$(event_obj).parents('.select').attr('id');
    if(selid&&selid.indexOf('select_')>-1) {
        $('.list_div').css({"display":"none"});
        var id=selid.replace('select_','');
        obj=$("#select_"+id+" .list_div");
        if(typeof(FirstTime[id])=="undefined")
        {
            InitFolders(id);
            InitFoldersMoves(id);
            FirstTime[id]=true;
        }
        LockTimer=true;
        clearTimeout(LockTimeOut);
        LockTimeOut=setTimeout(function(){ LockTimer=false; },500);


        $(event_obj).parents('#select_'+id).find(".list_div").css({"display":"block"});
    }
}

function InitFolders(obj_id){
    var list_adds=false,list_title_adds=false,arrow_adds=false;

    var fol_num=0;
    var total_fol_num=0;

    html='<div class="list_title" '+list_title_adds+' >'+FolderSelectTitles[obj_id]+' <b>'+(fol_num>0?"("+fol_num+")":"")+'</b></div>';

    html+='<dl class="list" '+list_adds+'>';
    for(var folder_id in result.folders) {
        var cl='';
        if(result.objFolders&&result.objFolders[obj_id]&&result.objFolders[obj_id][result.folders[folder_id].id]) var cl='slc';
        if (ObjType=='stars') {
            html += ''+
                '<dd class="'+cl+' '+result.folders[folder_id].icon+(result.folders[folder_id].id == 745 ? ' fav' : '')+(result.folders[folder_id].id == 745 && result.folders[folder_id].icon == 'private-folder' ? ' favGray' : '')+'" value="'+result.folders[folder_id].id+'">'+
                '<s></s> '+
                result.folders[folder_id].name+
                '<a class="arrow" '+arrow_adds+' href="/level/78/stars/list/type/'+result.folders[folder_id].id+'/people/'+obj_id+'/"></a></dd>';
        }
        if (ObjType=='film') {
            html += ''+
                '<dd class="'+cl+' '+result.folders[folder_id].icon+(result.folders[folder_id].id == 6 ? ' fav' : '')+(result.folders[folder_id].id == 6 && result.folders[folder_id].icon == 'private-folder' ? ' favGray' : '')+'" value="'+result.folders[folder_id].id+'">'+
                '<s></s> '+
                result.folders[folder_id].name+
                '<a class="arrow" '+arrow_adds+' href="/level/78/movies/list/type/'+result.folders[folder_id].id+'/film/'+obj_id+'/"></a></dd>';
        }
    }
    html+='</dl>';

    if (!noHTMLchange)
        $(SelType+'MyKP_Folder_'+obj_id+' .list_div').html(html);
}

function InitFoldersMoves(object_id)
{
    $(SelType+'MyKP_Folder_'+object_id+' .list dd').mouseover(function(){
        $(SelType+'MyKP_Folder_'+object_id+' .list dd.act_slc').removeClass('act_slc').addClass('slc');
        if($(this).hasClass('slc')){
                $(this).addClass('act_slc');
                $(this).removeClass('slc')
            }
        else
            $(this).addClass('act');
    });

    $(SelType+'MyKP_Folder_'+object_id+' .list dd').mouseout(function(){
        if($(this).hasClass('act_slc')){
            $(this).addClass('slc');
            $(this).removeClass('act');
            $(this).removeClass('act_slc');
            }
        else
            $(this).removeClass('act');
    });

    $(SelType+'MyKP_Folder_'+object_id+' .select dd').click(function(){
        LockTimer=true;
        clearTimeout(LockTimeOut);
        LockTimeOut=setTimeout(function(){ LockTimer=false; },500);
        var value=$(this).attr('value');
        var obj=this;
        obj_id=object_id;
        if(!$(obj).hasClass('act_slc')){
            $.app.notice($.app.notices.authRequired, {'action':"использования сервиса &laquo;"+settings[ObjType]['rus']+"&raquo;"});
        }
    });

    $(SelType+'MyKP_Folder_'+object_id+' .select .list_title').click(function(){
        var selid=$(this).parents('.select').attr('id');
        if(selid&&selid.indexOf('select_')>-1) {
            var id=selid.replace('select_','');
            $("#select_"+id+" .list_div").hide("fast").css({"display":"none"});
                clearTimeout(LockTimeOut);
        }
    });

    $(SelType+'MyKP_Folder_'+object_id+' .select dd a').click(function(){
        top.location=this.href;
        return false;
    });


}

$(function(){
    $('body').click(function(){
    if(!LockTimer)
        $(".list_div").css({"display":"none"});
    });
});


function DelMyFolderItem(type, obj_id, id_folder)
{
    $('#'+settings[type]['liid']+obj_id).animate({'opacity': 0}, 400, function(){
        $(this).css({'display': 'none'});
        if ($('#itemList li:visible').length < 1) {
            top.location = top.location.href+'?';
        }
    });

    var url =
        '/handler_'+settings[type]['handler']+'_ajax.php?'+
        'mode=del_'+settings[type]['name']+'&'+
        settings[type]['id_name']+'='+obj_id+'&'+
        'recount=1&'+
        'rnd='+Math.round(Math.random()*100000000)+'&'+
        'from_folder='+id_folder;

    $.getJSON(url, function(res){
        if (res.recount) {
            $('li#folder_'+id_folder+' b').html(res.recount);
        }
    });
}
