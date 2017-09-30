var request_h;

function _handler(handler_url,container,im)
{
	if (request_h && request_h.readyState!=0)	request_h.abort();
	request_h=createRequest();
	if (!request_h) return false;

	var rnd=Math.random(0,100);
	var container_div='';

	if ('_'+container!='_undefined') container_div='_'+container;
	if (im)
		document.getElementById('handler_div_im'+container_div).style.display='inline';

	handler_url = handler_url+'&rnd='+rnd+(typeof(xsrftoken) != "undefined" ? "&token="+xsrftoken : "")
	request_h.open("GET", handler_url, true);
	request_h.onreadystatechange =
		function x_handler()
		{
			if (request_h.readyState == 4)
		  	if (request_h.status == 200){
		  		document.getElementById('handler_div'+container_div).innerHTML=request_h.responseText;
		  		if (im)
		  			document.getElementById('handler_div_im'+container_div).style.display='none';
		    }
		}
	request_h.send(null);
}