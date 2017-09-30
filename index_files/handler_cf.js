var request_h_cf;

function xSplit(str,zam)
{
	str_line = new String(str);
	return str_line.split(zam);
}
	
function _handler_cf(handler_url)
{
	if (request_h_cf && request_h_cf.readyState!=0)	request_h_cf.abort();  
	request_h_cf=createRequest();
	if (!request_h_cf) return false;
	
	var rnd=Math.random(0,100);
	
	request_h_cf.open("GET", handler_url+'&rnd='+rnd, true);
	request_h_cf.onreadystatechange = 
		function x_handler()
		{
			if (request_h_cf.readyState == 4)
		  	if (request_h_cf.status == 200){
		  		
		  		var res_arr=xSplit(request_h_cf.responseText,"::");		  		
		  		document.getElementById('handler_div_cf').innerHTML=res_arr[0];

		  		$(document).ready(function(){
				    var myCookie = ' ' + document.cookie + ';';
				    if (res_arr[1]==1) {
				        $('#table_forecast').css('display', 'block');
				        $('#table_friend').css('display', 'none');
				    }
				    if (res_arr[2]==1) {
				        $('#table_forecast').css('display', 'none');
				        $('#table_friend').css('display', 'block');
				    }
				});		  				  		
		    }
		}
	request_h_cf.send(null);
}

function setCookieRightTable(tbl)
{
    var expDate = new Date();
    expDate.setTime(expDate.getTime() + 365*24*60*60*1000);

    if (tbl == 'forecast' || tbl == 'friend') {
        document.cookie = 'right_table='+tbl+'; expires='+expDate.toGMTString()+'; path=/';
    }
}