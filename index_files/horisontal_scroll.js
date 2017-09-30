
var position_x=new Array();
var scroll_per_time=new Array();
var num_of_items=new Array();
var unhiddenSliders = [];
function GE(id){return document.getElementById(id);}
function unHidePhotos(scroller_type){
    if(unhiddenSliders[scroller_type]) return false;
    var hiddens = $((scroller_type?'.'+scroller_type+' ':'')+'.hidden_item_img');
    if(hiddens.length){
        hiddens.each(function(){
           $(this).attr('src',$(this).attr('data-img')).removeClass('hidden_item_img');
        });
    }
     
    var hiddens = $((scroller_type?'.'+scroller_type+' ':'')+'.hidden_item_bg');
    if(hiddens.length){
        hiddens.each(function(){
           $(this).css('background-image',"url("+$(this).attr('data-img')+")").removeClass('hidden_item_bg');
        });
    }
    unhiddenSliders[scroller_type] = true;
}
function ScrollerRight(scroller_type,block)
{	
    unHidePhotos(scroller_type);
	if(position_x[scroller_type]<0) position_x[scroller_type]=0;
	if(num_of_items[scroller_type]>1){
		
	if(position_x[scroller_type]<(num_of_items[scroller_type]-1)*scroll_per_time[scroller_type]){
		position_x[scroller_type]+=scroll_per_time[scroller_type];
		$((scroller_type?'.'+scroller_type+' ':'')+'.scroller_photo_set').animate({right: position_x[scroller_type] },function(){});	
		if(block)
		{
			if(position_x[scroller_type]>=(num_of_items[scroller_type]-1)*scroll_per_time[scroller_type])
					$((scroller_type?'.'+scroller_type+' ':'')+'.arrows_left').addClass('disable_left');
				$((scroller_type?'.'+scroller_type+' ':'')+'.arrows_right').removeClass('disable_right');
		}
	}
	else {
			if(!block){
				position_x[scroller_type]=0;
				$((scroller_type?'.'+scroller_type+' ':'')+'.scroller_photo_set').animate({right: position_x[scroller_type] },function(){});	 
			}
		}

}
}

function ScrollerLeft(scroller_type,block)
{
	
    unHidePhotos(scroller_type);
	if(position_x[scroller_type]<0) position_x[scroller_type]=0;
	if(num_of_items[scroller_type]>1){
		if(position_x[scroller_type]>0){
			position_x[scroller_type]-=scroll_per_time[scroller_type];
			$((scroller_type?'.'+scroller_type+' ':'')+'.scroller_photo_set').animate({right: position_x[scroller_type] },function(){});	
				if(block)
				{
				if(position_x[scroller_type]<scroll_per_time[scroller_type])
					$((scroller_type?'.'+scroller_type+' ':'')+'.arrows_right').addClass('disable_right');
				$((scroller_type?'.'+scroller_type+' ':'')+'.arrows_left').removeClass('disable_left');
				}
		}
		else
		{
			if(!block){
			position_x[scroller_type]=(num_of_items[scroller_type]-1)*scroll_per_time[scroller_type];
			$((scroller_type?'.'+scroller_type+' ':'')+'.scroller_photo_set').animate({right: position_x[scroller_type] },function(){});	
			}
		}
	}
}