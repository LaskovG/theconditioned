function qr(url, width, height){
    width = width ? width : 300;
    height = height ? height : 300;
   
    if(!$('#qr_code').length){
    var html='<table class="popupNew" id="qr_code" style="display: table"><tr><td style="background:rgba(0,0,0,0.7); cursor:pointer;" onclick="closeQr()">' +
       '    <div class="block" onclick="return false;">' +
       '        <div class="title">QR-код со ссылкой на эту страницу</div>' +
       '        <div class="text">ѕросканируйте это изображение своим телефоном дл€ перехода на эту страницу.</div>' +
       '        <div class="qrCodeLarge"><img src="http://chart.apis.google.com/chart?cht=qr&chs='+width+'x'+height+'&choe=UTF-8&chld=H&chl='+encodeURIComponent(url)+'" alt="" /></div>' +
       '        <div class="close" onclick="closeQr()"></div>' +
       '    </div>' +
       '</td></tr></table>';
       $('body').prepend(html);
    
   }
   
  
   $('#qr_code').fadeIn();
}

function closeQr(){
    $('#qr_code').fadeOut();
}