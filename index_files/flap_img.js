var FlappingImages=new Array();
var FlappingN=0;
var monitor=new Array();

function getBodyScrollTop()
{
    return self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop);
}

function getObjTop(elem)
{
    var t = 0;
	while (elem)
    {
        t += elem.offsetTop;
        elem = elem.offsetParent;
    }
    return t;
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

function RefreshImages(){
    scrollTop=parseInt(getBodyScrollTop(),10) + monitor['height'];
    scrollTop = scrollTop + 200;
    for(var id in FlappingImages)
    {
        var img_path=$("#"+id).attr('title');
        if(!img_path) continue;
        if(img_path.indexOf("/")==0){
            img_path= getStaticsDomain()? getStaticsDomain() + img_path : img_path;
        }

        // FF, Chrome, Safari
        if(!$.browser.msie && !$.browser.opera && FlappingImages[id] && FlappingImages[id]<=scrollTop){
            $("#"+id).attr("src",img_path)
                       .attr('title','')
                       .removeClass('flap_img')
                       .bind("load",function(){
                            $(this).animate({"opacity":1});
                        });
            FlappingImages[id]=null;
        } else {
            // Opera не понимает onload уже загруженных картинок
            if($.browser.opera && window.navigator.userAgent.indexOf("Mini")==-1 && FlappingImages[id] && FlappingImages[id]<=scrollTop){
                $("#"+id).attr("src",img_path)
                        .attr('title','')
                        .removeClass('flap_img')
                        .animate({"opacity":1});
                FlappingImages[id]=null;
            }

            // В IE показываем все картинки сразу, т.к. прокрутка тормозит
            if(($.browser.msie || ($.browser.opera && window.navigator.userAgent.indexOf("Mini")!=-1)) && FlappingImages[id] != null) {
                $("#"+id).attr("src",img_path)
                       .attr('title','')
                       .removeClass('flap_img')
                       .css({"opacity":1});
                FlappingImages[id]=null;
            }
        }
    }
}

function InitFlap(){
	FlappingImages=new Array();
    $(".flap_img").each(function(){
        var pos=getObjTop(this);
        var id='';
        if(!(id=$(this).attr('id')))
        {
            id="FlappImg_"+(FlappingN++);
            $(this).attr('id',id);
        }
        FlappingImages[id]=parseInt(pos > 0 ? pos :10,10);
        clearTimeout(refreshImg);
        refreshImg=setTimeout(RefreshImages,100);
    });
};
var monitor=findDimensions();
var refreshImg=false;
$(function(){
	InitFlap();
    $(window).bind("scroll",RefreshImages);
    $(window).bind("resize",function(){monitor=findDimensions();});
})
